# Feature-PageDesign.03

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Senior fullstack audit: fixed basket earnings bug, added route-level code splitting and Vite chunk splitting.

## Reason

- `i.estValue` was never stored in Redux basket items → HomePage always showed ฿0 earnings
- All 12 pages eagerly imported in App.jsx → 812 KB initial JS bundle (no lazy loading)
- ONNX runtime (26 MB WASM + 396 KB JS) loaded on every page visit, not just Scan
- Vite 8 (rolldown) required `manualChunks` as a function, not an object

## Changes

### `src/pages/HomePage.jsx`
- Fixed `totalValue` calculation: was `i.estValue ?? 0` (always 0, never set)
- Now: `pricePerKg(i.materialType, i.grade) * (i.weight ?? 0)` — consistent with BasketPage
- Same fix applied to basket item row display
- Added `pricePerKg` to imports

### `src/App.jsx`
- Added `lazy()` imports for all 10 authenticated pages
- LandingPage, LoginPage, AdminLoginPage remain eagerly loaded (needed on first paint)
- Wrapped `<Routes>` in `<Suspense fallback={<PageFallback />}>`
- `PageFallback` component: full-viewport centered "Loading…" in mono uppercase

### `vite.config.js`
- Added `build.rollupOptions.output.manualChunks` function (rolldown requires function, not object)
- Chunks: `vendor` (React/Router/Redux), `supabase` (@supabase), `onnx` (onnxruntime-web)

## Build Results (before → after)

| Metric | Before | After |
|--------|--------|-------|
| Initial JS bundle | 812 KB (231 KB gzip) | 130 KB index + 253 KB vendor = ~383 KB total |
| ONNX loads on | Every page | Only /scan and /admin |
| Supabase loads on | Every page | On auth actions |
| Per-page chunks | None | 4–18 KB each |

## Validation

- `npm run build` — successful, no errors
- `npm run lint` — zero errors
- Basket earnings now correctly computed from `pricePerKg × weight`
