-- ============================================================
-- GreenPlus Ai — Load Test: 20 Users × 100 Orders
-- ============================================================
-- Users:  2 shop owners (buyer), 5 drivers, 13 customers
-- Shops:  2 shops (1 per owner)
-- Orders: 100 bookings spread across statuses & materials
--
-- HOW TO RUN:
--   Supabase SQL Editor (service_role required for auth.users)
--   OR: supabase db reset (local dev, resets entire local DB)
--
-- Safe to re-run: all inserts use ON CONFLICT DO NOTHING
-- Clean up:       run load_test_cleanup.sql
-- ============================================================

-- ── 0. Extensions ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. Auth users (20 accounts, password = Greenplus2026!) ──
-- Role legend: buyer=shop owner, user=customer, driver=has is_driver flag
DO $$
DECLARE
  _pass text := crypt('Greenplus2026!', gen_salt('bf', 10));
BEGIN
  -- Buyers (2)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    ('b1000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','buyer1@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('b1000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','buyer2@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- Drivers (5)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    ('d1000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','driver1@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('d1000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','driver2@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('d1000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','driver3@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('d1000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','driver4@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('d1000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','driver5@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- Customers (13)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    ('c1000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust01@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('c1000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust02@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('c1000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust03@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('c1000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust04@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('c1000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust05@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('c1000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust06@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('c1000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust07@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('c1000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust08@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('c1000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust09@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('c1000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust10@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('c1000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust11@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('c1000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust12@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('c1000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000000',
     'authenticated','authenticated','cust13@greenplus.test', _pass,
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ── 2. user_profiles ────────────────────────────────────────

-- Buyers / shop owners
INSERT INTO public.user_profiles
  (id, role, display_name, language_pref, eco_points, is_driver, last_seen)
VALUES
  ('b1000000-0000-0000-0000-000000000001','buyer','สมชาย ใจดี','th',0,false, now() - interval '5 min'),
  ('b1000000-0000-0000-0000-000000000002','buyer','มาลี รักสิน','th',0,false, now() - interval '12 min')
ON CONFLICT (id) DO NOTHING;

-- Drivers (role='user' + is_driver=true per schema design)
INSERT INTO public.user_profiles
  (id, role, display_name, language_pref, eco_points,
   is_driver, driver_vehicle, is_online, current_lat, current_lng, last_seen)
VALUES
  ('d1000000-0000-0000-0000-000000000001','user','ณัฐพงษ์ คุ้นกลาง','th',15,
   true,'motorcycle',true, 18.8001, 98.9700, now() - interval '2 min'),
  ('d1000000-0000-0000-0000-000000000002','user','วันชัย ศรีสุข','th',22,
   true,'pickup',false, 18.7950, 98.9760, now() - interval '45 min'),
  ('d1000000-0000-0000-0000-000000000003','user','ประพต รุ่งฤทธิ์','th',8,
   true,'motorcycle',true, 18.7920, 98.9650, now() - interval '1 min'),
  ('d1000000-0000-0000-0000-000000000004','user','ศิริพร ธรรมศาสตร์','th',31,
   true,'truck',false, 18.8050, 98.9800, now() - interval '3 hours'),
  ('d1000000-0000-0000-0000-000000000005','user','กิตติพงษ์ สายชล','th',19,
   true,'pickup',true, 18.7890, 98.9720, now() - interval '8 min')
ON CONFLICT (id) DO NOTHING;

-- Customers (role='user')
INSERT INTO public.user_profiles
  (id, role, display_name, language_pref, eco_points, last_seen)
VALUES
  ('c1000000-0000-0000-0000-000000000001','user','อภิชัย ยิ้มสวย','th', 47, now() - interval '20 min'),
  ('c1000000-0000-0000-0000-000000000002','user','ปิยะนุช แสงทอง','th', 83, now() - interval '1 hour'),
  ('c1000000-0000-0000-0000-000000000003','user','ธีระพล มาดี',   'th', 12, now() - interval '2 days'),
  ('c1000000-0000-0000-0000-000000000004','user','กนกวรรณ ชัยชาญ','th',126, now() - interval '30 min'),
  ('c1000000-0000-0000-0000-000000000005','user','สุรศักดิ์ ดวงดี','th', 55, now() - interval '4 hours'),
  ('c1000000-0000-0000-0000-000000000006','user','พรรณิภา เฉลิมชัย','th',200, now() - interval '10 min'),
  ('c1000000-0000-0000-0000-000000000007','user','ชัยรัตน์ พงษ์พิทักษ์','th', 38, now() - interval '6 hours'),
  ('c1000000-0000-0000-0000-000000000008','user','ลลิตา นวลจันทร์','th', 91, now() - interval '50 min'),
  ('c1000000-0000-0000-0000-000000000009','user','มนตรี ตั้งตรง',  'th', 62, now() - interval '1 day'),
  ('c1000000-0000-0000-0000-000000000010','user','สุภาพร ธรรมมาศ','th',  9, now() - interval '3 hours'),
  ('c1000000-0000-0000-0000-000000000011','user','วิชิต ประสงค์ดี','th', 77, now() - interval '15 min'),
  ('c1000000-0000-0000-0000-000000000012','user','ดาวรุ่ง ฟ้าใส',  'th',144, now() - interval '2 hours'),
  ('c1000000-0000-0000-0000-000000000013','user','พิทักษ์ รุ่งเรือง','th',33, now() - interval '40 min')
ON CONFLICT (id) DO NOTHING;

-- ── 3. Shops (2 shops, 1 per buyer) ─────────────────────────

INSERT INTO public.shops
  (id, owner_id, name, area, lat, lng, accepts, status, opens_at, closes_at)
VALUES
  -- Shop A: สมชาย — นิมมาน, รับซื้อโลหะ+พลาสติก
  ('t1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001',
   'กรีนพลัส นิมมาน',
   'นิมมานเหมินท์',
   18.8012, 98.9681,
   ARRAY['aluminum_can','pet_bottle_clear','mixed_plastic','copper'],
   'active', '08:00', '18:00'),
  -- Shop B: มาลี — สุเทพ, รับซื้อกระดาษ+แก้ว+น้ำมัน
  ('t1000000-0000-0000-0000-000000000002',
   'b1000000-0000-0000-0000-000000000002',
   'กรีนพลัส สุเทพ',
   'สุเทพ',
   18.7921, 98.9744,
   ARRAY['cardboard','newspaper','glass','cooking_oil','mixed_plastic'],
   'active', '07:30', '17:30')
ON CONFLICT (id) DO NOTHING;

-- ── 4. Shop pricing ──────────────────────────────────────────

INSERT INTO public.shop_pricing
  (shop_id, material_type, price_per_kg, cap_kg)
VALUES
  -- Shop A pricing
  ('t1000000-0000-0000-0000-000000000001','aluminum_can',    45.00, 100.00),
  ('t1000000-0000-0000-0000-000000000001','pet_bottle_clear', 9.00, 200.00),
  ('t1000000-0000-0000-0000-000000000001','mixed_plastic',    5.50, 150.00),
  ('t1000000-0000-0000-0000-000000000001','copper',         210.00,  50.00),
  -- Shop B pricing
  ('t1000000-0000-0000-0000-000000000002','cardboard',        3.50, 300.00),
  ('t1000000-0000-0000-0000-000000000002','newspaper',        2.50, 200.00),
  ('t1000000-0000-0000-0000-000000000002','glass',            1.20, 250.00),
  ('t1000000-0000-0000-0000-000000000002','cooking_oil',     13.00,  80.00),
  ('t1000000-0000-0000-0000-000000000002','mixed_plastic',    5.00, 150.00)
ON CONFLICT DO NOTHING;

-- ── 5. Waste items (reference, idempotent) ───────────────────

INSERT INTO public.waste_items (material_type, name_en, name_th, base_price) VALUES
  ('pet_bottle_clear', 'PET Bottle (Clear)',  'ขวด PET ใส',      8.00),
  ('aluminum_can',     'Aluminum Can',         'กระป๋องอลูมิเนียม',40.00),
  ('cardboard',        'Cardboard',            'กล่องกระดาษ',      3.00),
  ('newspaper',        'Newspaper',            'หนังสือพิมพ์',      2.00),
  ('mixed_plastic',    'Mixed Plastic',        'พลาสติกรวม',       5.00),
  ('copper',           'Copper',               'ทองแดง',          200.00),
  ('glass',            'Glass',                'แก้ว',             1.00),
  ('cooking_oil',      'Cooking Oil',          'น้ำมันพืชใช้แล้ว', 12.00)
ON CONFLICT (material_type) DO NOTHING;

-- ── 6. 100 Bookings ──────────────────────────────────────────
-- Distribution:
--   Status:   40 completed, 25 accepted, 20 pending, 15 rejected
--   Shop A:   55 bookings   Shop B: 45 bookings
--   Pickup:   60 dropOff    40 onDemand
--   Drivers assigned on all accepted + 20 completed orders

INSERT INTO public.bookings
  (id, seller_id, shop_id, material_type, weight_kg, status,
   pickup_mode, scheduled_at, assigned_driver_id, driver_assignment_status, created_at)
VALUES

-- ── COMPLETED orders (40) ────────────────────────────────────
-- Shop A, completed, various customers
('f0000000-0000-0000-0001-000000000001','c1000000-0000-0000-0000-000000000001','t1000000-0000-0000-0000-000000000001','aluminum_can',     12.500,'completed','dropOff',  now()-interval '30 days',NULL,                                        'unassigned', now()-interval '31 days'),
('f0000000-0000-0000-0001-000000000002','c1000000-0000-0000-0000-000000000002','t1000000-0000-0000-0000-000000000001','pet_bottle_clear',  8.200,'completed','onDemand', now()-interval '28 days','d1000000-0000-0000-0000-000000000001','accepted',    now()-interval '29 days'),
('f0000000-0000-0000-0001-000000000003','c1000000-0000-0000-0000-000000000003','t1000000-0000-0000-0000-000000000001','mixed_plastic',    22.000,'completed','dropOff',  now()-interval '27 days',NULL,                                        'unassigned', now()-interval '28 days'),
('f0000000-0000-0000-0001-000000000004','c1000000-0000-0000-0000-000000000004','t1000000-0000-0000-0000-000000000001','copper',            3.100,'completed','onDemand', now()-interval '26 days','d1000000-0000-0000-0000-000000000002','accepted',    now()-interval '27 days'),
('f0000000-0000-0000-0001-000000000005','c1000000-0000-0000-0000-000000000005','t1000000-0000-0000-0000-000000000001','aluminum_can',     19.000,'completed','dropOff',  now()-interval '25 days',NULL,                                        'unassigned', now()-interval '26 days'),
('f0000000-0000-0000-0001-000000000006','c1000000-0000-0000-0000-000000000006','t1000000-0000-0000-0000-000000000001','pet_bottle_clear', 14.300,'completed','onDemand', now()-interval '24 days','d1000000-0000-0000-0000-000000000003','accepted',    now()-interval '25 days'),
('f0000000-0000-0000-0001-000000000007','c1000000-0000-0000-0000-000000000007','t1000000-0000-0000-0000-000000000001','mixed_plastic',    30.000,'completed','dropOff',  now()-interval '23 days',NULL,                                        'unassigned', now()-interval '24 days'),
('f0000000-0000-0000-0001-000000000008','c1000000-0000-0000-0000-000000000008','t1000000-0000-0000-0000-000000000001','copper',            1.800,'completed','onDemand', now()-interval '22 days','d1000000-0000-0000-0000-000000000005','accepted',    now()-interval '23 days'),
('f0000000-0000-0000-0001-000000000009','c1000000-0000-0000-0000-000000000009','t1000000-0000-0000-0000-000000000001','aluminum_can',      9.500,'completed','dropOff',  now()-interval '21 days',NULL,                                        'unassigned', now()-interval '22 days'),
('f0000000-0000-0000-0001-000000000010','c1000000-0000-0000-0000-000000000010','t1000000-0000-0000-0000-000000000001','mixed_plastic',    45.000,'completed','dropOff',  now()-interval '20 days',NULL,                                        'unassigned', now()-interval '21 days'),
-- Shop A continued
('f0000000-0000-0000-0001-000000000011','c1000000-0000-0000-0000-000000000011','t1000000-0000-0000-0000-000000000001','aluminum_can',      6.000,'completed','onDemand', now()-interval '19 days','d1000000-0000-0000-0000-000000000001','accepted',    now()-interval '20 days'),
('f0000000-0000-0000-0001-000000000012','c1000000-0000-0000-0000-000000000012','t1000000-0000-0000-0000-000000000001','pet_bottle_clear', 11.200,'completed','dropOff',  now()-interval '18 days',NULL,                                        'unassigned', now()-interval '19 days'),
('f0000000-0000-0000-0001-000000000013','c1000000-0000-0000-0000-000000000013','t1000000-0000-0000-0000-000000000001','copper',            2.400,'completed','onDemand', now()-interval '17 days','d1000000-0000-0000-0000-000000000004','accepted',    now()-interval '18 days'),
('f0000000-0000-0000-0001-000000000014','c1000000-0000-0000-0000-000000000001','t1000000-0000-0000-0000-000000000001','mixed_plastic',    17.500,'completed','dropOff',  now()-interval '16 days',NULL,                                        'unassigned', now()-interval '17 days'),
('f0000000-0000-0000-0001-000000000015','c1000000-0000-0000-0000-000000000002','t1000000-0000-0000-0000-000000000001','aluminum_can',     25.000,'completed','onDemand', now()-interval '15 days','d1000000-0000-0000-0000-000000000002','accepted',    now()-interval '16 days'),
('f0000000-0000-0000-0001-000000000016','c1000000-0000-0000-0000-000000000003','t1000000-0000-0000-0000-000000000001','pet_bottle_clear',  7.800,'completed','dropOff',  now()-interval '14 days',NULL,                                        'unassigned', now()-interval '15 days'),
('f0000000-0000-0000-0001-000000000017','c1000000-0000-0000-0000-000000000004','t1000000-0000-0000-0000-000000000001','copper',            5.600,'completed','onDemand', now()-interval '13 days','d1000000-0000-0000-0000-000000000003','accepted',    now()-interval '14 days'),
('f0000000-0000-0000-0001-000000000018','c1000000-0000-0000-0000-000000000005','t1000000-0000-0000-0000-000000000001','mixed_plastic',    33.000,'completed','dropOff',  now()-interval '12 days',NULL,                                        'unassigned', now()-interval '13 days'),
('f0000000-0000-0000-0001-000000000019','c1000000-0000-0000-0000-000000000006','t1000000-0000-0000-0000-000000000001','aluminum_can',     18.000,'completed','onDemand', now()-interval '11 days','d1000000-0000-0000-0000-000000000005','accepted',    now()-interval '12 days'),
('f0000000-0000-0000-0001-000000000020','c1000000-0000-0000-0000-000000000007','t1000000-0000-0000-0000-000000000001','pet_bottle_clear', 40.000,'completed','dropOff',  now()-interval '10 days',NULL,                                        'unassigned', now()-interval '11 days'),
-- Shop B, completed
('f0000000-0000-0000-0002-000000000001','c1000000-0000-0000-0000-000000000008','t1000000-0000-0000-0000-000000000002','cardboard',        55.000,'completed','dropOff',  now()-interval '30 days',NULL,                                        'unassigned', now()-interval '31 days'),
('f0000000-0000-0000-0002-000000000002','c1000000-0000-0000-0000-000000000009','t1000000-0000-0000-0000-000000000002','newspaper',        28.000,'completed','onDemand', now()-interval '28 days','d1000000-0000-0000-0000-000000000001','accepted',    now()-interval '29 days'),
('f0000000-0000-0000-0002-000000000003','c1000000-0000-0000-0000-000000000010','t1000000-0000-0000-0000-000000000002','glass',            15.500,'completed','dropOff',  now()-interval '26 days',NULL,                                        'unassigned', now()-interval '27 days'),
('f0000000-0000-0000-0002-000000000004','c1000000-0000-0000-0000-000000000011','t1000000-0000-0000-0000-000000000002','cooking_oil',       6.000,'completed','onDemand', now()-interval '24 days','d1000000-0000-0000-0000-000000000002','accepted',    now()-interval '25 days'),
('f0000000-0000-0000-0002-000000000005','c1000000-0000-0000-0000-000000000012','t1000000-0000-0000-0000-000000000002','mixed_plastic',    42.000,'completed','dropOff',  now()-interval '22 days',NULL,                                        'unassigned', now()-interval '23 days'),
('f0000000-0000-0000-0002-000000000006','c1000000-0000-0000-0000-000000000013','t1000000-0000-0000-0000-000000000002','cardboard',        60.000,'completed','onDemand', now()-interval '20 days','d1000000-0000-0000-0000-000000000003','accepted',    now()-interval '21 days'),
('f0000000-0000-0000-0002-000000000007','c1000000-0000-0000-0000-000000000001','t1000000-0000-0000-0000-000000000002','newspaper',        35.000,'completed','dropOff',  now()-interval '18 days',NULL,                                        'unassigned', now()-interval '19 days'),
('f0000000-0000-0000-0002-000000000008','c1000000-0000-0000-0000-000000000002','t1000000-0000-0000-0000-000000000002','glass',            20.000,'completed','onDemand', now()-interval '16 days','d1000000-0000-0000-0000-000000000005','accepted',    now()-interval '17 days'),
('f0000000-0000-0000-0002-000000000009','c1000000-0000-0000-0000-000000000003','t1000000-0000-0000-0000-000000000002','cooking_oil',       9.000,'completed','dropOff',  now()-interval '14 days',NULL,                                        'unassigned', now()-interval '15 days'),
('f0000000-0000-0000-0002-000000000010','c1000000-0000-0000-0000-000000000004','t1000000-0000-0000-0000-000000000002','mixed_plastic',    28.000,'completed','onDemand', now()-interval '12 days','d1000000-0000-0000-0000-000000000004','accepted',    now()-interval '13 days'),
('f0000000-0000-0000-0002-000000000011','c1000000-0000-0000-0000-000000000005','t1000000-0000-0000-0000-000000000002','cardboard',        70.000,'completed','dropOff',  now()-interval '10 days',NULL,                                        'unassigned', now()-interval '11 days'),
('f0000000-0000-0000-0002-000000000012','c1000000-0000-0000-0000-000000000006','t1000000-0000-0000-0000-000000000002','newspaper',        15.000,'completed','onDemand', now()-interval '9 days', 'd1000000-0000-0000-0000-000000000001','accepted',    now()-interval '10 days'),
('f0000000-0000-0000-0002-000000000013','c1000000-0000-0000-0000-000000000007','t1000000-0000-0000-0000-000000000002','glass',             8.000,'completed','dropOff',  now()-interval '8 days', NULL,                                        'unassigned', now()-interval '9 days'),
('f0000000-0000-0000-0002-000000000014','c1000000-0000-0000-0000-000000000008','t1000000-0000-0000-0000-000000000002','cooking_oil',       4.500,'completed','onDemand', now()-interval '7 days', 'd1000000-0000-0000-0000-000000000002','accepted',    now()-interval '8 days'),
('f0000000-0000-0000-0002-000000000015','c1000000-0000-0000-0000-000000000009','t1000000-0000-0000-0000-000000000002','cardboard',        90.000,'completed','dropOff',  now()-interval '6 days', NULL,                                        'unassigned', now()-interval '7 days'),
('f0000000-0000-0000-0002-000000000016','c1000000-0000-0000-0000-000000000010','t1000000-0000-0000-0000-000000000002','mixed_plastic',    50.000,'completed','onDemand', now()-interval '5 days', 'd1000000-0000-0000-0000-000000000003','accepted',    now()-interval '6 days'),
('f0000000-0000-0000-0002-000000000017','c1000000-0000-0000-0000-000000000011','t1000000-0000-0000-0000-000000000002','newspaper',        22.000,'completed','dropOff',  now()-interval '4 days', NULL,                                        'unassigned', now()-interval '5 days'),
('f0000000-0000-0000-0002-000000000018','c1000000-0000-0000-0000-000000000012','t1000000-0000-0000-0000-000000000002','glass',            30.000,'completed','onDemand', now()-interval '3 days', 'd1000000-0000-0000-0000-000000000005','accepted',    now()-interval '4 days'),
('f0000000-0000-0000-0002-000000000019','c1000000-0000-0000-0000-000000000013','t1000000-0000-0000-0000-000000000002','cardboard',        45.000,'completed','dropOff',  now()-interval '2 days', NULL,                                        'unassigned', now()-interval '3 days'),
('f0000000-0000-0000-0002-000000000020','c1000000-0000-0000-0000-000000000001','t1000000-0000-0000-0000-000000000002','cooking_oil',       7.200,'completed','onDemand', now()-interval '1 day',  'd1000000-0000-0000-0000-000000000004','accepted',    now()-interval '2 days'),

-- ── ACCEPTED orders (25) ─────────────────────────────────────
-- Shop A, accepted, with drivers
('f0000000-0000-0000-0003-000000000001','c1000000-0000-0000-0000-000000000002','t1000000-0000-0000-0000-000000000001','aluminum_can',     14.000,'accepted', 'onDemand', now()+interval '2 hours', 'd1000000-0000-0000-0000-000000000001','accepted',    now()-interval '1 hour'),
('f0000000-0000-0000-0003-000000000002','c1000000-0000-0000-0000-000000000003','t1000000-0000-0000-0000-000000000001','pet_bottle_clear',  9.500,'accepted', 'onDemand', now()+interval '3 hours', 'd1000000-0000-0000-0000-000000000003','accepted',    now()-interval '2 hours'),
('f0000000-0000-0000-0003-000000000003','c1000000-0000-0000-0000-000000000004','t1000000-0000-0000-0000-000000000001','copper',            4.200,'accepted', 'dropOff',  now()+interval '1 day',   NULL,                                        'unassigned', now()-interval '3 hours'),
('f0000000-0000-0000-0003-000000000004','c1000000-0000-0000-0000-000000000005','t1000000-0000-0000-0000-000000000001','mixed_plastic',    28.000,'accepted', 'dropOff',  now()+interval '2 days',  NULL,                                        'unassigned', now()-interval '4 hours'),
('f0000000-0000-0000-0003-000000000005','c1000000-0000-0000-0000-000000000006','t1000000-0000-0000-0000-000000000001','aluminum_can',     20.000,'accepted', 'onDemand', now()+interval '4 hours', 'd1000000-0000-0000-0000-000000000005','accepted',    now()-interval '30 min'),
('f0000000-0000-0000-0003-000000000006','c1000000-0000-0000-0000-000000000007','t1000000-0000-0000-0000-000000000001','pet_bottle_clear', 16.000,'accepted', 'dropOff',  now()+interval '3 days',  NULL,                                        'unassigned', now()-interval '5 hours'),
('f0000000-0000-0000-0003-000000000007','c1000000-0000-0000-0000-000000000008','t1000000-0000-0000-0000-000000000001','copper',            2.900,'accepted', 'onDemand', now()+interval '6 hours', 'd1000000-0000-0000-0000-000000000002','invited',     now()-interval '20 min'),
('f0000000-0000-0000-0003-000000000008','c1000000-0000-0000-0000-000000000009','t1000000-0000-0000-0000-000000000001','mixed_plastic',    60.000,'accepted', 'dropOff',  now()+interval '4 days',  NULL,                                        'unassigned', now()-interval '6 hours'),
('f0000000-0000-0000-0003-000000000009','c1000000-0000-0000-0000-000000000010','t1000000-0000-0000-0000-000000000001','aluminum_can',      8.000,'accepted', 'onDemand', now()+interval '5 hours', 'd1000000-0000-0000-0000-000000000001','accepted',    now()-interval '15 min'),
('f0000000-0000-0000-0003-000000000010','c1000000-0000-0000-0000-000000000011','t1000000-0000-0000-0000-000000000001','pet_bottle_clear', 12.000,'accepted', 'dropOff',  now()+interval '5 days',  NULL,                                        'unassigned', now()-interval '7 hours'),
('f0000000-0000-0000-0003-000000000011','c1000000-0000-0000-0000-000000000012','t1000000-0000-0000-0000-000000000001','copper',            6.700,'accepted', 'onDemand', now()+interval '8 hours', 'd1000000-0000-0000-0000-000000000004','accepted',    now()-interval '10 min'),
('f0000000-0000-0000-0003-000000000012','c1000000-0000-0000-0000-000000000013','t1000000-0000-0000-0000-000000000001','mixed_plastic',    35.000,'accepted', 'dropOff',  now()+interval '6 days',  NULL,                                        'unassigned', now()-interval '8 hours'),
-- Shop B, accepted
('f0000000-0000-0000-0003-000000000013','c1000000-0000-0000-0000-000000000001','t1000000-0000-0000-0000-000000000002','cardboard',        80.000,'accepted', 'dropOff',  now()+interval '1 day',   NULL,                                        'unassigned', now()-interval '2 hours'),
('f0000000-0000-0000-0003-000000000014','c1000000-0000-0000-0000-000000000002','t1000000-0000-0000-0000-000000000002','newspaper',        45.000,'accepted', 'onDemand', now()+interval '3 hours', 'd1000000-0000-0000-0000-000000000003','accepted',    now()-interval '45 min'),
('f0000000-0000-0000-0003-000000000015','c1000000-0000-0000-0000-000000000003','t1000000-0000-0000-0000-000000000002','glass',            25.000,'accepted', 'dropOff',  now()+interval '2 days',  NULL,                                        'unassigned', now()-interval '3 hours'),
('f0000000-0000-0000-0003-000000000016','c1000000-0000-0000-0000-000000000004','t1000000-0000-0000-0000-000000000002','cooking_oil',      11.000,'accepted', 'onDemand', now()+interval '4 hours', 'd1000000-0000-0000-0000-000000000005','invited',     now()-interval '25 min'),
('f0000000-0000-0000-0003-000000000017','c1000000-0000-0000-0000-000000000005','t1000000-0000-0000-0000-000000000002','mixed_plastic',    55.000,'accepted', 'dropOff',  now()+interval '3 days',  NULL,                                        'unassigned', now()-interval '4 hours'),
('f0000000-0000-0000-0003-000000000018','c1000000-0000-0000-0000-000000000006','t1000000-0000-0000-0000-000000000002','cardboard',        40.000,'accepted', 'onDemand', now()+interval '6 hours', 'd1000000-0000-0000-0000-000000000001','accepted',    now()-interval '35 min'),
('f0000000-0000-0000-0003-000000000019','c1000000-0000-0000-0000-000000000007','t1000000-0000-0000-0000-000000000002','newspaper',        18.000,'accepted', 'dropOff',  now()+interval '4 days',  NULL,                                        'unassigned', now()-interval '5 hours'),
('f0000000-0000-0000-0003-000000000020','c1000000-0000-0000-0000-000000000008','t1000000-0000-0000-0000-000000000002','glass',            35.000,'accepted', 'onDemand', now()+interval '7 hours', 'd1000000-0000-0000-0000-000000000002','accepted',    now()-interval '40 min'),
('f0000000-0000-0000-0003-000000000021','c1000000-0000-0000-0000-000000000009','t1000000-0000-0000-0000-000000000002','cooking_oil',       8.000,'accepted', 'dropOff',  now()+interval '5 days',  NULL,                                        'unassigned', now()-interval '6 hours'),
('f0000000-0000-0000-0003-000000000022','c1000000-0000-0000-0000-000000000010','t1000000-0000-0000-0000-000000000002','mixed_plastic',    22.000,'accepted', 'onDemand', now()+interval '2 hours', 'd1000000-0000-0000-0000-000000000004','accepted',    now()-interval '55 min'),
('f0000000-0000-0000-0003-000000000023','c1000000-0000-0000-0000-000000000011','t1000000-0000-0000-0000-000000000002','cardboard',       100.000,'accepted', 'dropOff',  now()+interval '6 days',  NULL,                                        'unassigned', now()-interval '7 hours'),
('f0000000-0000-0000-0003-000000000024','c1000000-0000-0000-0000-000000000012','t1000000-0000-0000-0000-000000000002','newspaper',        30.000,'accepted', 'onDemand', now()+interval '9 hours', 'd1000000-0000-0000-0000-000000000003','invited',     now()-interval '5 min'),
('f0000000-0000-0000-0003-000000000025','c1000000-0000-0000-0000-000000000013','t1000000-0000-0000-0000-000000000002','glass',            18.000,'accepted', 'dropOff',  now()+interval '7 days',  NULL,                                        'unassigned', now()-interval '8 hours'),

-- ── PENDING orders (20) ──────────────────────────────────────
-- Shop A
('f0000000-0000-0000-0004-000000000001','c1000000-0000-0000-0000-000000000001','t1000000-0000-0000-0000-000000000001','aluminum_can',     11.000,'pending',  'dropOff',  NULL, NULL,'unassigned', now()-interval '30 min'),
('f0000000-0000-0000-0004-000000000002','c1000000-0000-0000-0000-000000000003','t1000000-0000-0000-0000-000000000001','pet_bottle_clear', 20.000,'pending',  'onDemand', NULL, NULL,'unassigned', now()-interval '15 min'),
('f0000000-0000-0000-0004-000000000003','c1000000-0000-0000-0000-000000000005','t1000000-0000-0000-0000-000000000001','copper',            1.500,'pending',  'dropOff',  NULL, NULL,'unassigned', now()-interval '45 min'),
('f0000000-0000-0000-0004-000000000004','c1000000-0000-0000-0000-000000000007','t1000000-0000-0000-0000-000000000001','mixed_plastic',    38.000,'pending',  'onDemand', NULL, NULL,'unassigned', now()-interval '5 min'),
('f0000000-0000-0000-0004-000000000005','c1000000-0000-0000-0000-000000000009','t1000000-0000-0000-0000-000000000001','aluminum_can',     16.000,'pending',  'dropOff',  NULL, NULL,'unassigned', now()-interval '1 hour'),
('f0000000-0000-0000-0004-000000000006','c1000000-0000-0000-0000-000000000011','t1000000-0000-0000-0000-000000000001','pet_bottle_clear', 30.000,'pending',  'onDemand', NULL, NULL,'unassigned', now()-interval '2 hours'),
('f0000000-0000-0000-0004-000000000007','c1000000-0000-0000-0000-000000000013','t1000000-0000-0000-0000-000000000001','copper',            8.000,'pending',  'dropOff',  NULL, NULL,'unassigned', now()-interval '20 min'),
('f0000000-0000-0000-0004-000000000008','c1000000-0000-0000-0000-000000000002','t1000000-0000-0000-0000-000000000001','mixed_plastic',    50.000,'pending',  'onDemand', NULL, NULL,'unassigned', now()-interval '10 min'),
('f0000000-0000-0000-0004-000000000009','c1000000-0000-0000-0000-000000000004','t1000000-0000-0000-0000-000000000001','aluminum_can',      5.000,'pending',  'dropOff',  NULL, NULL,'unassigned', now()-interval '3 hours'),
('f0000000-0000-0000-0004-000000000010','c1000000-0000-0000-0000-000000000006','t1000000-0000-0000-0000-000000000001','pet_bottle_clear', 25.000,'pending',  'onDemand', NULL, NULL,'unassigned', now()-interval '25 min'),
-- Shop B
('f0000000-0000-0000-0004-000000000011','c1000000-0000-0000-0000-000000000008','t1000000-0000-0000-0000-000000000002','cardboard',        65.000,'pending',  'dropOff',  NULL, NULL,'unassigned', now()-interval '40 min'),
('f0000000-0000-0000-0004-000000000012','c1000000-0000-0000-0000-000000000010','t1000000-0000-0000-0000-000000000002','newspaper',        40.000,'pending',  'onDemand', NULL, NULL,'unassigned', now()-interval '8 min'),
('f0000000-0000-0000-0004-000000000013','c1000000-0000-0000-0000-000000000012','t1000000-0000-0000-0000-000000000002','glass',            12.000,'pending',  'dropOff',  NULL, NULL,'unassigned', now()-interval '1 hour'),
('f0000000-0000-0000-0004-000000000014','c1000000-0000-0000-0000-000000000001','t1000000-0000-0000-0000-000000000002','cooking_oil',       3.500,'pending',  'onDemand', NULL, NULL,'unassigned', now()-interval '12 min'),
('f0000000-0000-0000-0004-000000000015','c1000000-0000-0000-0000-000000000003','t1000000-0000-0000-0000-000000000002','mixed_plastic',    18.000,'pending',  'dropOff',  NULL, NULL,'unassigned', now()-interval '2 hours'),
('f0000000-0000-0000-0004-000000000016','c1000000-0000-0000-0000-000000000005','t1000000-0000-0000-0000-000000000002','cardboard',        75.000,'pending',  'onDemand', NULL, NULL,'unassigned', now()-interval '35 min'),
('f0000000-0000-0000-0004-000000000017','c1000000-0000-0000-0000-000000000007','t1000000-0000-0000-0000-000000000002','newspaper',        20.000,'pending',  'dropOff',  NULL, NULL,'unassigned', now()-interval '55 min'),
('f0000000-0000-0000-0004-000000000018','c1000000-0000-0000-0000-000000000009','t1000000-0000-0000-0000-000000000002','glass',            40.000,'pending',  'onDemand', NULL, NULL,'unassigned', now()-interval '3 min'),
('f0000000-0000-0000-0004-000000000019','c1000000-0000-0000-0000-000000000011','t1000000-0000-0000-0000-000000000002','cooking_oil',       5.000,'pending',  'dropOff',  NULL, NULL,'unassigned', now()-interval '1.5 hours'),
('f0000000-0000-0000-0004-000000000020','c1000000-0000-0000-0000-000000000013','t1000000-0000-0000-0000-000000000002','mixed_plastic',    80.000,'pending',  'onDemand', NULL, NULL,'unassigned', now()-interval '18 min'),

-- ── REJECTED orders (15) ─────────────────────────────────────
-- Shop A, rejected
('f0000000-0000-0000-0005-000000000001','c1000000-0000-0000-0000-000000000002','t1000000-0000-0000-0000-000000000001','mixed_plastic',   100.000,'rejected', 'dropOff',  NULL, NULL,'unassigned', now()-interval '20 days'),
('f0000000-0000-0000-0005-000000000002','c1000000-0000-0000-0000-000000000004','t1000000-0000-0000-0000-000000000001','pet_bottle_clear', 50.000,'rejected', 'dropOff',  NULL, NULL,'unassigned', now()-interval '15 days'),
('f0000000-0000-0000-0005-000000000003','c1000000-0000-0000-0000-000000000006','t1000000-0000-0000-0000-000000000001','aluminum_can',     80.000,'rejected', 'onDemand', NULL, NULL,'unassigned', now()-interval '12 days'),
('f0000000-0000-0000-0005-000000000004','c1000000-0000-0000-0000-000000000008','t1000000-0000-0000-0000-000000000001','copper',            0.500,'rejected', 'dropOff',  NULL, NULL,'unassigned', now()-interval '8 days'),
('f0000000-0000-0000-0005-000000000005','c1000000-0000-0000-0000-000000000010','t1000000-0000-0000-0000-000000000001','mixed_plastic',    60.000,'rejected', 'onDemand', NULL, NULL,'unassigned', now()-interval '5 days'),
('f0000000-0000-0000-0005-000000000006','c1000000-0000-0000-0000-000000000012','t1000000-0000-0000-0000-000000000001','pet_bottle_clear', 35.000,'rejected', 'dropOff',  NULL, NULL,'unassigned', now()-interval '3 days'),
('f0000000-0000-0000-0005-000000000007','c1000000-0000-0000-0000-000000000001','t1000000-0000-0000-0000-000000000001','aluminum_can',     70.000,'rejected', 'onDemand', NULL, NULL,'unassigned', now()-interval '1 day'),
-- Shop B, rejected
('f0000000-0000-0000-0005-000000000008','c1000000-0000-0000-0000-000000000003','t1000000-0000-0000-0000-000000000002','cardboard',       120.000,'rejected', 'dropOff',  NULL, NULL,'unassigned', now()-interval '22 days'),
('f0000000-0000-0000-0005-000000000009','c1000000-0000-0000-0000-000000000005','t1000000-0000-0000-0000-000000000002','glass',            25.000,'rejected', 'dropOff',  NULL, NULL,'unassigned', now()-interval '18 days'),
('f0000000-0000-0000-0005-000000000010','c1000000-0000-0000-0000-000000000007','t1000000-0000-0000-0000-000000000002','cooking_oil',       2.000,'rejected', 'onDemand', NULL, NULL,'unassigned', now()-interval '14 days'),
('f0000000-0000-0000-0005-000000000011','c1000000-0000-0000-0000-000000000009','t1000000-0000-0000-0000-000000000002','newspaper',        15.000,'rejected', 'dropOff',  NULL, NULL,'unassigned', now()-interval '10 days'),
('f0000000-0000-0000-0005-000000000012','c1000000-0000-0000-0000-000000000011','t1000000-0000-0000-0000-000000000002','mixed_plastic',    90.000,'rejected', 'onDemand', NULL, NULL,'unassigned', now()-interval '7 days'),
('f0000000-0000-0000-0005-000000000013','c1000000-0000-0000-0000-000000000013','t1000000-0000-0000-0000-000000000002','cardboard',        55.000,'rejected', 'dropOff',  NULL, NULL,'unassigned', now()-interval '4 days'),
('f0000000-0000-0000-0005-000000000014','c1000000-0000-0000-0000-000000000002','t1000000-0000-0000-0000-000000000002','glass',            10.000,'rejected', 'onDemand', NULL, NULL,'unassigned', now()-interval '2 days'),
('f0000000-0000-0000-0005-000000000015','c1000000-0000-0000-0000-000000000004','t1000000-0000-0000-0000-000000000002','cooking_oil',       1.000,'rejected', 'dropOff',  NULL, NULL,'unassigned', now()-interval '12 hours')

ON CONFLICT (id) DO NOTHING;

-- ── 7. Scan history (sample per customer) ───────────────────

INSERT INTO public.scan_history
  (user_id, material_type, weight_kg, price_per_kg, calculated_value, confidence, ai_source, scanned_at)
VALUES
  ('c1000000-0000-0000-0000-000000000001','aluminum_can',     2.500, 45.00, 112.50, 0.96, 'onnx', now()-interval '5 days'),
  ('c1000000-0000-0000-0000-000000000001','pet_bottle_clear', 1.200,  7.50,   9.00, 0.89, 'onnx', now()-interval '3 days'),
  ('c1000000-0000-0000-0000-000000000002','cardboard',       10.000,  3.50,  35.00, 0.94, 'onnx', now()-interval '7 days'),
  ('c1000000-0000-0000-0000-000000000002','newspaper',        5.000,  2.50,  12.50, 0.91, 'onnx', now()-interval '2 days'),
  ('c1000000-0000-0000-0000-000000000003','copper',           0.800,210.00, 168.00, 0.98, 'onnx', now()-interval '4 days'),
  ('c1000000-0000-0000-0000-000000000004','mixed_plastic',    8.000,  4.00,  32.00, 0.85, 'onnx', now()-interval '6 days'),
  ('c1000000-0000-0000-0000-000000000004','aluminum_can',     3.000, 45.00, 135.00, 0.97, 'onnx', now()-interval '1 day'),
  ('c1000000-0000-0000-0000-000000000005','glass',            5.500,  1.20,   6.60, 0.90, 'onnx', now()-interval '8 days'),
  ('c1000000-0000-0000-0000-000000000006','cooking_oil',      2.000, 13.00,  26.00, 0.93, 'onnx', now()-interval '3 days'),
  ('c1000000-0000-0000-0000-000000000007','pet_bottle_clear', 4.500,  9.00,  40.50, 0.95, 'onnx', now()-interval '5 days'),
  ('c1000000-0000-0000-0000-000000000008','cardboard',       15.000,  2.80,  42.00, 0.88, 'onnx', now()-interval '2 days'),
  ('c1000000-0000-0000-0000-000000000009','aluminum_can',     6.000, 38.00, 228.00, 0.92, 'onnx', now()-interval '9 days'),
  ('c1000000-0000-0000-0000-000000000010','copper',           1.200,180.00, 216.00, 0.96, 'onnx', now()-interval '4 days'),
  ('c1000000-0000-0000-0000-000000000011','mixed_plastic',   12.000,  5.50,  66.00, 0.93, 'onnx', now()-interval '6 days'),
  ('c1000000-0000-0000-0000-000000000012','glass',            8.000,  1.20,   9.60, 0.87, 'onnx', now()-interval '3 days'),
  ('c1000000-0000-0000-0000-000000000013','newspaper',        7.000,  2.00,  14.00, 0.89, 'onnx', now()-interval '7 days');

-- ── 8. Marketplace posts ─────────────────────────────────────

INSERT INTO public.marketplace_posts
  (user_id, material_type, quantity_kg, price_per_kg, status)
VALUES
  ('c1000000-0000-0000-0000-000000000004','aluminum_can',     50.0, 48.00, 'active'),
  ('c1000000-0000-0000-0000-000000000006','copper',           10.0,240.00, 'active'),
  ('c1000000-0000-0000-0000-000000000002','cardboard',       200.0,  3.00, 'active'),
  ('c1000000-0000-0000-0000-000000000008','pet_bottle_clear', 80.0,  9.60, 'active'),
  ('c1000000-0000-0000-0000-000000000011','mixed_plastic',   120.0,  4.50, 'active'),
  ('c1000000-0000-0000-0000-000000000012','glass',            60.0,  1.20, 'active'),
  ('c1000000-0000-0000-0000-000000000009','newspaper',        40.0,  2.50, 'sold'),
  ('c1000000-0000-0000-0000-000000000003','cooking_oil',       8.0, 13.00, 'active');

-- ── 9. Eco point ledger (completed order rewards) ────────────

INSERT INTO public.eco_point_ledger (user_id, points, reason)
SELECT
  b.seller_id,
  CASE b.material_type
    WHEN 'copper'       THEN 10
    WHEN 'aluminum_can' THEN 5
    WHEN 'cardboard'    THEN 3
    ELSE 2
  END,
  'Completed order: ' || b.material_type
FROM public.bookings b
WHERE b.status = 'completed'
  AND b.id LIKE 'f0000000%'
  AND NOT EXISTS (
    SELECT 1 FROM public.eco_point_ledger e
    WHERE e.ref_id = b.id
  );

-- ── Done ─────────────────────────────────────────────────────

SELECT
  (SELECT count(*) FROM auth.users             WHERE id::text LIKE '%000000000001' OR email LIKE '%@greenplus.test') AS auth_users,
  (SELECT count(*) FROM public.user_profiles   WHERE id::text LIKE 'b1%' OR id::text LIKE 'd1%' OR id::text LIKE 'c1%') AS profiles,
  (SELECT count(*) FROM public.shops           WHERE id::text LIKE 't1%') AS shops,
  (SELECT count(*) FROM public.bookings        WHERE id::text LIKE 'f0%') AS bookings,
  (SELECT count(*) FROM public.scan_history    WHERE user_id::text LIKE 'c1%') AS scans,
  (SELECT count(*) FROM public.marketplace_posts WHERE user_id::text LIKE 'c1%') AS mkt_posts;
