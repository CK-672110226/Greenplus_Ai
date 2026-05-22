-- GreenPlus Ai — Enforce one shop per buyer
-- The onboarding upsert relied on owner_id uniqueness that never existed,
-- causing duplicate shops when the profile update failed mid-save.
-- 1. Deduplicate: keep the oldest shop per owner_id (others are partial retries).
-- 2. Add UNIQUE constraint so future upserts with onConflict:'owner_id' work.

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY owner_id ORDER BY created_at ASC) AS rn
  FROM public.shops
)
DELETE FROM public.shops
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

ALTER TABLE public.shops
  ADD CONSTRAINT shops_owner_id_key UNIQUE (owner_id);
