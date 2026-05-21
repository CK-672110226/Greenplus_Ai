-- GreenPlus Ai — Chiang Mai Suthep/Nimman Area Seed Data
-- Self-contained: uses fixed UUIDs, safe to run multiple times.
-- Run after 001_init.sql and after waste_items are seeded.

-- ── Owner profile (fixed buyer UUID) ─────────────────────────────
-- Note: auth.users row must exist first (create via Supabase Auth dashboard
-- with email e.g. buyer_seed@greenplus.test, then run this file).
-- If the profile already exists this is a no-op.
insert into public.user_profiles (id, role, display_name, language_pref, eco_points)
values ('00000000-0000-0000-0000-000000000099', 'buyer', 'Seed Buyer Account', 'th', 0)
on conflict (id) do nothing;

-- ── Shops ─────────────────────────────────────────────────────────
insert into public.shops (id, owner_id, name, area, lat, lng, accepts, status) values

  -- 1. Nimman area
  ('a1000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000099',
   'ร้านรับซื้อของเก่าเฮียหมู',
   'นิมมานเหมินท์',
   18.8012, 98.9681,
   array['aluminum_can', 'pet_bottle_clear', 'mixed_plastic'],
   'active'),

  -- 2. Suthep area
  ('a1000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000099',
   'ไฮเทครีไซเคิล',
   'สุเทพ',
   18.7921, 98.9744,
   array['cardboard', 'newspaper', 'pet_bottle_clear'],
   'active'),

  -- 3. Chang Phueak area
  ('a1000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000099',
   'ร้านรับซื้อทองเหลือง สมชาย',
   'ช้างเผือก',
   18.7964, 98.9921,
   array['copper', 'aluminum_can'],
   'active'),

  -- 4. Hang Dong area
  ('a1000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000099',
   'ร้านเก็บกาก แม่หมาน',
   'หางดง',
   18.7651, 98.9601,
   array['glass', 'cooking_oil', 'mixed_plastic'],
   'active'),

  -- 5. Mueang area — GreenPlus flagship (all main materials)
  ('a1000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000099',
   'กรีนพลัส รีไซเคิล',
   'เมือง',
   18.7884, 98.9853,
   array['aluminum_can', 'pet_bottle_clear', 'cardboard', 'newspaper', 'mixed_plastic', 'copper'],
   'active'),

  -- 6. San Kamphaeng area
  ('a1000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000099',
   'ร้านซื้อขายเศษเหล็ก ชัยมงคล',
   'สันกำแพง',
   18.7793, 99.0119,
   array['copper', 'aluminum_can', 'mixed_plastic'],
   'active')

on conflict (id) do nothing;

-- ── shop_pricing ──────────────────────────────────────────────────
-- Base prices (per kg) from waste_items reference:
--   pet_bottle_clear : 8.00
--   aluminum_can     : 40.00
--   cardboard        : 3.00
--   newspaper        : 2.00
--   mixed_plastic    : 5.00
--   copper           : 200.00
--   glass            : 1.00
--   cooking_oil      : 12.00

-- Shop 1: ร้านรับซื้อของเก่าเฮียหมู
insert into public.shop_pricing (shop_id, material_type, price_per_kg) values
  ('a1000000-0000-0000-0000-000000000001', 'aluminum_can',      40.00),
  ('a1000000-0000-0000-0000-000000000001', 'pet_bottle_clear',   8.00),
  ('a1000000-0000-0000-0000-000000000001', 'mixed_plastic',      5.00)
on conflict (shop_id, material_type) do nothing;

-- Shop 2: ไฮเทครีไซเคิล
insert into public.shop_pricing (shop_id, material_type, price_per_kg) values
  ('a1000000-0000-0000-0000-000000000002', 'cardboard',          3.00),
  ('a1000000-0000-0000-0000-000000000002', 'newspaper',          2.00),
  ('a1000000-0000-0000-0000-000000000002', 'pet_bottle_clear',   8.00)
on conflict (shop_id, material_type) do nothing;

-- Shop 3: ร้านรับซื้อทองเหลือง สมชาย
insert into public.shop_pricing (shop_id, material_type, price_per_kg) values
  ('a1000000-0000-0000-0000-000000000003', 'copper',           200.00),
  ('a1000000-0000-0000-0000-000000000003', 'aluminum_can',      40.00)
on conflict (shop_id, material_type) do nothing;

-- Shop 4: ร้านเก็บกาก แม่หมาน
insert into public.shop_pricing (shop_id, material_type, price_per_kg) values
  ('a1000000-0000-0000-0000-000000000004', 'glass',              1.00),
  ('a1000000-0000-0000-0000-000000000004', 'cooking_oil',       12.00),
  ('a1000000-0000-0000-0000-000000000004', 'mixed_plastic',      5.00)
on conflict (shop_id, material_type) do nothing;

-- Shop 5: กรีนพลัส รีไซเคิล
insert into public.shop_pricing (shop_id, material_type, price_per_kg) values
  ('a1000000-0000-0000-0000-000000000005', 'aluminum_can',      40.00),
  ('a1000000-0000-0000-0000-000000000005', 'pet_bottle_clear',   8.00),
  ('a1000000-0000-0000-0000-000000000005', 'cardboard',          3.00),
  ('a1000000-0000-0000-0000-000000000005', 'newspaper',          2.00),
  ('a1000000-0000-0000-0000-000000000005', 'mixed_plastic',      5.00),
  ('a1000000-0000-0000-0000-000000000005', 'copper',           200.00)
on conflict (shop_id, material_type) do nothing;

-- Shop 6: ร้านซื้อขายเศษเหล็ก ชัยมงคล
insert into public.shop_pricing (shop_id, material_type, price_per_kg) values
  ('a1000000-0000-0000-0000-000000000006', 'copper',           200.00),
  ('a1000000-0000-0000-0000-000000000006', 'aluminum_can',      40.00),
  ('a1000000-0000-0000-0000-000000000006', 'mixed_plastic',      5.00)
on conflict (shop_id, material_type) do nothing;
