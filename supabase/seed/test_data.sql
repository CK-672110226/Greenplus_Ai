-- GreenPlus Ai — Test / Seed Data
-- Run after 001_init.sql to populate dev/test environment

-- ── Reference: waste items ────────────────────────────────────────
insert into public.waste_items (material_type, name_en, name_th, base_price) values
  ('pet_bottle_clear', 'PET Bottle (Clear)',  'ขวด PET ใส',      8.00),
  ('aluminum_can',     'Aluminum Can',         'กระป๋องอลูมิเนียม', 40.00),
  ('cardboard',        'Cardboard',            'กล่องกระดาษ',      3.00),
  ('newspaper',        'Newspaper',            'หนังสือพิมพ์',      2.00),
  ('mixed_plastic',    'Mixed Plastic',        'พลาสติกรวม',       5.00),
  ('copper',           'Copper',               'ทองแดง',          200.00),
  ('glass',            'Glass',                'แก้ว',             1.00),
  ('cooking_oil',      'Cooking Oil',          'น้ำมันพืชใช้แล้ว',  12.00)
on conflict (material_type) do nothing;

-- ── Demo users (insert via Supabase Auth dashboard, then run these) ──
-- Replace UUIDs below with real auth.users IDs after creating accounts

-- Demo user (seller) — create via Supabase Auth with email: user@greenplus.test
-- insert into public.user_profiles (id, role, display_name, language_pref, eco_points)
-- values ('00000000-0000-0000-0000-000000000001', 'user', 'ณัฐวุฒิ ใจดี', 'th', 47);

-- Demo buyer (shop) — email: buyer@greenplus.test
-- insert into public.user_profiles (id, role, display_name, language_pref, eco_points)
-- values ('00000000-0000-0000-0000-000000000002', 'buyer', 'เฮียอ้วน', 'th', 0);

-- Demo admin — email: admin@greenplus.test
-- insert into public.user_profiles (id, role, display_name, language_pref, eco_points)
-- values ('00000000-0000-0000-0000-000000000003', 'admin', 'Admin CMU', 'en', 0);

-- ── Demo shops ────────────────────────────────────────────────────
-- Run after inserting demo buyer profile (replace owner_id UUID)
-- insert into public.shops (owner_id, name, area, lat, lng, accepts, status) values
--   ('00000000-0000-0000-0000-000000000002', 'เฮียอ้วน รีไซเคิล', 'นิมมานเหมินท์', 18.7955, 98.9963,
--    array['aluminum_can','pet_bottle_clear','mixed_plastic'], 'active'),
--   ('00000000-0000-0000-0000-000000000002', 'ร้านบุญชู', 'สุเทพ', 18.7920, 98.9780,
--    array['cardboard','newspaper','mixed_plastic'], 'active');

-- ── Quick-start SQL for Supabase SQL Editor ───────────────────────
-- 1. Open Supabase project → SQL Editor
-- 2. Paste and run 001_init.sql
-- 3. Create 3 test users in Authentication → Users:
--      user@greenplus.test    (password: Test1234!)
--      buyer@greenplus.test   (password: Test1234!)
--      admin@greenplus.test   (password: Test1234!)
-- 4. Note their UUIDs, replace the placeholders above and run this file
-- 5. In LandingPage, pick the matching role and sign in

-- ── Eco point entries for demo user ──────────────────────────────
-- insert into public.eco_point_ledger (user_id, points, reason) values
--   ('00000000-0000-0000-0000-000000000001', 5,  'Scanned aluminum_can'),
--   ('00000000-0000-0000-0000-000000000001', 2,  'Scanned cardboard'),
--   ('00000000-0000-0000-0000-000000000001', 10, 'Completed order #1001'),
--   ('00000000-0000-0000-0000-000000000001', 5,  'Scanned copper'),
--   ('00000000-0000-0000-0000-000000000001', 2,  'Scanned mixed_plastic');

-- ── Marketplace posts ─────────────────────────────────────────────
-- insert into public.marketplace_posts (user_id, material_type, quantity_kg, price_per_kg) values
--   ('00000000-0000-0000-0000-000000000001', 'aluminum_can',     50,  48.0),
--   ('00000000-0000-0000-0000-000000000001', 'copper',           10, 240.0),
--   ('00000000-0000-0000-0000-000000000001', 'cardboard',       200,   3.0),
--   ('00000000-0000-0000-0000-000000000001', 'pet_bottle_clear', 80,   9.6);
