# Fix-BackendAudit.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview

Full backend audit covering three tracks: (1) RLS & security hardening across all Supabase migrations, (2) DB schema health check for missing columns and indexes, and (3) Edge Function implementation to remove the Anthropic API key from browser-side code.

## Reason

The backend review uncovered critical security and correctness issues: an overly-broad RLS policy exposed full user profile rows to any authenticated user; admin policies used raw RLS subqueries instead of the `current_user_role()` helper (risking recursion); two columns referenced by the app (`user_profiles.deleted_at`, `user_reports.ai_clean`) were absent from all migrations causing silent PostgREST failures; six FK columns lacked indexes; and the Anthropic API key was exposed directly in browser-side JavaScript with the `anthropic-dangerous-direct-browser-access` header.

## Changes

### `supabase/migrations/016_security_schema_hardening.sql` (new)

Full idempotent migration covering:

- **RLS privacy fix**: Drops `user_profiles_rider_location_select` — a policy added in migration 20260518095421 that exposed full profile rows (eco_points, role, notification_prefs, accepted_materials, open_days) to any authenticated user. The rider tracking feature requiring it is incomplete (bookings table has no `buyer_id` column yet). Policy will be re-added correctly when the feature ships.
- **Admin policy consistency**: Replaces raw `EXISTS (SELECT 1 FROM user_profiles WHERE role = 'admin')` subqueries on `model_files`, `model_deployments`, and `user_reports` with `public.current_user_role() = 'admin'` to avoid RLS recursion and match the rest of the schema.
- **`user_profiles.deleted_at TIMESTAMPTZ`**: Missing column — `useSettingsActions.deleteAccount` was running `UPDATE user_profiles SET deleted_at = ...` silently failing with PostgREST 400. Adds the column and a partial index (`WHERE deleted_at IS NOT NULL`) for hard-deletion cleanup queries.
- **`user_reports.ai_clean BOOLEAN`**: Missing column — `useReportActions.submitReport` inserts `ai_clean` (the boolean `stage2Pass` flag from the scan pipeline) but migration 003 only created `ai_grade` (text). PostgREST was silently rejecting the INSERT. Column added.
- **6 FK indexes**: `idx_model_files_uploaded_by`, `idx_model_deployments_model_file_id`, `idx_model_deployments_activated_by`, `idx_messages_sender_id`, `idx_training_images_report_id`, `idx_bookings_scheduled_date`.

### `supabase/functions/classify-waste/index.ts` (new)

Deno Edge Function that proxies waste classification requests to the Anthropic API server-side:

- Validates CORS preflight (OPTIONS → 200)
- Requires `Authorization: Bearer <token>` header; verifies with `supabase.auth.getUser()`
- Returns 401 for unauthenticated requests
- Returns 503 if `ANTHROPIC_API_KEY` env var is missing
- Reads `{ description, systemPrompt?, model? }` from request body
- Calls `https://api.anthropic.com/v1/messages` using `ANTHROPIC_API_KEY` (never exposed to browser)
- Proxies Anthropic response verbatim so `secondBrain.js` parsing logic requires no changes
- Default model: `claude-haiku-4-5-20251001`

### `src/services/secondBrain.js` (modified)

Rewrote the `classifyWaste` function to route through the Edge Function:

- **Removed** `apiKey` from config — API key now lives exclusively server-side
- **Changed** model default from `'mock'` to `'claude-haiku-4-5-20251001'`
- **Added** `import { supabase } from '../lib/supabase'`
- **Added** `const EDGE_FN_URL = \`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/classify-waste\``
- **Replaced** direct Anthropic fetch (with `x-api-key` + `anthropic-dangerous-direct-browser-access` headers) with a fetch to `EDGE_FN_URL` using `Authorization: Bearer ${session.access_token}`
- **Added** session guard: falls back to mock if `supabase.auth.getSession()` returns no session
- Response parsing, validation, sanitisation, and mock fallback logic unchanged

## Validation

- `npm run lint` passes (0 errors, 0 warnings)
- All file changes idempotent — migration 016 uses `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DO $$ EXCEPTION WHEN duplicate_object` wrappers
- Edge Function requires no deploy configuration changes beyond adding `ANTHROPIC_API_KEY` secret in Supabase Dashboard → Edge Functions → Secrets

## Notes

- The `VITE_SUPABASE_URL` env var is already used by `src/lib/supabase.js` and is safe to reference in `secondBrain.js`
- Callers that previously passed `model: 'mock'` continue to receive mock output — behaviour unchanged
- Callers that previously passed `apiKey` in config — that key is now ignored (no-op), not an error
- Migration 016 must be applied to remote before `deleteAccount` and `submitReport` work correctly in production
