-- training_images: reference images for Vertex AI AutoML training
CREATE TABLE public.training_images (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_type text NOT NULL,
  stage         int  NOT NULL CHECK (stage IN (1, 2)),
  label         text NOT NULL,  -- stage1: material_type value  stage2: 'clean'|'dirty'
  storage_path  text NOT NULL,  -- supabase storage path
  image_url     text NOT NULL,  -- public URL
  uploaded_by   uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  source        text NOT NULL DEFAULT 'admin' CHECK (source IN ('admin','user_report')),
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage training images"
  ON public.training_images FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
CREATE POLICY "Anyone can read training images"
  ON public.training_images FOR SELECT USING (true);

-- user_reports: scan result disputes from users
CREATE TABLE public.user_reports (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id      uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  scan_image_url   text,
  claimed_material text NOT NULL,
  ai_material      text,
  ai_grade         text,
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note       text,
  reviewed_by      uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  reviewed_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own reports"
  ON public.user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can read own reports"
  ON public.user_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Admins manage all reports"
  ON public.user_reports FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- model_deployments: track which Vertex AI endpoints are active
CREATE TABLE public.model_deployments (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  version          text NOT NULL,
  stage1_endpoint  text,   -- full Vertex AI endpoint URL
  stage2_endpoint  text,
  project_id       text,
  location         text DEFAULT 'us-central1',
  is_active        boolean NOT NULL DEFAULT false,
  deployed_by      uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  deployed_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.model_deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage deployments"
  ON public.model_deployments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
CREATE POLICY "Anyone can read active deployment"
  ON public.model_deployments FOR SELECT USING (is_active = true);
