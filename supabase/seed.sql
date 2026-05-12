-- ============================================================
-- Seed data: waste_items pricing (Chiang Mai market — May 2026)
-- PRD Section 8 & Section 13 Material Keys
-- ============================================================

INSERT INTO waste_items (name, name_th, material_type, unit, base_weight, price_grade_a) VALUES
  ('PET Bottle (Clear)',   'ขวด PET ใส',              'pet_bottle_clear', 'kg', 0.030,  9.00),
  ('Aluminium Can',        'กระป๋องอะลูมิเนียม',     'aluminum_can',     'kg', 0.015, 62.00),
  ('Cardboard',            'กระดาษลัง',               'cardboard',        'kg', null,   4.50),
  ('Copper',               'ทองแดง',                  'copper',           'kg', null, 382.00),
  ('Glass',                'แก้ว',                    'glass',            'kg', null,   2.00),
  ('Newspaper',            'หนังสือพิมพ์',            'newspaper',        'kg', null,   7.20),
  ('Mixed Plastic',        'พลาสติกรวม',              'mixed_plastic',    'kg', null,  18.50),
  ('Used Cooking Oil',     'น้ำมันทอด',               'cooking_oil',      'kg', null,  20.00);

-- ── Grading criteria seed ────────────────────────────────────
-- PET Bottle weights (PRD Section 4.4)
INSERT INTO grading_criteria (material_type, factor_key, factor_name_th, factor_name_en, weight, hard_reject_min, sort_order) VALUES
  ('pet_bottle_clear', 'cleanliness',  'ความสะอาด',     'Cleanliness',  0.30, null, 1),
  ('pet_bottle_clear', 'color',        'สี',             'Color',        0.25, 1.0,  2),
  ('pet_bottle_clear', 'preparation',  'การเตรียมวัสดุ', 'Preparation',  0.25, null, 3),
  ('pet_bottle_clear', 'moisture',     'ความชื้น',       'Moisture',     0.20, null, 4);

-- Aluminium Can weights
INSERT INTO grading_criteria (material_type, factor_key, factor_name_th, factor_name_en, weight, hard_reject_min, sort_order) VALUES
  ('aluminum_can', 'cleanliness',  'ความสะอาด',     'Cleanliness',  0.35, null, 1),
  ('aluminum_can', 'condition',    'สภาพ',           'Condition',    0.30, null, 2),
  ('aluminum_can', 'purity',       'ความบริสุทธิ์',  'Purity',       0.20, 2.0,  3),
  ('aluminum_can', 'preparation',  'การเตรียมวัสดุ', 'Preparation',  0.15, null, 4);

-- Cardboard weights
INSERT INTO grading_criteria (material_type, factor_key, factor_name_th, factor_name_en, weight, hard_reject_min, sort_order) VALUES
  ('cardboard', 'moisture',     'ความชื้น',       'Moisture',     0.40, 3.0,  1),
  ('cardboard', 'preparation',  'การเตรียมวัสดุ', 'Preparation',  0.25, null, 2),
  ('cardboard', 'purity',       'ความบริสุทธิ์',  'Purity',       0.20, null, 3),
  ('cardboard', 'cleanliness',  'ความสะอาด',     'Cleanliness',  0.15, null, 4);

-- Copper weights
INSERT INTO grading_criteria (material_type, factor_key, factor_name_th, factor_name_en, weight, hard_reject_min, sort_order) VALUES
  ('copper', 'purity',        'ความบริสุทธิ์',  'Purity',       0.50, 2.0,  1),
  ('copper', 'oxidation',     'การออกซิเดชัน',  'Oxidation',    0.25, null, 2),
  ('copper', 'form',          'รูปแบบ',          'Form',         0.15, null, 3),
  ('copper', 'contamination', 'สิ่งปนเปื้อน',   'Contamination',0.10, null, 4);
