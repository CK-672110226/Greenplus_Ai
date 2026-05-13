# Feature-SmartMap.00

**Date:** 13 May 2026 (13 พฤษภาคม 2569)

## Overview
Implemented the Smart Map page (M5) using React-Leaflet to display junk shops near Chiang Mai with filterable markers.

## Reason
Users need to find nearby recycling shops. An interactive map with shop locations, accepted materials, and navigation links is essential for the core user journey.

## Changes

### src/pages/MapPage.jsx (UPDATED)
- Imports `MapContainer, TileLayer, Marker, Popup` from `react-leaflet`, `L` from `leaflet`
- Leaflet icon bug fixed via `L.Icon.Default.mergeOptions` with CDN icon URLs
- `leaflet/dist/leaflet.css` imported
- Map centered on Chiang Mai `[18.7883, 98.9853]`, zoom 13
- 5 mock shop markers with realistic CM coordinates covering neighborhoods: นิมมาน, ช้างเผือก, สุเทพ, ป่าตัน, CMU area
- Each Marker Popup: shop name, distance, accepted materials (localized), "Get Directions" link (opens Google Maps)
- Material filter bar above map: "all" + each of 8 waste material types
- Filtered view hides shops that don't accept the selected material

## Validation
- `npm run lint` passes
- `npm run build` succeeds (leaflet bundled)

## Notes
react-leaflet v5 and leaflet v1.9.4 were already in package.json.
