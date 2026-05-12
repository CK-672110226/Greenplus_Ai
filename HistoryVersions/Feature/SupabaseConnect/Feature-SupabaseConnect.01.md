# Feature-SupabaseConnect.01

**Date:** 12 May 2026 (12 พฤษภาคม 2569)

## Overview
Created full Supabase database schema as SQL migration files, covering all tables, indexes, RLS policies, materialized views, and seed data defined in the PRD.

## Reason
All feature branches (AI Scanner, Basket, Marketplace, Buyer Dashboard, etc.) depend on this schema. Having it as versioned migration files means any developer can run `supabase db push` to provision a fresh database that exactly matches the PRD.

## Changes

### `supabase/migrations/20260512000001_core_tables.sql`
- `waste_items` — pricing reference with auto-computed grade B/C prices (GENERATED ALWAYS)
- `user_profiles` — 1:1 with auth.users, role enum check
- `shops` — buyer-owned shops with accepts[], status, location
- `scan_history` — per-scan record including factor_scores (jsonb) and weighted_score
- `marketplace_posts` — listings with status and flag
- `grading_criteria` — admin-tunable per-material factor weights with hard-reject thresholds

### `supabase/migrations/20260512000002_calendar_booking.sql`
- `shop_hours` — weekly schedule per shop (UNIQUE on shop_id + day_of_week)
- `shop_closures` — one-time, multi-day, and recurring closure rules
- `time_slots` — pre-generated bookable windows (UNIQUE on shop_id + date + start_time)
- `bookings` — seller drop-off bookings with materials jsonb and status lifecycle

### `supabase/migrations/20260512000003_ai_model.sql`
- `training_images` — labeled images uploaded by admin for model training
- `model_versions` — one row per trained ONNX, status: draft | active | deprecated
- `training_jobs` — job tracking for external Colab/script training runs

### `supabase/migrations/20260512000004_indexes.sql`
- 14 indexes covering all query patterns from PRD Section 16.3 and 18.4
- All O(log n) access patterns confirmed

### `supabase/migrations/20260512000005_rls.sql`
- RLS enabled on all 13 tables
- `is_admin()` helper function to avoid repeating admin check inline
- Policies match exactly the access matrix in PRD Section 16.4

### `supabase/migrations/20260512000006_views.sql`
- `user_eco_stats` materialized view — total scans, value, weight per user
- `shop_booking_stats` materialized view — daily pending/confirmed counts per shop
- Unique indexes on both views for fast refresh

### `supabase/seed.sql`
- 8 waste_items rows with Chiang Mai May 2026 market prices
- grading_criteria rows for PET, Aluminium, Cardboard, Copper (weights from PRD Section 4.4)

## Validation
- [ ] `supabase db push` on a fresh project applies all 6 migrations without error
- [ ] `supabase db seed` inserts 8 waste_items + 16 grading_criteria rows
- [ ] Test SELECT on waste_items as anon user → rows returned (RLS allows)
- [ ] Test INSERT on waste_items as non-admin → permission denied
- [ ] Test SELECT own user_profile row → row returned; other user's row → empty

## Notes
- `price_grade_b` and `price_grade_c` are GENERATED ALWAYS columns (0.75× and 0.40× of grade_a) — never set them manually
- `is_admin()` uses `STABLE` function to allow planner optimization
- Materialized views must be refreshed via Edge Function (not a cron job) to stay within Supabase free tier
- Calendar slots are pre-generated nightly, not computed on-demand, to keep booking queries O(1)
