-- ============================================================
-- Migration 001: Core tables
-- GreenPlus Ai — PRD Section 16.2
-- ============================================================

-- Pricing reference (read-heavy, rarely written)
CREATE TABLE waste_items (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  name_th       text        NOT NULL,
  material_type text        UNIQUE NOT NULL,
  unit          text        NOT NULL DEFAULT 'kg',
  base_weight   numeric(8,3),
  price_grade_a numeric(10,2) NOT NULL,
  price_grade_b numeric(10,2) GENERATED ALWAYS AS (price_grade_a * 0.75) STORED,
  price_grade_c numeric(10,2) GENERATED ALWAYS AS (price_grade_a * 0.40) STORED,
  updated_at    timestamptz DEFAULT now()
);

-- User profiles 1:1 with auth.users
CREATE TABLE user_profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text        NOT NULL DEFAULT 'user'
                            CHECK (role IN ('user', 'buyer', 'admin')),
  display_name  text,
  language_pref text        NOT NULL DEFAULT 'th'
                            CHECK (language_pref IN ('th', 'en')),
  eco_points    integer     NOT NULL DEFAULT 0,
  location_lat  numeric(10,7),
  location_lng  numeric(10,7),
  created_at    timestamptz DEFAULT now()
);

-- Shops (buyers) — read by all, written by owner
CREATE TABLE shops (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  name_th     text,
  address     text,
  lat         numeric(10,7),
  lng         numeric(10,7),
  phone       text,
  accepts     text[]      NOT NULL DEFAULT '{}',
  hours_note  text,
  verified    boolean     NOT NULL DEFAULT false,
  status      text        NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'active', 'suspended')),
  created_at  timestamptz DEFAULT now()
);

-- Scan history
CREATE TABLE scan_history (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  item_type        text        REFERENCES waste_items(material_type),
  grade            char(1)     CHECK (grade IN ('A', 'B', 'C')),
  confidence       numeric(4,3),
  weight_estimate  numeric(8,3),
  calculated_value numeric(10,2),
  factor_scores    jsonb,       -- {"cleanliness": 8.0, "moisture": 9.0, ...}
  weighted_score   numeric(5,1),
  scanned_at       timestamptz DEFAULT now()
);

-- Marketplace listings
CREATE TABLE marketplace_posts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title         text,
  material_type text        REFERENCES waste_items(material_type),
  grade         char(1)     CHECK (grade IN ('A', 'B', 'C')),
  quantity_kg   numeric(8,3),
  asking_price  numeric(10,2),
  status        text        NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'reserved', 'closed')),
  flagged       boolean     NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- Grading factors per material (admin-tunable weights)
CREATE TABLE grading_criteria (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type    text        NOT NULL REFERENCES waste_items(material_type),
  factor_key       text        NOT NULL,
  factor_name_th   text        NOT NULL,
  factor_name_en   text        NOT NULL,
  weight           numeric(4,3) NOT NULL,
  hard_reject_min  numeric(4,1),
  sort_order       smallint    DEFAULT 0,
  UNIQUE (material_type, factor_key),
  CONSTRAINT weight_range CHECK (weight > 0 AND weight <= 1)
);
