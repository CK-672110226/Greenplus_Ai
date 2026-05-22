-- GreenPlus Ai — Security + Schema Hardening
-- Idempotent: ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS,
-- policy changes wrapped in DROP IF EXISTS / DO $$ EXCEPTION blocks.
--
-- Fixes:
--  (a) Overly-broad user_profiles SELECT policy from rider-realtime migration
--      exposed full profile rows to any authenticated user.
--  (b) Admin policies on model_files / model_deployments / user_reports still used
--      raw EXISTS subqueries instead of current_user_role() helper.
--  (c) user_profiles missing deleted_at column used by soft-delete in the app.
--  (d) user_reports missing ai_clean BOOLEAN column (app inserts this field).
--  (e) Six unindexed FK columns and one filtered query column.

-- ── 1. Remove overly-broad rider location policy ──────────────────────────────
-- Migration 20260518095421 added a policy that allows any authenticated user to
-- read the full row of any other user_profiles row.  This exposes sensitive
-- fields (notification_prefs, eco_points, role, accepted_materials, open_days).
-- The rider tracking feature that needed this is incomplete (bookings table has
-- no buyer_id FK yet).  Drop the policy; add it back correctly when the feature
-- ships with a proper buyer_id column on bookings.

DROP POLICY IF EXISTS "user_profiles_rider_location_select" ON public.user_profiles;

-- ── 2. Fix admin policies to use current_user_role() helper ──────────────────
-- Replaces raw EXISTS (SELECT 1 FROM user_profiles WHERE role = 'admin') with
-- the SECURITY DEFINER helper to avoid potential RLS recursion and be consistent
-- with the rest of the schema.

-- model_files (migration 007 used raw subquery)
DROP POLICY IF EXISTS "Admins manage model files" ON public.model_files;
DO $$ BEGIN
  CREATE POLICY "model_files_admin_all" ON public.model_files
    FOR ALL USING (public.current_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- model_deployments (migration 007 used raw subquery)
DROP POLICY IF EXISTS "Admins manage deployments" ON public.model_deployments;
DO $$ BEGIN
  CREATE POLICY "model_deployments_admin_all" ON public.model_deployments
    FOR ALL USING (public.current_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- user_reports (migration 003 used raw subquery)
DROP POLICY IF EXISTS "Admins manage all reports" ON public.user_reports;
DO $$ BEGIN
  CREATE POLICY "user_reports_admin_all" ON public.user_reports
    FOR ALL USING (public.current_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 3. Add missing columns ────────────────────────────────────────────────────

-- user_profiles.deleted_at: used by useSettingsActions.deleteAccount for soft-delete.
-- Without this column the UPDATE silently fails (PostgREST 400 on unknown column).
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Partial index: quickly find accounts scheduled for hard-deletion.
CREATE INDEX IF NOT EXISTS idx_user_profiles_deleted_at
  ON public.user_profiles (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- user_reports.ai_clean: the scan pipeline stores stage2Pass (boolean clean flag).
-- The INSERT from useReportActions.js uses this column name; ai_grade stores the
-- text classification grade from the admin review, which is a separate concern.
ALTER TABLE public.user_reports
  ADD COLUMN IF NOT EXISTS ai_clean BOOLEAN;

-- ── 4. Missing FK indexes ─────────────────────────────────────────────────────

-- model_files.uploaded_by (admin queries, model registry list)
CREATE INDEX IF NOT EXISTS idx_model_files_uploaded_by
  ON public.model_files (uploaded_by);

-- model_deployments.model_file_id (JOIN to model_files in useActiveModels.js)
CREATE INDEX IF NOT EXISTS idx_model_deployments_model_file_id
  ON public.model_deployments (model_file_id);

-- model_deployments.activated_by (audit queries)
CREATE INDEX IF NOT EXISTS idx_model_deployments_activated_by
  ON public.model_deployments (activated_by);

-- messages.sender_id (per-sender message queries)
CREATE INDEX IF NOT EXISTS idx_messages_sender_id
  ON public.messages (sender_id);

-- bookings.scheduled_date (useSmartRoute.js filters .eq('scheduled_date', today))
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date
  ON public.bookings (scheduled_date)
  WHERE scheduled_date IS NOT NULL;
