# Feature-SmartRouteMap.00

17 May 2026 (17 พฤษภาคม 2569)

## Overview

Adds a nearest-neighbor TSP route optimizer and an interactive Leaflet map component for buyer pickup logistics.

## Reason

Buyers need a visual, optimized daily pickup route derived from today's accepted bookings, along with distance and weight statistics.

## Changes

### src/hooks/useSmartRoute.js (new)
- Reads `session.user.id` from Redux `user.session`.
- Fetches the buyer's shop from `shops` (owner_id match).
- Fetches today's `accepted` bookings for that shop including seller display name via foreign-table join.
- Filters bookings to those with valid GPS coordinates.
- Runs nearest-neighbor TSP (`nearestNeighborTSP`) starting from the shop location.
- Computes `totalKg`, `totalValue`, `totalDistanceKm`, `stopCount` stats.
- Returns `{ stops, shopLocation, stats, loading }`.
- `loading` initialises to `true` only when a session exists, avoiding synchronous `setState` inside the effect body (lint rule `react-hooks/set-state-in-effect`).

### src/components/SmartRouteMap.jsx (new)
- Fixes the Leaflet default-icon CDN paths at module scope.
- Uses `useSmartRoute` hook for all data.
- Renders a 3-column `KpiBox` stats strip (Stops / Total kg / Distance).
- Renders a 340 px `MapContainer` with CartoDB light tiles, shop marker, per-stop markers with popups, and a dashed green `Polyline` tracing the optimized route.
- Renders an ordered stop list below the map showing seller name, materials, kg, and cumulative distance delta.
- Loading state: three `animate-pulse` skeleton rows for stats, map, and list.
- Empty state (no accepted bookings): map area replaced by a centered `font-data` message.
- All styling via Tailwind v4 utilities and CSS custom property tokens; no raw hex values.

## Validation

- `npx eslint src/hooks/useSmartRoute.js src/components/SmartRouteMap.jsx --max-warnings=0` — passes with zero errors or warnings.
- No TypeScript, no JSDoc, no multi-line comment blocks.
- Imports resolve to existing files: `../lib/supabase`, `../utils/haversine`, `react-redux`, `react-leaflet`, `leaflet`.

## Notes

- Default map center is Chiang Mai (18.7883, 98.9853) when shop location is unavailable.
- `haversineKm` export from `src/utils/haversine.js` confirmed present before writing.
- Component is not yet wired into any page or route; integration is a separate task.
