# Fix-MarketplaceCrash.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Critical crash fix for MarketplacePage + layout height fix for inner-scroll panels + GPS cleanup.

## Root Cause

`MarketplacePage.jsx:162` called `pricing.map(p => p.shop_id)` where `pricing` is the `{}` object returned by `useMarketPricing`. Objects don't have `.map()`. This threw `TypeError: pricing.map is not a function` on every render, crashing the entire React app (no ErrorBoundary caught it), leaving a blank paper-color background on all pages.

## Changes

### `src/hooks/useMarketPricing.js`
- Added `shopPricing` to the return value (was internal state, never exported)

### `src/pages/MarketplacePage.jsx`
- Line 139: destructure `shopPricing` instead of `pricing` from `useMarketPricing`
- Line 162: `pricing.map(...)` → `shopPricing.map(...)` — fixes the crash
- ShopCard line 37: `font-brand` → `font-data` on price (missed from design audit)
- Pricing table row price: `font-brand` → `font-data`

### `src/layouts/UserLayout.jsx`
- `main.flex-1.pb-[68px]` → `main.flex-1.min-h-0.overflow-y-auto.pb-[68px]`
- `min-h-0` prevents flex child from overflowing its container; `overflow-y-auto` enables inner panel scroll (needed by MarketplacePage and ScanPage)

### `src/layouts/BuyerLayout.jsx`
- `main.flex-1` → `main.flex-1.min-h-0.overflow-y-auto`
- Same fix for buyer shell

### `src/pages/MapPage.jsx`
- Destructure `request` as `requestGPS` from `useGPS()`
- Pass `requestGPS` as proper dep to `useEffect` (removes the eslint-disable comment)

## Validation

- `npm run lint` — 0 errors
- `npm run build` — 205 modules, clean

## Notes

- The GPS auto-request was already working correctly — the crash in MarketplacePage was making the whole app blank, which made it appear that Map was also broken.
- After this fix, navigating to `/marketplace` will render without crashing.
