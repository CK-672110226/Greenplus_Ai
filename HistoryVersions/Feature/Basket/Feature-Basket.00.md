# Feature-Basket.00

**Date:** 12 May 2026 (12 พฤษภาคม 2569)

---

## Overview

Implements the Basket page (PRD Section 13) — a full scan-to-sell workflow where users review their scanned waste items, see pricing breakdowns, and get shop routing suggestions.

---

## Reason

M2 Basket milestone: users can accumulate waste items from the scanner, edit weights, and find the nearest shop(s) that accept their materials. Two routing modes (single shop vs. multi-stop greedy route) help maximize payout.

---

## Changes

### `src/store/wasteSlice.js`
- Added `updateWeight` reducer: mutates `weight` on a basket item by id.
- Added `toggleSkip` reducer: flips `skipped` boolean on a basket item.
- Updated `removeFromBasket` to filter by `id` (previously cleared the whole array).
- Added `skipped: false` to the `addToBasket` payload spread so the field is always present.

### `src/data/wasteItems.js` (NEW)
- `WASTE_ITEMS` object: 8 material types with Thai/English names and Grade-A price (Chiang Mai market, May 2026).
- `pricePerKg(materialType, grade)`: applies `GRADE_MULTIPLIER` (A=1.00, B=0.75, C=0.40).
- `localName(materialType, language)`: returns Thai or English name.

### `src/data/shops.js` (NEW)
- `MOCK_SHOPS`: 4 pilot-area shops (CMU rear gate area, Tambon Suthep) with accepted material lists.
- `distanceKm(lat1, lng1, lat2, lng2)`: Haversine formula, returns km rounded to 2 dp.
- `shopsWithDistance(userLat, userLng)`: annotates shops with distance, sorted nearest-first. Default origin: CMU rear gate (18.7963, 98.9536).
- `singleShopMatches(items, userLat, userLng)`: returns shops that accept **all** non-skipped items.
- `multiStopRoute(items, userLat, userLng)`: greedy nearest-first assignment — assigns each item to the nearest shop that accepts it, groups by shop, sorted by distance.

### `src/pages/BasketPage.jsx`
- Full implementation with three sub-components:
  - `BasketItem` — weight input, price/kg, line total, remove button.
  - `UnmatchedRow` — orange warning for materials no shop accepts; Skip / Remove actions.
  - `ShopCard` — shop name, distance, accepted-items list, trip total.
- Main `BasketPage`:
  - Empty-state card when basket has no items.
  - Header with grand total and "Clear basket" button.
  - Items list (Card).
  - Unmatched warnings section (shown only when needed).
  - Mode toggle (Single Shop / Route Plan).
  - Conditional results for each mode.
- Uses top-level ESM imports (no `require()`).
- `ACCEPTED_BY_ANY_SHOP` computed once at module level from `MOCK_SHOPS`.

### `src/i18n/en.js`
Added keys: `basketEmpty`, `basketTotal`, `noShopWarning`, `skipItem`, `removeItem`, `singleShop`, `multiStop`, `acceptsAll`, `stop`, `distanceKm`, `clearBasket`.

### `src/i18n/th.js`
Same keys in Thai.

---

## Validation

- `npm run lint` — zero errors, zero warnings.
- Manual browser test: empty state, add items, edit weight, skip/remove unmatched, single-shop and multi-stop routing all render correctly.

---

## Notes

- Shop data is mock (pilot area). Will be replaced with live Supabase query in M5 (Smart Map).
- `singleShopMatches` returns only shops accepting **every** non-skipped item — if none qualify, user is prompted to switch to multi-stop mode.
- Skipped items are visually dimmed (opacity-40) and excluded from routing calculations.
