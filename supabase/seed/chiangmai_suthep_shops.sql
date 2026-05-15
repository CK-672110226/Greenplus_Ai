-- GreenPlus Ai — Chiang Mai Mueang-Suthep Zone: Real Shops & Drop-off Points
-- Run in Supabase SQL Editor after 001_init.sql
--
-- Coordinates sourced from:
--   CMHY.city listings, Thailand Yellow Pages, CMU official announcements
-- Low-confidence coordinates are marked with [approx]
--
-- Price estimates reflect approximate Thai recycling market rates (May 2026).
-- Update via Supabase Table Editor or shop_pricing rows as rates change.

-- ── Shops ─────────────────────────────────────────────────────────

insert into public.shops (id, name, area, lat, lng, accepts, status) values
  (
    '10000000-0000-0000-0000-000000000001',
    'ตู้ REFUN (คณะมนุษยศาสตร์ มช.)',
    'คณะมนุษยศาสตร์ มหาวิทยาลัยเชียงใหม่, ต.สุเทพ, อ.เมือง เชียงใหม่',
    18.803497, 98.950864,
    array['pet_bottle_clear'],
    'active'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'ปภาณพสิษฐ์ รีไซเคิล',
    'อ.เมือง เชียงใหม่ (มีบริการรับของถึงบ้าน)',
    18.787000, 98.993000,  -- [approx] mobile/pickup service, no fixed address
    array['aluminum_can', 'cardboard', 'newspaper', 'mixed_plastic', 'glass', 'cooking_oil'],
    'active'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'ปั๊มน้ำมันบางจาก (โครงการทอดไม่ทิ้ง)',
    'ถ.สุเทพ, ต.สุเทพ, อ.เมือง เชียงใหม่',
    18.802000, 98.960030,
    array['cooking_oil'],
    'active'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'เอี่ยมดี รีไซเคิล',
    'บ้านร้องเรือคำ ซ.16, ต.ป่าแดด, อ.เมือง เชียงใหม่',
    18.748000, 99.009000,  -- [approx] derived from Pa Daet subdistrict / Moo 12 area
    array['pet_bottle_clear', 'aluminum_can', 'cardboard', 'newspaper', 'mixed_plastic', 'glass'],
    'active'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'ส.ทรัพย์เจริญ รีไซเคิล',
    'ถ.สันผีเสื้อ-ป่าข่อยใต้, อ.เมือง เชียงใหม่',
    18.849790, 98.987908,
    array['aluminum_can', 'copper', 'mixed_plastic'],
    'active'
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'เอส.เค. รีไซเคิล',
    'ถ.วงแหวนรอบนอก (ทางหลวง 121), ต.สุเทพ, อ.เมือง เชียงใหม่',
    18.764146, 98.945311,
    array['pet_bottle_clear', 'aluminum_can', 'mixed_plastic'],
    'active'
  )
on conflict (id) do nothing;

-- ── Shop Pricing ──────────────────────────────────────────────────
-- Grade A = clean/sorted, Grade B = used/mixed, Grade C = dirty/damaged

insert into public.shop_pricing
  (shop_id, material_type, price_grade_a, price_grade_b, price_grade_c)
values
  -- ตู้ REFUN: PET bottles (programme rate: 10 bottles = 1 baht ≈ 5 baht/kg Grade A)
  ('10000000-0000-0000-0000-000000000001', 'pet_bottle_clear',   5.00,   3.00,   null),

  -- ปภาณพสิษฐ์ รีไซเคิล: approximate daily market rates
  ('10000000-0000-0000-0000-000000000002', 'aluminum_can',      38.00,  30.00,  20.00),
  ('10000000-0000-0000-0000-000000000002', 'cardboard',          3.50,   2.50,   1.50),
  ('10000000-0000-0000-0000-000000000002', 'newspaper',          2.50,   2.00,   1.00),
  ('10000000-0000-0000-0000-000000000002', 'mixed_plastic',      5.00,   3.50,   2.00),
  ('10000000-0000-0000-0000-000000000002', 'glass',              1.00,   0.80,   0.50),
  ('10000000-0000-0000-0000-000000000002', 'cooking_oil',       12.00,  10.00,   8.00),

  -- ปั๊มบางจาก: fixed programme rate, 20 baht/kg regardless of grade
  ('10000000-0000-0000-0000-000000000003', 'cooking_oil',       20.00,  20.00,  20.00),

  -- เอี่ยมดี รีไซเคิล: approximate market rates
  ('10000000-0000-0000-0000-000000000004', 'pet_bottle_clear',   8.00,   6.00,   3.00),
  ('10000000-0000-0000-0000-000000000004', 'aluminum_can',      35.00,  28.00,  20.00),
  ('10000000-0000-0000-0000-000000000004', 'cardboard',          3.00,   2.00,   1.00),
  ('10000000-0000-0000-0000-000000000004', 'newspaper',          2.00,   1.50,   0.80),
  ('10000000-0000-0000-0000-000000000004', 'mixed_plastic',      4.50,   3.00,   1.50),
  ('10000000-0000-0000-0000-000000000004', 'glass',              1.00,   0.70,   0.40),

  -- ส.ทรัพย์เจริญ รีไซเคิล: metal, aluminum, plastic
  ('10000000-0000-0000-0000-000000000005', 'aluminum_can',      40.00,  32.00,  22.00),
  ('10000000-0000-0000-0000-000000000005', 'copper',           200.00, 170.00, 140.00),
  ('10000000-0000-0000-0000-000000000005', 'mixed_plastic',      5.00,   3.50,   2.00),

  -- เอส.เค. รีไซเคิล: plastic bottles and metal
  ('10000000-0000-0000-0000-000000000006', 'pet_bottle_clear',   8.00,   6.00,   3.00),
  ('10000000-0000-0000-0000-000000000006', 'aluminum_can',      38.00,  30.00,  20.00),
  ('10000000-0000-0000-0000-000000000006', 'mixed_plastic',      5.00,   3.50,   2.00)

on conflict (shop_id, material_type) do nothing;
