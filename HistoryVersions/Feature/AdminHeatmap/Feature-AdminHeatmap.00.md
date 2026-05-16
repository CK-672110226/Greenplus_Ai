# Feature-AdminHeatmap.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview
Replace the Admin heatmap placeholder with a live Leaflet map showing scan density as green CircleMarkers. Also adds GPS capture to the scan INSERT pipeline so future scans are geo-tagged.

## Reason
The heatmap tab showed "No scan data yet — milestone A-05" indefinitely because `scan_history` had no `lat`/`lng` columns and GPS was never captured during scanning.

## Changes

### `supabase/migrations/011_settings_scan_location.sql` (shared with SettingsExportPrefs)
- `ALTER TABLE scan_history ADD COLUMN lat double precision, ADD COLUMN lng double precision`.
- Partial index on `(lat, lng) WHERE lat IS NOT NULL` for fast heatmap queries.

### `src/hooks/useScanInsert.js`
- Added `getGPS()` helper: calls `navigator.geolocation.getCurrentPosition` with 3 s timeout, resolves `{ lat, lng }` or `null` (never rejects).
- `insertScan` now awaits `getGPS()` before the Supabase INSERT and passes `lat`/`lng` into the row (both `null` if GPS unavailable or denied).

### `src/pages/AdminPage.jsx`
- Added `MapContainer`, `TileLayer`, `CircleMarker`, `Tooltip` imports from `react-leaflet`; `leaflet/dist/leaflet.css`.
- Added `darkMode` selector (for tile URL switch), `scanPoints` + `heatLoading` state.
- New `useEffect`: `SELECT lat, lng, material_type, scanned_at FROM scan_history WHERE lat IS NOT NULL LIMIT 500`.
- Heatmap tab renders a 420 px `MapContainer` centred on Chiang Mai (18.796, 98.979).
  - Green CircleMarkers for each scan point with material + date tooltip.
  - Falls back to amber CircleMarkers at shop locations when no scan GPS data exists yet.
  - Loading skeleton shown while fetching.
  - Count badge `"N scans with GPS"` in header.

## Validation
- Lint passes.
- Admin → Heatmap tab → map renders (Chiang Mai tiles visible).
- After a new scan with location permission → dot appears on next admin load.
- Without GPS permission → scan still inserts (lat/lng = null), dot not shown.

## Notes
- GPS is captured non-blocking: `getGPS()` adds ≤3 s to the scan-save path only when permission is already granted (cached position via `maximumAge: 60000`); denied/unavailable resolves immediately.
- Existing scan_history rows have null lat/lng; dots appear only for scans made after migration 011.
