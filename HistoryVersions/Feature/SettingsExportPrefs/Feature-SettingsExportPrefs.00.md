# Feature-SettingsExportPrefs.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview
Wire up two previously-stub Settings page features: notification preference toggles (persist to `user_profiles`) and "Export my data" (download JSON of scan history + bookings).

## Reason
Three notification toggles existed in the UI but used local `useState` — they reset on every refresh and wrote nothing to the DB. "Export my data" button had an empty `onClick`. Both were wasted UI surface.

## Changes

### `supabase/migrations/011_settings_scan_location.sql` (new, shared with AdminHeatmap)
- Adds `notification_prefs jsonb NOT NULL DEFAULT '{"price_alerts":true,...}'` to `user_profiles`.
- Adds `lat double precision`, `lng double precision` to `scan_history` (for heatmap).

### `src/pages/SettingsPage.jsx`
- Removed local `useState` for prefs.
- Reads `prefs` from `profile.notification_prefs` (with `DEFAULT_PREFS` fallback for users before migration).
- `togglePref(key)`: optimistically updates Redux via `dispatch(setProfile({ ...profile, notification_prefs: next }))` then writes to Supabase.
- Added `handleExport()`:
  - Parallel `Promise.all` queries: `scan_history WHERE user_id` + `bookings WHERE seller_id`.
  - Bundles into JSON payload with `exported_at` timestamp.
  - Triggers browser download via `Blob` + `URL.createObjectURL` + ephemeral `<a>` click.
- Added `supabase` and `setProfile` imports; removed unused `useState` import.

## Validation
- Lint passes.
- Toggle a notification pref → check `user_profiles.notification_prefs` in Supabase dashboard updates.
- Refresh page → toggles restore from DB (not reset to defaults).
- Click "Export my data" → JSON file downloads with scan_history and bookings arrays.

## Notes
- Requires migration 011 for prefs to persist; without it, `profile.notification_prefs` is `null` and `DEFAULT_PREFS` is used (graceful degradation).
- "Delete account" button still has empty `onClick` — requires Edge Function (separate task).
