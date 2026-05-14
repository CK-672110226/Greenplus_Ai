-- GreenPlus Ai — AI Multi-Factor Grading & Basket Updates
-- This migration adds multi-factor grading support and shop calendars.

-- 1. Create grading_criteria table (from PRD 4.8)
create table public.grading_criteria (
  id               uuid primary key default gen_random_uuid(),
  material_type    text not null references public.waste_items(material_type) on delete cascade,
  factor_key       text not null,       -- 'cleanliness', 'moisture', 'color', etc.
  factor_name_th   text not null,
  factor_name_en   text not null,
  weight           numeric(4,3) not null check (weight > 0 and weight <= 1),
  hard_reject_min  numeric(4,1),        -- score below this = REJECT
  sort_order       smallint default 0,
  unique (material_type, factor_key)
);

alter table public.grading_criteria enable row level security;

create policy "Anyone can read grading criteria"
  on public.grading_criteria for select
  using (true);

create policy "Admins can manage grading criteria"
  on public.grading_criteria for all
  using (public.current_user_role() = 'admin');

-- 2. Add AI fields to scan_history
alter table public.scan_history 
  add column if not exists factor_scores jsonb,
  add column if not exists weighted_score numeric(5,1);

-- 3. Add calendar / open_days to shops (for PRD User Story B-04)
alter table public.shops
  add column if not exists open_days integer[] default '{1,2,3,4,5,6}', -- 0=Sun, 1=Mon...
  add column if not exists is_open boolean default true;
