# Feature-ModelStorage.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Added `007_model_storage.sql` — a Supabase migration that replaces the Vertex AI-specific
`model_deployments` table (from migration 003) with a normalized two-table design that
supports TF.js (Teachable Machine) and ONNX model artifacts, with per-material stage-2
cleanliness classifiers.

## Reason

Migration 003 hardcoded Vertex AI concepts (endpoint URLs, project_id, location). The app
is moving to client-side inference using Teachable Machine (TF.js) and ONNX models, which
are uploaded as files to Supabase Storage. The old single-row "which endpoint is active"
design cannot represent one stage-1 model plus N per-material stage-2 models. A normalized
catalog + deployment table handles both stages cleanly and enforces at most one active
deployment per (stage, material_type) slot via a partial unique index.

## Changes

### `supabase/migrations/007_model_storage.sql` (new file)

- **DROP TABLE public.model_deployments CASCADE** — removes the Vertex AI table and its
  RLS policies from migration 003 before recreating with the new design.
- **CREATE TABLE public.model_files** — immutable upload catalog with columns:
  `id`, `stage` (1 or 2), `material_type` (NULL for stage-1), `format` ('tfjs'|'onnx'),
  `model_url`, `metadata_url`, `class_labels` (jsonb), `version_tag`, `uploaded_by`,
  `created_at`. RLS: admins full access; anyone can SELECT.
- **CREATE TABLE public.model_deployments** — deployment activation log with columns:
  `id`, `stage`, `material_type`, `model_file_id` (FK → model_files), `is_active`,
  `note`, `activated_by`, `activated_at`. RLS: admins full access; public SELECT only
  for rows where `is_active = true`.
- **CREATE UNIQUE INDEX model_deployments_one_active_idx** — partial unique index on
  `(stage, COALESCE(material_type, ''))` WHERE `is_active = true`, enforcing exactly one
  active deployment per slot at the database level.

### `HistoryVersions/Feature/ModelStorage/Feature-ModelStorage.00.md` (this file)

## Validation

- SQL reviewed for syntax correctness: all DDL statements terminate with `;`.
- `gen_random_uuid()` is consistent with migration 006 (does not require uuid-ossp).
- `CASCADE` on DROP correctly removes the old migration 003 policies.
- Partial index handles stage-1 NULL material_type via `COALESCE(material_type, '')`.
- No application code changes required by this migration alone.

## Notes

- `model_files` is append-only by convention — rows should never be deleted after being
  referenced by a deployment. The `ON DELETE CASCADE` on `model_deployments.model_file_id`
  is a safety fallback, not intended for routine use.
- To swap the active model for a given slot, set the old row's `is_active = false` then
  insert a new row with `is_active = true`. The partial unique index prevents two active
  rows from coexisting for the same (stage, material_type).
- `material_type` strings in `model_files` must match the class names used in
  `training_images.material_type` (both are free-text, no FK constraint by design to allow
  flexibility during early training iteration).
