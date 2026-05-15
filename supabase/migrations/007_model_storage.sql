-- 007_model_storage.sql
-- Replaces the Vertex AI-specific model_deployments table (migration 003)
-- with a normalized 2-table design that supports TF.js (Teachable Machine)
-- and ONNX models, with per-material stage-2 cleanliness models.
--
-- model_files       → immutable upload catalog
-- model_deployments → which file is currently live per (stage, material)

-- ── 1. Drop old Vertex AI model_deployments ──────────────────────────────────
-- CASCADE removes dependent policies created in migration 003.
DROP TABLE IF EXISTS public.model_deployments CASCADE;

-- ── 2. model_files — immutable catalog of every uploaded model artifact ───────
CREATE TABLE public.model_files (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  stage         int         NOT NULL CHECK (stage IN (1, 2)),
  -- NULL for stage-1 (one global classifier); material class name for stage-2
  material_type text        NULL,
  format        text        NOT NULL DEFAULT 'tfjs' CHECK (format IN ('tfjs', 'onnx')),
  -- Supabase Storage public URL to model.json (tfjs) or .onnx file
  model_url     text        NOT NULL,
  -- Teachable Machine metadata.json URL (contains class-label list); NULL for ONNX
  metadata_url  text        NULL,
  -- stage-1: ["plastic_bottle","aluminum_can",…]  stage-2: ["clean","dirty",…]
  class_labels  jsonb       NULL,
  -- human-readable tag, e.g. "v1.0-jun26"
  version_tag   text        NULL,
  uploaded_by   uuid        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.model_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage model files"
  ON public.model_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read model files"
  ON public.model_files FOR SELECT
  USING (true);

-- ── 3. model_deployments — which model_file is live per (stage, material) ─────
CREATE TABLE public.model_deployments (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  stage         int         NOT NULL CHECK (stage IN (1, 2)),
  -- NULL means this is the single stage-1 global classifier slot
  material_type text        NULL,
  model_file_id uuid        NOT NULL REFERENCES public.model_files(id) ON DELETE CASCADE,
  is_active     boolean     NOT NULL DEFAULT false,
  -- optional admin note about why this version was activated
  note          text        NULL,
  activated_by  uuid        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  activated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.model_deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage deployments"
  ON public.model_deployments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Non-admins can only see rows that are currently live (is_active = true).
-- Inactive historical rows are admin-only.
CREATE POLICY "Anyone can read active deployments"
  ON public.model_deployments FOR SELECT
  USING (is_active = true);

-- ── 4. Partial unique index — only one active deployment per (stage, material) ─
-- COALESCE maps NULL material_type (stage-1) to '' so the uniqueness predicate
-- works correctly across both stage-1 (NULL) and per-material stage-2 rows.
CREATE UNIQUE INDEX model_deployments_one_active_idx
  ON public.model_deployments (stage, COALESCE(material_type, ''))
  WHERE is_active = true;
