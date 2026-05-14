-- GreenPlus Ai — RLS Hardening + Performance Indexes + Auth Trigger
-- Run after 001_init.sql
-- Fixes: admin RLS infinite recursion, missing INSERT policy, missing indexes

-- ── 1. Security-definer helper (breaks RLS infinite recursion) ────────────
-- Admin RLS policies that call SELECT on user_profiles FROM WITHIN a
-- user_profiles policy cause infinite recursion in PostgreSQL.
-- This SECURITY DEFINER function bypasses RLS when reading the caller's role.
create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.user_profiles where id = auth.uid()
$$;

-- ── 2. Fix admin policies — replace recursive subqueries with the helper ──

-- user_profiles: admin read
drop policy if exists "Admins can read all profiles" on public.user_profiles;
create policy "Admins can read all profiles"
  on public.user_profiles for select
  using (public.current_user_role() = 'admin');

-- user_profiles: admin write (needed for role changes via Admin panel)
drop policy if exists "Admins can update any profile" on public.user_profiles;
create policy "Admins can update any profile"
  on public.user_profiles for update
  using (public.current_user_role() = 'admin');

-- shops: admin manage
drop policy if exists "Admins can manage all shops" on public.shops;
create policy "Admins can manage all shops"
  on public.shops for all
  using (public.current_user_role() = 'admin');

-- marketplace_posts: admin remove/flag
drop policy if exists "Admins can remove posts" on public.marketplace_posts;
create policy "Admins can remove posts"
  on public.marketplace_posts for update
  using (public.current_user_role() = 'admin');

-- ── 3. Add missing INSERT policy for user_profiles ────────────────────────
-- Without this, email/password signups cannot create their own profile row.
drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- ── 4. Performance indexes ────────────────────────────────────────────────
-- Supabase only creates indexes for primary keys by default.
-- Foreign keys and commonly-filtered columns need explicit indexes.

-- scan_history: most queries filter by user_id, order by scanned_at
create index if not exists idx_scan_history_user_id
  on public.scan_history (user_id);
create index if not exists idx_scan_history_user_scanned
  on public.scan_history (user_id, scanned_at desc);

-- marketplace_posts: landing page filter by status='active'
create index if not exists idx_marketplace_posts_status
  on public.marketplace_posts (status)
  where status = 'active';

-- bookings: seller reads own bookings; buyer reads shop bookings
create index if not exists idx_bookings_seller_id
  on public.bookings (seller_id);
create index if not exists idx_bookings_shop_id
  on public.bookings (shop_id);

-- eco_point_ledger: user reads own ledger, ordered by created_at
create index if not exists idx_eco_point_ledger_user
  on public.eco_point_ledger (user_id, created_at desc);

-- shops: map page reads active shops
create index if not exists idx_shops_status
  on public.shops (status)
  where status = 'active';

-- shop_pricing: buyer fetches pricing for their shop
create index if not exists idx_shop_pricing_shop_id
  on public.shop_pricing (shop_id);

-- ── 5. Auto-create user_profile on auth.users INSERT ─────────────────────
-- Eliminates the race condition in useAuth.js where the profile might not
-- exist by the time the browser calls fetchOrCreateProfile.
-- Role is always 'user' on creation — admins update it via Admin panel.
-- 'buyer' can be set from user metadata (safe: only 'user'/'buyer' allowed).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  -- Allow 'buyer' from signup metadata; never allow 'admin' from client
  v_role := coalesce(new.raw_user_meta_data->>'pending_role', 'user');
  if v_role not in ('user', 'buyer') then
    v_role := 'user';
  end if;

  insert into public.user_profiles (id, role, display_name, language_pref, eco_points)
  values (
    new.id,
    v_role,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    'th',
    0
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
