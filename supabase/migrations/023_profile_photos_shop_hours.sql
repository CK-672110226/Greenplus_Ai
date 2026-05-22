-- GreenPlus Ai — Profile Photos, Shop Hours, Marketplace Images
-- Adds avatar/bio/pickup_notes to user_profiles, opens_at/closes_at to shops
-- (these were referenced in MapPage code but columns were missing),
-- image_url/contact to marketplace_posts, and two public storage buckets.

-- ── user_profiles enhancements ───────────────────────────────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS avatar_url   TEXT,
  ADD COLUMN IF NOT EXISTS bio          TEXT,
  ADD COLUMN IF NOT EXISTS pickup_notes TEXT;

-- ── shops: operating hours (already referenced in MapPage popup) ──────────
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS opens_at  TIME,
  ADD COLUMN IF NOT EXISTS closes_at TIME;

-- ── marketplace_posts enhancements ───────────────────────────────────────
ALTER TABLE public.marketplace_posts
  ADD COLUMN IF NOT EXISTS image_url  TEXT,
  ADD COLUMN IF NOT EXISTS contact    TEXT;

-- ── Storage: avatars bucket ───────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage: marketplace-images bucket ───────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-images', 'marketplace-images', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS: avatars ─────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "avatars_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "avatars_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'avatars' AND owner_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "avatars_select" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Storage RLS: marketplace-images ──────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "mp_images_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'marketplace-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "mp_images_select" ON storage.objects
    FOR SELECT USING (bucket_id = 'marketplace-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
