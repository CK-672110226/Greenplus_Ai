ALTER TABLE public.marketplace_posts
  ADD COLUMN IF NOT EXISTS post_type    TEXT NOT NULL DEFAULT 'sell',
  ADD COLUMN IF NOT EXISTS title        TEXT,
  ADD COLUMN IF NOT EXISTS description  TEXT,
  ADD COLUMN IF NOT EXISTS material_types TEXT[];

-- Backfill: copy existing single material_type into material_types array
UPDATE public.marketplace_posts
SET material_types = ARRAY[material_type]
WHERE material_types IS NULL AND material_type IS NOT NULL;

-- post_type constraint
ALTER TABLE public.marketplace_posts
  DROP CONSTRAINT IF EXISTS marketplace_posts_post_type_check;

ALTER TABLE public.marketplace_posts
  ADD CONSTRAINT marketplace_posts_post_type_check
  CHECK (post_type IN ('sell', 'request', 'event'));
