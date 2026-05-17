# Feature-AdminHeatmap.01

**Date:** 17 May 2026 (17 พฤษภาคม 2569)

## Overview
Two additions: (1) a real data-driven material-type heatmap grid beneath the GPS map in the Admin Heatmap tab, and (2) Sentry error monitoring integrated into the app entry point.

## Reason
The heatmap tab previously only showed a GPS dot-map; there was no breakdown of which material types were scanned most or how much weight they represented. A grid view provides instant operational insight for admins. Sentry integration was added to enable production error tracking without affecting development environments (silently disabled when `VITE_SENTRY_DSN` is unset).

## Changes

### `src/pages/AdminPage.jsx`
- Added two new state variables: `heatmapData` (aggregated `{ [material_type]: { count, totalKg } }`) and `heatmapLoading`.
- Added a `useEffect` keyed on `tab` that fetches `scan_history(material_type, weight_kg)` from Supabase and aggregates client-side — only fires when `tab === 'heatmap'` to avoid unnecessary queries.
- Appended a "Material breakdown · all scans" section below the Leaflet map inside the heatmap tab. Renders:
  - Loading: 3 `animate-pulse` skeleton cells.
  - Empty state: informational text when aggregation yields zero entries.
  - Data: a 2-col / 4-col responsive grid, each cell colored by intensity (`--green` > 66 %, `--green-soft` > 33 %, `--paper-2` otherwise), showing material name, total kg, and scan count.

### `src/main.jsx`
- Imported `@sentry/react`.
- Added `Sentry.init()` call before `createRoot`, using `VITE_SENTRY_DSN` env var, `enabled: !!VITE_SENTRY_DSN` guard, 20 % trace sample rate, and `browserTracingIntegration`.

### `package.json` / `package-lock.json`
- Added `@sentry/react` as a production dependency (7 packages added).

### `.env.local`
- Appended `VITE_SENTRY_DSN=` (empty) so developers know the variable exists and can fill it in for their environment.

## Validation
- `npm run lint` — exits clean, zero warnings or errors.
- Heatmap grid renders correctly with design tokens (`--green`, `--green-soft`, `--paper-2`, `--ink`, `--ink-3`) and typography classes (`font-data`, `font-brand`).
- Sentry `enabled: false` in dev (no DSN) — no network calls made, no console noise.

## Notes
- The heatmap fetch is intentionally separate from the GPS dot-map fetch (which loads on mount). Splitting them avoids fetching `weight_kg` for the 500-row GPS query and lets each load independently.
- `max > 0` guard on the intensity calculation prevents division-by-zero when all rows have `weight_kg = null`.
