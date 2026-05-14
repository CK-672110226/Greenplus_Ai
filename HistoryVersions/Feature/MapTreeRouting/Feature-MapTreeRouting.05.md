# Feature-MapTreeRouting.05

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview
Resolved all 7 merge conflicts between `feature/map-tree-routing` and `origin/main` on the `feature/map-tree-routing` branch. Build passes clean, lint clean.

## Reason
Branch had diverged significantly from main. 11 files conflicted; 4 were resolved with `--theirs` in a prior session. This version resolves the remaining 7 complex conflicts requiring manual merge.

## Changes

### `src/store/index.js`
Added `buyerSlice` (from HEAD) alongside `notificationReducer`, `scheduleReducer`, `pricingReducer` (from main). All 9 reducers now registered.

### `src/services/twoStageAI.js`
Kept HEAD's multi-factor `onnxStage2` return shape (`{ pass, weightedScore, factorScores, grade, failReasons }`). Added main's Vertex AI Stage 2 path (`vertexStage2Endpoint ? await vertexStage2(...)`) in the pipeline entry point.

### `src/pages/ScanPage.jsx`
- Base: main's 3-panel layout (Camera | Batch Queue | Live Analysis)
- Added from HEAD: `hasStream` state, `dirtyAlert` state + `handleConfirmClean`/`handleRejectClean`
- `handleAddSingle` now checks `factorScores.cleanliness < 5` and shows the dirty-alert overlay before adding to basket
- Dirty-alert renders as a fixed overlay with "Yes, I washed it" / "No, not yet" CTA

### `.github/workflows/preview.yml`
Kept HEAD's full Vercel deploy steps (build → `npx vercel` → PR comment with preview URL). Updated `actions/checkout@v4` → `@v6` and `actions/setup-node@v4` → `@v6`.

### `src/pages/BasketPage.jsx`
- Nearest-Neighbor TSP algorithm from HEAD adapted to `computeRoutes(basket, shopsWithDist, userLat, userLng)` signature (uses `useShops()` real data, no static `SHOPS` reference)
- `ManualAddPanel` component from main (manual item entry)
- `BookingModal` component from HEAD (confirmation before booking)
- 2-column desktop layout (HEAD): LEFT = sticky basket items, RIGHT = route planner
- Real market pricing via `useMarketPricing()` hook throughout (replaces static `pricePerKg`)
- Shop pricing comparison ("+฿X vs avg") in single-shop route results

### `src/pages/DashboardPage.jsx`
- `useSupabaseBookings()` + `setBookings` dispatch from main (real data)
- Calendar tab (HEAD): buyers set open/closed days → dispatches to `buyerSlice`
- Materials tab (HEAD): toggle accepted material types → dispatches `toggleMaterial`
- Removed: mock weekly bar chart, pricing CRUD tab (moved to PricingPage)
- 3 tabs: Orders | Calendar | Materials

### `src/pages/MapPage.jsx`
- Desktop sidebar filter layout `md:grid-cols-[180px_1fr]` from HEAD
- `darkMode` tile switching: CARTO dark vs OSM standard (HEAD)
- GPS status strip, `ChangeView` fly-to, dynamic `mapCenter`/`mapZoom`, user location marker (main)
- Mobile filter chips row hidden on desktop; sidebar shown instead

## Validation
- `npm run lint` — 0 errors
- `npm run build` — 205 modules, 0 errors

## Notes
- `buyerSlice` provides `openDays` and `acceptedMaterials` for DashboardPage; its open-day data is NOT yet wired into `computeRoutes` (that would require passing `openDays` from Redux into `BasketPage`). This is a known gap — calendar data saves correctly but does not yet filter TSP routing candidates.
- `ScoreBar` component (referenced in HEAD's result bottom sheet) was not defined; the result bottom sheet was dropped in favour of Panel 3's live analysis display.
