-- GreenPlus Ai — PricingPage schema simplification
-- New spec: only price_per_kg + cap_kg per material, no A/B/C grade columns.
-- Idempotent: IF EXISTS / IF NOT EXISTS guards throughout.
--
-- IMPORTANT MIGRATION NOTE
-- ────────────────────────
-- The existing shop_pricing table (migration 001) stores three grade-specific
-- price columns (price_grade_a, price_grade_b, price_grade_c) and has no
-- separate 'grade' or 'condition' TEXT column.  The frontend hooks
-- (useMarketPricing.js, PricingPage.jsx) currently read price_grade_a /
-- price_grade_c.  Once this migration is applied those hooks must be updated
-- to read price_per_kg instead.
--
-- Step 1 — Add the new canonical price + cap columns (no data loss).
ALTER TABLE public.shop_pricing
  ADD COLUMN IF NOT EXISTS price_per_kg NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS cap_kg       NUMERIC(10,2);

-- Step 2 — Backfill price_per_kg from price_grade_a (the 'clean / best grade'
-- column) as a sensible default.  Only fills rows where the new column is NULL.
UPDATE public.shop_pricing
   SET price_per_kg = price_grade_a
 WHERE price_per_kg IS NULL
   AND price_grade_a IS NOT NULL;

-- Step 3 — Drop the now-redundant grade columns.
--          IF EXISTS guards make this safe to re-run after they are gone.
ALTER TABLE public.shop_pricing DROP COLUMN IF EXISTS price_grade_a;
ALTER TABLE public.shop_pricing DROP COLUMN IF EXISTS price_grade_b;
ALTER TABLE public.shop_pricing DROP COLUMN IF EXISTS price_grade_c;

-- Step 4 — Drop legacy 'grade' / 'condition' TEXT columns if they ever existed
--          (they do not exist in the baseline schema, but guarded for safety).
ALTER TABLE public.shop_pricing DROP COLUMN IF EXISTS grade;
ALTER TABLE public.shop_pricing DROP COLUMN IF EXISTS condition;

-- Step 5 — Enforce a single price row per (shop_id, material_type).
-- The original UNIQUE constraint already covers this pair, but the constraint
-- name may differ across environments; recreate defensively.
ALTER TABLE public.shop_pricing
  DROP CONSTRAINT IF EXISTS shop_pricing_shop_material_grade_key;

DO $$ BEGIN
  ALTER TABLE public.shop_pricing
    ADD CONSTRAINT shop_pricing_shop_material_key
      UNIQUE (shop_id, material_type);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
