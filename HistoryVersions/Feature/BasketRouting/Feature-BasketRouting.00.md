# Feature-BasketRouting.00

**Date:** 13 May 2026 (13 พฤษภาคม 2569)

## Overview
Implements PRD user stories U-11 (Single Shop), U-12 (Multi-Stop Route), and U-13 (skip unmatched items) inside BasketPage.

## Reason
Without shop-matching, the basket is a dead end — users cannot take action after scanning. Route planning is a core "Must Have" feature for the pilot.

## Changes

### `src/data/shops.js` (NEW)
- Shared shop list (6 shops) extracted so BasketPage and MapPage consume the same data source
- Added `area` field to each shop entry

### `src/pages/BasketPage.jsx`
- `computeRoutes(basket)` pure function:
  - Filters non-skipped items, deduplicates `materialType` set
  - **Single shop**: finds shops where `accepts` is a superset of `neededMaterials`, sorted by `distanceKm`
  - **Multi-stop**: for each material, picks nearest accepting shop; groups by shop ID into stop objects; sorts stops by distance
  - Returns `{ single, multi, unmatched, materials }`
- **Find Route** button toggles route panel below total card
- Mode toggle (Single Shop / Multi-Stop) using the design system tab-button pattern
- Single shop results: up to 3 shops with distance, area, "Accepts All" label, Open in Maps button
- Multi-stop results: numbered stops with materials assigned + Open in Maps per stop
- Unmatched materials listed in orange when no shop covers them (U-13)
- `openMaps(shop)` opens Google Maps search at shop coordinates in new tab

### `src/pages/MapPage.jsx`
- Removed inline `SHOPS` constant
- Now imports `{ SHOPS }` from `../data/shops`

### `src/i18n/en.js` + `src/i18n/th.js`
- Added: `findRoute`, `routeMode`, `noAcceptingShop`, `totalDistance`, `openInMaps`

## Validation
- `npm run lint` — 0 errors
- `npm run build` — succeeds
- Basket with mixed materials: Single Shop shows only กรีน พอยท์ CM (accepts all 5); Multi-Stop shows correct shop-per-material grouping

## Notes
Distance values are static mock data. Real distance will use Haversine formula against user GPS coordinates (M10 final).
