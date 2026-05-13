-- GreenPlus Ai — Initial Schema
-- Run once on a fresh Supabase project

-- ── Extensions ───────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── user_profiles ────────────────────────────────────────────────
create table public.user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null default 'user' check (role in ('user','buyer','admin')),
  display_name  text,
  language_pref text not null default 'th' check (language_pref in ('th','en')),
  eco_points    integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can read their own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.user_profiles for select
  using (exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- ── shops ─────────────────────────────────────────────────────────
create table public.shops (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid references public.user_profiles(id) on delete cascade,
  name            text not null,
  area            text,
  lat             double precision,
  lng             double precision,
  accepts         text[] not null default '{}',
  status          text not null default 'pending' check (status in ('pending','active','rejected')),
  created_at      timestamptz not null default now()
);

alter table public.shops enable row level security;

create policy "Anyone can read active shops"
  on public.shops for select
  using (status = 'active');

create policy "Buyers can manage own shop"
  on public.shops for all
  using (owner_id = auth.uid());

create policy "Admins can manage all shops"
  on public.shops for all
  using (exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- ── waste_items (reference prices) ──────────────────────────────
create table public.waste_items (
  id            uuid primary key default uuid_generate_v4(),
  material_type text not null unique,
  name_en       text not null,
  name_th       text not null,
  base_price    numeric(10,2) not null,
  created_at    timestamptz not null default now()
);

alter table public.waste_items enable row level security;

create policy "Anyone can read waste items"
  on public.waste_items for select
  using (true);

-- ── scan_history ─────────────────────────────────────────────────
create table public.scan_history (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.user_profiles(id) on delete cascade,
  material_type     text not null,
  grade             text not null check (grade in ('A','B','C','REJECTED')),
  weight_kg         numeric(8,3),
  price_per_kg      numeric(10,2),
  calculated_value  numeric(10,2),
  confidence        numeric(4,2),
  ai_source         text default 'mock',
  scanned_at        timestamptz not null default now()
);

alter table public.scan_history enable row level security;

create policy "Users can read own scan history"
  on public.scan_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own scans"
  on public.scan_history for insert
  with check (auth.uid() = user_id);

-- ── marketplace_posts ────────────────────────────────────────────
create table public.marketplace_posts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.user_profiles(id) on delete cascade,
  title         text,
  material_type text not null,
  grade         text not null check (grade in ('A','B','C')),
  quantity_kg   numeric(10,2) not null,
  price_per_kg  numeric(10,2) not null,
  status        text not null default 'active' check (status in ('active','sold','removed')),
  created_at    timestamptz not null default now()
);

alter table public.marketplace_posts enable row level security;

create policy "Anyone can read active posts"
  on public.marketplace_posts for select
  using (status = 'active');

create policy "Users can manage own posts"
  on public.marketplace_posts for all
  using (auth.uid() = user_id);

create policy "Admins can remove posts"
  on public.marketplace_posts for update
  using (exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- ── bookings ─────────────────────────────────────────────────────
create table public.bookings (
  id            uuid primary key default uuid_generate_v4(),
  seller_id     uuid not null references public.user_profiles(id),
  shop_id       uuid not null references public.shops(id),
  material_type text not null,
  grade         text not null,
  weight_kg     numeric(8,3),
  status        text not null default 'pending' check (status in ('pending','accepted','rejected','completed')),
  scheduled_at  timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "Sellers can read own bookings"
  on public.bookings for select
  using (auth.uid() = seller_id);

create policy "Sellers can create bookings"
  on public.bookings for insert
  with check (auth.uid() = seller_id);

create policy "Buyers can read bookings for their shop"
  on public.bookings for select
  using (exists (
    select 1 from public.shops s
    where s.id = shop_id and s.owner_id = auth.uid()
  ));

create policy "Buyers can update booking status"
  on public.bookings for update
  using (exists (
    select 1 from public.shops s
    where s.id = shop_id and s.owner_id = auth.uid()
  ));

-- ── eco_point_ledger ─────────────────────────────────────────────
create table public.eco_point_ledger (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.user_profiles(id) on delete cascade,
  points      integer not null,
  reason      text not null,
  ref_id      uuid,
  created_at  timestamptz not null default now()
);

alter table public.eco_point_ledger enable row level security;

create policy "Users can read own ledger"
  on public.eco_point_ledger for select
  using (auth.uid() = user_id);

-- ── shop_pricing (buyer-configurable per material) ───────────────
create table public.shop_pricing (
  id            uuid primary key default uuid_generate_v4(),
  shop_id       uuid not null references public.shops(id) on delete cascade,
  material_type text not null,
  price_grade_a numeric(10,2),
  price_grade_b numeric(10,2),
  price_grade_c numeric(10,2),
  updated_at    timestamptz not null default now(),
  unique (shop_id, material_type)
);

alter table public.shop_pricing enable row level security;

create policy "Anyone can read shop pricing"
  on public.shop_pricing for select
  using (true);

create policy "Buyers can manage own shop pricing"
  on public.shop_pricing for all
  using (exists (
    select 1 from public.shops s
    where s.id = shop_id and s.owner_id = auth.uid()
  ));
