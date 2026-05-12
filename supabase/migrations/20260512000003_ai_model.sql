-- ============================================================
-- Migration 003: AI Model Management tables
-- GreenPlus Ai — PRD Section 17
-- ============================================================

-- Admin uploads labeled training images
CREATE TABLE training_images (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path  text        NOT NULL,
  material_type text        REFERENCES waste_items(material_type),
  grade_label   char(1)     CHECK (grade_label IN ('A', 'B', 'C')),
  stage         integer     NOT NULL DEFAULT 1 CHECK (stage IN (1, 2)),
  status        text        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'used', 'rejected')),
  uploaded_by   uuid        REFERENCES user_profiles(id),
  uploaded_at   timestamptz DEFAULT now()
);

-- One row per trained model version
CREATE TABLE model_versions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  version      text        UNIQUE NOT NULL,
  stage        integer     NOT NULL CHECK (stage IN (1, 2)),
  storage_path text        NOT NULL,
  public_url   text        NOT NULL,
  accuracy     numeric(5,4),
  image_count  integer,
  status       text        NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft', 'active', 'deprecated')),
  release_note text,
  created_by   uuid        REFERENCES user_profiles(id),
  created_at   timestamptz DEFAULT now()
);

-- Training job tracking
CREATE TABLE training_jobs (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  stage          integer     NOT NULL CHECK (stage IN (1, 2)),
  image_count    integer,
  status         text        NOT NULL DEFAULT 'queued'
                 CHECK (status IN ('queued', 'running', 'done', 'failed')),
  result_version text        REFERENCES model_versions(version),
  log_text       text,
  started_at     timestamptz,
  finished_at    timestamptz,
  triggered_by   uuid        REFERENCES user_profiles(id)
);
