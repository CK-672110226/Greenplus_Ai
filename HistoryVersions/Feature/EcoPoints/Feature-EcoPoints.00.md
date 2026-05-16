# Feature-EcoPoints.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview

Full eco-points feature: award points on every scan, show balance and history on a dedicated /eco page, add the page to the user sidebar nav.

## Reason

Gamification layer to reward users for recycling. The `user_profiles.eco_points integer` column already existed from migration 001 but was never populated or surfaced in the UI.

## Changes

### `supabase/migrations/012_eco_points_fn.sql` (NEW)
- `increment_eco_points(user_id_param uuid, points_param integer) returns integer` — atomic read-modify-write via `SECURITY DEFINER` to avoid client-side race conditions. Returns the new running total.

### `src/hooks/useScanInsert.js` (MODIFIED)
- After each successful scan insert, calls `supabase.rpc('increment_eco_points', { user_id_param, points_param: max(1, round(weight_kg * 10)) })`.
- Dispatches `setProfile({ ...profile, eco_points: newTotal })` to keep Redux in sync.

### `src/pages/EcoPointsPage.jsx` (NEW)
- Balance card: reads `profile?.eco_points` from Redux.
- Points legend tile: shows 10 pts/kg rule.
- Scan history list: uses `useScanHistory()`, estimates pts per row as `max(1, round(weight_kg * 10))`.
- Loading skeleton (3 placeholder rows) while history loads.

### `src/App.jsx` (MODIFIED)
- Lazy imports `EcoPointsPage`.
- Adds `/eco` route inside SmartLayout with `ProtectedRoute requiredRole="user"`.

### `src/layouts/UserLayout.jsx` (MODIFIED)
- Added `IconLeaf` SVG icon.
- Added `{ to: '/eco', icon: <IconLeaf />, label: t.ecoPoints }` to `mainNav`.

## Validation

- Lint passes (`npm run lint` — zero warnings).
- Manual: scan a material → points increment in balance card; /eco page shows the scan in history.

## Notes

- Migration 012 must be run in Supabase dashboard before the feature is live.
- Points formula: 10 pts per kg, minimum 1 pt per scan.
