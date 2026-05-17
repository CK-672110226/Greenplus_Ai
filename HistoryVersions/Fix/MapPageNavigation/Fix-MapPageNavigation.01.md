# Fix-MapPageNavigation.01

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview
Removed all Google Maps URL references from the project and replaced them with OpenStreetMap / CARTO equivalents. Added GTA-style route polyline and 5 km radius circle to MapPage. Added CARTO tile layer consistency to UserTrackingPanel. Added Leaflet mini-map to the active order section of RiderDashboardPage.

## Reason
The project uses react-leaflet + leaflet (already installed). No Google Maps API key is configured or should ever be used. Three files contained `maps.google.com` or `google.com/maps` URLs that would silently fail or expose API billing risks.

## Changes

### `src/pages/MapPage.jsx`
- Added `Circle` and `Polyline` to react-leaflet import.
- Added `routeTo` state (`useState(null)`) for tracking which shop the user navigated to.
- Replaced `maps.google.com/maps?daddr=…` onClick with an OpenStreetMap directions URL (uses GPS `from` when available, falls back to a plain pin URL).
- Button label changed from `{t.directions} →` to `Navigate →`.
- `setRouteTo(shop)` is called alongside the OSM link so the map draws a route line.
- Added `<Circle>` overlay (5 km, green dashed, 4% fill) around the user's GPS position inside `<MapContainer>`.
- Added `<Polyline>` (green dashed, weight 3) from user GPS to `routeTo` shop position.
- Added route info banner (`position: absolute`, z-index 1000) inside the map container div; shows shop name and a clear button (`setRouteTo(null)`).

### `src/pages/BasketPage.jsx`
- Replaced `openMaps()` body: was `google.com/maps/search/?api=1&query=…`; now uses `openstreetmap.org/directions?from=…&to=…` when GPS is available, else a plain pin URL.
- No new imports required — `useGPS` was already imported and `gps` was already in scope.

### `src/components/UserTrackingPanel.jsx`
- Replaced OSM tile URL (`tile.openstreetmap.org`) with CARTO light tile URL (`basemaps.cartocdn.com/light_all`) to match the rest of the app.
- Updated attribution text from OpenStreetMap to CARTO.

### `src/pages/RiderDashboardPage.jsx`
- Added imports: `MapContainer`, `TileLayer`, `Marker` from `react-leaflet`; `L` from `leaflet`; `leaflet/dist/leaflet.css`.
- Added Leaflet icon fix block (`delete L.Icon.Default.prototype._getIconUrl` + `mergeOptions`).
- Defined `riderMiniIcon` (blue marker) and `pickupMiniIcon` (green marker) using pointhi color markers.
- In the "Active Order" section (`showActive`), added a 200 px tall `<MapContainer>` showing:
  - Green marker at `activeOrder.pickup_lat / pickup_lng` (seller pickup point).
  - Blue marker at `gpsLat / gpsLng` (rider's current position).
  - CARTO light tile layer.
  - `zoomControl={false}` and `dragging={false}` for a compact static view.
- Map only renders when both `activeOrder.pickup_lat` and `gpsLat` are non-null.

## Validation
- `npm run lint` — 0 errors, 0 warnings.
- No Google Maps URLs remain in any source file.
- All map tiles use CARTO endpoints (consistent with the rest of the app).
- Leaflet icon fix applied in RiderDashboardPage to prevent broken default pin icons in Vite.

## Notes
- `gpsLng` is always valid when `gpsLat` is non-null because `useGPS` sets both atomically.
- The route banner uses `whiteSpace: 'nowrap'` to prevent wrapping on small screens.
- Polyline uses `dashArray: '8 5'` to produce a GTA-minimap-style dashed route line.
