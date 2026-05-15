# Fix-PricingCleanDirty.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview

Removed the A/B/C three-grade pricing system and replaced it with a two-level Clean/Dirty model throughout the pricing feature.

## Reason

The A/B/C grade structure added unnecessary complexity. The application only needs two tiers — สะอาด (clean) and ไม่สะอาด (dirty) — which map directly to `pricePerKg(mat, true)` and `pricePerKg(mat, false)` respectively. The Supabase columns `price_grade_a` and `price_grade_c` are reused as the canonical storage for clean and dirty prices; `price_grade_b` is no longer written.

## Changes

### `src/store/pricingSlice.js`
- `buildDefaultPrices` now sets `{ clean, dirty }` per material using `pricePerKg(mat, true)` and `pricePerKg(mat, false)`.
- `loadFromStorage` detects stale A/B/C format (by checking `firstMat?.A !== undefined`) and discards it, clearing both `gp_pricing` and `gp_pricing_savedAt` from localStorage so users get fresh defaults.
- Removed `setPrice` reducer (was grade-specific; no longer needed).
- Retained `bulkSet` and `resetToDefault` unchanged in behaviour.
- Export list updated: `setPrice` removed.

### `src/pages/PricingPage.jsx`
- `buildDefaultPrices` mirrors the slice change: `{ clean, dirty }` keys.
- `loadShopPricing` selects only `price_grade_a, price_grade_c`; maps them to `clean` and `dirty`.
- `handleChange(mat, field, raw)` — `field` is now `'clean'` or `'dirty'`.
- `handleSave` Supabase upsert maps `clean → price_grade_a`, `dirty → price_grade_c`; `price_grade_b` is omitted.
- Grid header changed from `grid-cols-4` to `grid-cols-3`; columns are now: material | สะอาด | ไม่สะอาด.
- Each material Card changed from `grid-cols-4` to `grid-cols-3`; renders two inputs iterating over `[['clean', marketClean], ['dirty', marketDirty]]`.
- Market rate hint line now shows `฿{marketClean} / ฿{marketDirty}` (was three values).
- i18n references updated to `t.gradeClean` and `t.gradeDirty`.

### `src/i18n/th.js`
- Replaced `gradeA`, `gradeB`, `gradeC` with `gradeClean: 'สะอาด (฿/กก.)'` and `gradeDirty: 'ไม่สะอาด (฿/กก.)'`.

### `src/i18n/en.js`
- Replaced `gradeA`, `gradeB`, `gradeC` with `gradeClean: 'Clean (฿/kg)'` and `gradeDirty: 'Dirty (฿/kg)'`.

### `src/hooks/useMarketPricing.js`
- No changes required. Already uses `price_grade_a`/`price_grade_c` and maps to `clean` boolean via `marketPrice(materialType, clean)` and `shopPrice(shopId, materialType, clean)`.

## Validation

- `npm run lint` — passes with zero errors or warnings.
- Manual browser check: PricingPage grid renders 3 columns; each material card shows two editable inputs.
- Save writes `price_grade_a` (clean) and `price_grade_c` (dirty) to Supabase; `price_grade_b` is not touched.
- On page reload with stale localStorage (A/B/C keys), the old data is discarded and defaults are regenerated in clean/dirty format.

## Notes

- `price_grade_b` column in `shop_pricing` table is left in the database schema intact; it is simply no longer written to. A future migration can drop it if desired.
- `useMarketPricing` aggregates `A[]` and `C[]` arrays from Supabase rows; the internal keys remain `'A'` and `'C'` in that hook only — this does not affect the pricing store or PricingPage.
