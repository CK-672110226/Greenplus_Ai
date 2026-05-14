# Fix-MapMarketplaceHeatmapNav.00

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Fixed 6 production bugs reported on the live Vercel app. All changes are on branch `fix/map-marketplace-heatmap-buyernav`.

## Reason

User reported via live URL testing: map doesn't ask for GPS / box won't open, marketplace still has mock data, heatmap has mock data, buyer dashboard on mobile shows user layout, landing page has double navbar.

## Changes

### `src/App.jsx`
- Moved `/`, `/login`, `/x/admin` routes **outside** `<SmartLayout />` wrapper.
- LandingPage and LoginPage manage their own full-page layout; having them inside SmartLayout caused NavBar to render twice (SmartLayout NavBar + LandingPage's own header).

### `src/layouts/SmartLayout.jsx`
- Changed loading guard from `if (loading)` to `if (loading || (session && !profile))`.
- Root cause of buyer-mobile-shows-user-layout: `setSession` sets `loading=false` immediately but `fetchOrCreateProfile` is async. There was a window where `loading=false`, `session=set`, `profile=null` → SmartLayout fell through to the default NavBar render. Now SmartLayout waits until profile is also populated before choosing a layout.

### `src/pages/LandingPage.jsx`
- Added `supabase` import and a `useEffect` that fetches the real active shop count from the `shops` table (publicly readable by anon).
- Replaced hardcoded `STATS` constant (`12,480 kg recycled`, `฿ 286k paid out`, `340+ active buyers`) with dynamic `stats` array: first two show `—`, third shows real shop count.

### `src/pages/MapPage.jsx`
- Added `useGPS()` hook; auto-requests location on mount via `useEffect`.
- Added `ChangeView` inner component that calls `map.flyTo()` when GPS coordinates arrive.
- Added GPS status strip: shows "Getting location…" / "Use my location" button / "✓ Location acquired".
- Added null guard: shop markers only render when `shop.lat != null && shop.lng != null`.
- Changed Leaflet icon loading from CDN URLs to `import markerIcon from 'leaflet/dist/images/marker-icon.png'` (avoids CDN/CSP issues in production that caused the map box not to render).
- Added `position: relative`, `zIndex: 0`, `overflow: hidden` to the map container div.

### `src/pages/MarketplacePage.jsx`
- Removed: `TRENDS` (7-day fake price history), `BUYING_REQUESTS` (4 mock shops), `MiniMap` SVG component, `Sparkline` SVG component, `RequestCard` component.
- Added: `useShops()` and `useMarketPricing()` hooks.
- Pricing table: uses `marketPrice(key, 'A')` from `useMarketPricing` instead of static `pricePerKg`. Removed sparkline column; table now 2 columns (material + price).
- Table header now shows `Avg · N shops` when real pricing data exists.
- Right panel: replaced mock buying requests with real shops from `useShops()` filtered by current category. New `ShopCard` component shows shop name, area, accepted materials, market price.
- Footer text now reflects real source count: `source: N active shops`.
- `PostAdForm`: uses `marketPrice` from hook as suggested price, falls back to static `pricePerKg`.

### `src/pages/AdminPage.jsx`
- Removed `HEATMAP_DATA` 10×10 mock grid, `DISTRICTS` array, `heatColor` function.
- Heatmap tab now shows empty state card: "No scan data yet / Heatmap requires aggregate scan_history data (milestone A-05)".

## Validation

- `npm run lint` — no errors in `src/`.
- `npm run build` — clean build, all chunks produced correctly.
- All 6 bugs addressed:
  1. Double navbar on `/` — fixed (LandingPage outside SmartLayout)
  2. Landing page mock stats — fixed (real shop count + `—`)
  3. Map GPS — fixed (auto-request + status UI + re-center)
  4. Map box not rendering — fixed (node_modules icon imports + container CSS)
  5. Marketplace mock data — fixed (real hooks, no TRENDS/BUYING_REQUESTS/MiniMap)
  6. Heatmap mock — fixed (empty state)
  7. Buyer mobile shows user layout — fixed (SmartLayout waits for profile)

## Notes

- Real heatmap data will be added in milestone A-05 (requires `scan_history` aggregate query grouped by district polygon).
- `kg recycled` and `paid out` stats on the landing page remain `—` until a public Supabase Edge Function or DB view exposes aggregate data anonymously.
