-- GreenPlus Ai — Training Images (Admin Reports fix)
-- Migration 003 already created training_images with a different schema
-- (material_type, stage, label, storage_path, image_url, uploaded_by, source).
-- This migration adds the report_id FK and approved_by columns that the new
-- Admin Reports page expects, and tightens RLS to use current_user_role().
--
-- Idempotent: ADD COLUMN IF NOT EXISTS; policy DO $$ EXCEPTION blocks.

-- ── Add net-new columns to the existing training_images table ────────────────

ALTER TABLE public.training_images
  ADD COLUMN IF NOT EXISTS report_id   UUID REFERENCES public.user_reports(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- ── RLS: replace the 003 admin policy with a current_user_role() version ─────
-- (Avoids the recursive subquery that migration 003 used.)

DROP POLICY IF EXISTS "Admins manage training images" ON public.training_images;

DO $$ BEGIN
  CREATE POLICY "training_images_admin_all" ON public.training_images
    FOR ALL USING (public.current_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Keep the public read-access policy from migration 003 (anyone can read).
-- It is already named "Anyone can read training images" — no change needed.

-- Index report_id for admin report queries (must be in this migration, not 016,
-- because the column doesn't exist until this ALTER TABLE runs).
CREATE INDEX IF NOT EXISTS idx_training_images_report_id
  ON public.training_images (report_id)
  WHERE report_id IS NOT NULL;
