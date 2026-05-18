# Fix-SmartRouteRoadGeometry.00 — Smart Route follows actual roads via OSRM

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

The Smart Route map was drawing straight lines (`<Polyline>`) between pickup stops using only lat/lng coordinates. The route now fetches real road geometry from OSRM and renders it as a road-following polyline.

## Reason

ผู้ใช้รายงานว่า map เดินทางตรงเฉย ไม่ตามเส้นทางถนนจริง เส้น Polyline เดิมวาดตรงระหว่างพิกัด (as-the-crow-flies) ไม่ได้แสดงถนนจริง ทำให้ระยะทางที่แสดงก็ไม่ตรงกับความเป็นจริง

## Changes

### src/components/SmartRouteMap.jsx

- Added `fetchRoadGeometry(waypoints)` async function at module level:
  - Calls `https://router.project-osrm.org/route/v1/driving/{coords}?overview=full&geometries=geojson`
  - OSRM returns GeoJSON `[lng, lat]` coordinates — swapped to Leaflet `[lat, lng]`
  - Returns `null` on network error or non-OK response (falls back to straight line)
- Added `roadGeometry` state (`null` until OSRM responds)
- Added `useEffect` that fires when `stops` or `shopLocation` changes:
  - Skips fetch when `stops.length === 0`
  - Cancellation flag prevents stale state updates on fast route changes
  - Only calls `setRoadGeometry` inside the async `.then()` callback (not synchronously in effect body — avoids `react-hooks/set-state-in-effect`)
- `routePositions = roadGeometry ?? straightLine` — falls back to straight line while loading or on OSRM failure
- Polyline styling changes:
  - While loading (`roadGeometry === null`): thin dashed line (weight 2, dashArray '6 6', opacity 0.5) — signals "route loading"
  - After OSRM responds: solid line (weight 4, full opacity)

## Validation

- `npm run lint` — 0 errors.
- `npm run build` — clean.
- OSRM API tested manually: returns road-following geometry for Chiang Mai area coordinates.

## Notes

- Uses the OSRM public demo server (`router.project-osrm.org`). This is fine for low-traffic usage but has no SLA. For production scale, replace `OSRM_BASE` with a self-hosted instance or OpenRouteService/GraphHopper (both have free tiers with API keys).
- The haversine-based distance in `useSmartRoute` (for TSP ordering and KPI display) remains as-is — it's a reasonable approximation for short distances and doesn't require an API call. The road geometry is visualization-only.
- If OSRM is unreachable (e.g. no internet), the straight-line fallback renders silently with no error shown to the user.
