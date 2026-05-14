# Fix-DBPerformance.00

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Database performance hardening based on Supabase Postgres best practices audit. Three classes of issues: `auth.uid()` called per-row in RLS policies, missing FK indexes, and missing GIN/BRIN indexes for array and time-series queries. Fixed in a single migration `004_performance_hardening.sql`.

## Reason

### (a) auth.uid() per-row evaluation — HIGH impact
All 12 `USING`/`WITH CHECK` clauses in 001_init.sql called `auth.uid()` directly, which Postgres evaluates as a per-row function call (not cached). Supabase best practice (rule 3.3) requires wrapping it in `(select auth.uid())` so the planner treats it as an InitPlan executed once per query. On a table with 10,000 rows this is called 10,000× instead of once — 5–10× slower queries.

### (b) Missing FK index: shops.owner_id — HIGH impact
The buyer RLS policies `"Buyers can manage own shop"` and `"Buyers can manage own shop pricing"` (via subquery) filter `shops.owner_id = auth.uid()`. Without an index, each authenticated buyer request scanned the full `shops` table.

### (c) Missing FK index: marketplace_posts.user_id — HIGH impact
The `"Users can manage own posts"` policy filters `user_id = auth.uid()`. Without an index, every post management operation or user-owned post query scanned the full `marketplace_posts` table.

### (d) Missing GIN index: shops.accepts — MEDIUM impact
The basket routing and Smart Map page filter shops using array containment: `accepts @> ARRAY['plastic']`. B-tree indexes do not support the `@>` operator on arrays. A GIN index is required for these queries to use index scans.

### (e) Missing composite indexes on bookings — MEDIUM impact
The buyer dashboard asks "pending bookings for my shop" and seller asks "my pending bookings". The existing single-column indexes (`idx_bookings_seller_id`, `idx_bookings_shop_id`) from 002 require a second filter step. Composite `(shop_id, status)` and `(seller_id, status)` indexes enable single-pass index-only scans.

### (f) No BRIN indexes on time-series columns — LOW-MEDIUM impact (future scaling)
`scan_history.scanned_at`, `marketplace_posts.created_at`, `bookings.created_at`, `eco_point_ledger.created_at` are append-only and physically ordered — ideal for BRIN indexes. BRIN is 100–1000× smaller than B-tree for these access patterns.

## Changes

### `supabase/migrations/004_performance_hardening.sql` (NEW)

**Section 1 — RLS policy rewrites (12 policies):**
- `user_profiles`: read, update, insert own profile
- `shops`: buyers manage own shop
- `scan_history`: read/insert own scans
- `marketplace_posts`: users manage own posts
- `bookings`: sellers read/insert; buyers read/update for their shop
- `eco_point_ledger`: users read own ledger
- `shop_pricing`: buyers manage own shop pricing

Pattern: `using (auth.uid() = col)` → `using ((select auth.uid()) = col)`

Note: The four policies added/updated in `002_rls_hardening.sql` (`current_user_role()` based) were not changed — that SQL function is already `STABLE` and inline-able, so it's cached correctly.

**Section 2 — Missing FK indexes:**
- `idx_shops_owner_id` on `shops(owner_id)`
- `idx_marketplace_posts_user_id` on `marketplace_posts(user_id)`

**Section 3 — GIN index:**
- `idx_shops_accepts_gin` on `shops` using `gin(accepts)` — enables `@>` array containment

**Section 4 — Composite indexes for bookings:**
- `idx_bookings_shop_id_status` on `bookings(shop_id, status)`
- `idx_bookings_seller_id_status` on `bookings(seller_id, status)`

**Section 5 — BRIN indexes for time-series:**
- `idx_scan_history_scanned_brin` on `scan_history` using `brin(scanned_at)`
- `idx_marketplace_posts_created_brin` on `marketplace_posts` using `brin(created_at)`
- `idx_bookings_created_brin` on `bookings` using `brin(created_at)`
- `idx_eco_point_ledger_created_brin` on `eco_point_ledger` using `brin(created_at)`

## Validation

- All `DROP POLICY IF EXISTS` + `CREATE POLICY` patterns are idempotent — safe to re-run
- All `CREATE INDEX IF NOT EXISTS` — safe to re-run
- No data modification; no schema changes; only policy and index changes
- Compatible with existing 001/002/003 migrations (no dependencies on 003)

## Notes

The four admin policies in `002_rls_hardening.sql` that use `public.current_user_role()` were intentionally left unchanged. That function is `LANGUAGE SQL STABLE SET SEARCH_PATH = public`, which Postgres inlines — auth.uid() inside it is already evaluated once.

Migration `004` is independent of `003_public_stats.sql` (the stats RPC function). Either can be applied first.
