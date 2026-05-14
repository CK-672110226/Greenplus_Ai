-- GreenPlus Ai — RLS Performance + Missing Index Hardening
-- Run after 003_public_stats.sql
--
-- Issues fixed:
--   (a) auth.uid() called per-row in RLS USING expressions → wrapped in (select auth.uid())
--       to allow Postgres to evaluate it once per query (5–10x faster on large tables).
--   (b) shops.owner_id FK had no index → full table scan on every buyer policy check.
--   (c) marketplace_posts.user_id FK had no index → full table scan on every user post query.
--   (d) shops.accepts text[] had no GIN index → array containment queries (@>) did seq scans.
--   (e) bookings lacked composite indexes for the most common buyer/seller filter patterns.
--   (f) Append-only time-series columns lacked BRIN indexes (B-tree is 100× larger for these).

-- ── 1. Rewrap auth.uid() in all per-row RLS policies ─────────────────────────
-- Supabase best practice: wrap auth.uid() in (select auth.uid()) so the planner
-- evaluates it as an InitPlan (once per query) rather than a per-row function call.

-- user_profiles
drop policy if exists "Users can read their own profile"  on public.user_profiles;
drop policy if exists "Users can update their own profile" on public.user_profiles;
drop policy if exists "Users can insert own profile"       on public.user_profiles;

create policy "Users can read their own profile"
  on public.user_profiles for select
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using ((select auth.uid()) = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check ((select auth.uid()) = id);

-- shops
drop policy if exists "Buyers can manage own shop" on public.shops;

create policy "Buyers can manage own shop"
  on public.shops for all
  using (owner_id = (select auth.uid()));

-- scan_history
drop policy if exists "Users can read own scan history" on public.scan_history;
drop policy if exists "Users can insert own scans"      on public.scan_history;

create policy "Users can read own scan history"
  on public.scan_history for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own scans"
  on public.scan_history for insert
  with check ((select auth.uid()) = user_id);

-- marketplace_posts
drop policy if exists "Users can manage own posts" on public.marketplace_posts;

create policy "Users can manage own posts"
  on public.marketplace_posts for all
  using ((select auth.uid()) = user_id);

-- bookings
drop policy if exists "Sellers can read own bookings"           on public.bookings;
drop policy if exists "Sellers can create bookings"             on public.bookings;
drop policy if exists "Buyers can read bookings for their shop" on public.bookings;
drop policy if exists "Buyers can update booking status"        on public.bookings;

create policy "Sellers can read own bookings"
  on public.bookings for select
  using ((select auth.uid()) = seller_id);

create policy "Sellers can create bookings"
  on public.bookings for insert
  with check ((select auth.uid()) = seller_id);

create policy "Buyers can read bookings for their shop"
  on public.bookings for select
  using (exists (
    select 1 from public.shops s
    where s.id = shop_id and s.owner_id = (select auth.uid())
  ));

create policy "Buyers can update booking status"
  on public.bookings for update
  using (exists (
    select 1 from public.shops s
    where s.id = shop_id and s.owner_id = (select auth.uid())
  ));

-- eco_point_ledger
drop policy if exists "Users can read own ledger" on public.eco_point_ledger;

create policy "Users can read own ledger"
  on public.eco_point_ledger for select
  using ((select auth.uid()) = user_id);

-- shop_pricing
drop policy if exists "Buyers can manage own shop pricing" on public.shop_pricing;

create policy "Buyers can manage own shop pricing"
  on public.shop_pricing for all
  using (exists (
    select 1 from public.shops s
    where s.id = shop_id and s.owner_id = (select auth.uid())
  ));

-- ── 2. Missing FK indexes ────────────────────────────────────────────────────

-- shops.owner_id: buyer RLS policies and shop_pricing subquery both filter on this.
-- Without an index every buyer action scanned the full shops table.
create index if not exists idx_shops_owner_id
  on public.shops (owner_id);

-- marketplace_posts.user_id: "Users can manage own posts" policy and own-post queries.
create index if not exists idx_marketplace_posts_user_id
  on public.marketplace_posts (user_id);

-- ── 3. GIN index for shops.accepts array containment ────────────────────────
-- Map page and basket routing do: accepts @> ARRAY['plastic'] etc.
-- B-tree cannot optimize @> operator on arrays; GIN can.
create index if not exists idx_shops_accepts_gin
  on public.shops using gin (accepts);

-- ── 4. Composite indexes for filtered booking queries ────────────────────────
-- Buyers most often ask: "show me pending bookings for my shop"
-- Sellers most often ask: "show me my pending bookings"
-- Composite indexes let these use index-only scans without heap fetches.
create index if not exists idx_bookings_shop_id_status
  on public.bookings (shop_id, status);

create index if not exists idx_bookings_seller_id_status
  on public.bookings (seller_id, status);

-- ── 5. BRIN indexes for append-only time-series columns ─────────────────────
-- BRIN is 100–1000x smaller than B-tree for physically-ordered (append-only) data.
-- These tables only ever INSERT, never UPDATE older rows — ideal for BRIN.

create index if not exists idx_scan_history_scanned_brin
  on public.scan_history using brin (scanned_at);

create index if not exists idx_marketplace_posts_created_brin
  on public.marketplace_posts using brin (created_at);

create index if not exists idx_bookings_created_brin
  on public.bookings using brin (created_at);

create index if not exists idx_eco_point_ledger_created_brin
  on public.eco_point_ledger using brin (created_at);
