# Feature-BasketManualPricing.00

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Three linked improvements to the basket flow:
1. Market pricing averaged from real `shop_pricing` rows in Supabase
2. Per-shop price comparison in route cards (vs market average)
3. Manual basket entry — add waste by type + grade + weight without scanning

## Reason

Users want to compare which shop pays best for their items. Some users don't want to scan photos — they know what they have and just want to enter it manually. Prices should reflect what shops actually offer, not static reference values.

## Changes

### `src/hooks/useMarketPricing.js` (new)
- Fetches `shop_pricing` (material_type, price_grade_a/b/c) for all active shops
- Computes per-material per-grade **average** across shops
- `marketPrice(mat, grade)` — returns market avg, falls back to static `pricePerKg` if no shop data
- `shopPrice(shopId, mat, grade)` — returns one specific shop's price (null if not set)

### `src/hooks/useShops.js`
- Select query now joins `shop_pricing(...)` so each shop object includes its pricing rows

### `src/pages/BasketPage.jsx`
- All `pricePerKg(...)` calls replaced with `marketPrice(...)` from `useMarketPricing`
- **Basket filter**: when basket has >1 material type, chip buttons appear to show only one type at a time
- **Manual add panel**: "+ Add manually" toggle in header; collapsible panel with material chip grid, A/B/C grade selector, weight input → dispatches `addToBasket` with `source: 'manual'` badge
- **Route cards**: each shop card now shows `฿{shopTotal}` (shop's own prices) and `+/- diff vs market avg`; multi-stop cards show per-stop subtotal
- `handleBook` uses shop-specific price for `estValue` (falls back to market avg)

### `src/i18n/en.js` + `src/i18n/th.js`
- Added: `addManually`, `marketAvg`, `shopOffers`, `filterBasket`, `allItems`, `selectMaterial`, `selectGrade`, `addItem`

## Validation

- `npm run lint` passes 0 errors in `src/`
- Manual add: select material chip → set grade → enter weight → Add → item appears in basket with "manual" badge
- Filter: when >1 material type in basket, filter chips appear; selecting one hides other materials
- Route card: shop with higher-than-avg pricing shows green `+X vs avg`; lower shows orange `-X vs avg`
- Falls back gracefully: if `shop_pricing` table is empty (no shops configured yet), `marketPrice` returns static `pricePerKg` values

## Notes

- `useShops` join query `shops.*, shop_pricing(...)` requires Supabase to have the FK relationship — this is defined in `001_init.sql`
- Market avg is recomputed on every page mount; no caching yet (acceptable for MVP)
