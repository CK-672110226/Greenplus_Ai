# Fix-PricingMigration013b.00

16 May 2026 (16 พฤษภาคม 2569)

## Overview

Migration 013b renamed the `shop_pricing` table columns from the three-grade model
(`price_grade_a`, `price_grade_b`, `price_grade_c`) to a single-price model
(`price_per_kg`, `cap_kg`). Three frontend files still referenced the old column names
and would cause runtime errors on every Supabase query. This fix aligns all frontend
code to the new schema.

Additionally, four new specialist sections (Senior Prompt Engineer, Senior DevOps,
Clean Code / Code Reviewer, React Best Practices / React Training) were appended to
`NowProject/TASK_BREAKDOWN.md`, and missing i18n keys for On-Demand Logistics and
Buyer Onboarding were added to both `en.js` and `th.js`.

## Reason

- Supabase queries selecting `price_grade_a/b/c` would return `null` for every column
  after migration 013b applied, silently breaking pricing display and save.
- The grade-split UI (Clean / Dirty inputs) no longer matches the data model.
- i18n files lacked keys required by upcoming logistics and onboarding pages.

## Changes

### `src/hooks/useMarketPricing.js`
- SELECT changed from `price_grade_a, price_grade_b, price_grade_c` to `price_per_kg, cap_kg`.
- Aggregation logic simplified: one array of prices per material type → single average
  stored as `pricing[material]` (number, not object with A/C keys).
- `marketPrice(materialType, clean)` now returns `pricing[materialType]` directly,
  falling back to `pricePerKg(materialType, clean)`.
- `shopPrice(shopId, materialType)` signature simplified (removed `clean` param);
  reads `row.price_per_kg`.

### `src/hooks/useShops.js`
- Nested shop_pricing select changed from
  `shop_pricing(material_type, price_grade_a, price_grade_b, price_grade_c)`
  to `shop_pricing(material_type, price_per_kg, cap_kg)`.

### `src/pages/PricingPage.jsx`
- Full rewrite of data layer:
  - SELECT: `material_type, price_per_kg, cap_kg`.
  - Local state shape changed from `{ [mat]: { clean, dirty } }` to
    `{ [mat]: { price_per_kg, cap_kg } }`.
  - UPSERT payload changed to `{ shop_id, material_type, price_per_kg, cap_kg }`.
- UI changed from 3-column grid (Material | Clean | Dirty) to 4-column grid
  (Material | Price ฿/kg | Cap kg/day | Status).
- Grade selector (Clean/Dirty inputs) removed entirely.
- Redux sync on save: maps `price_per_kg` to both `clean` and `dirty` in
  `pricingSlice` for backward compatibility with basket pricing logic.
- New i18n keys consumed: `pricePerKgCol`, `capKgCol`, `statusLabel`,
  `statusActive`, `statusOff`.

### `src/i18n/en.js`
- Added section "Pricing page — new single-price columns":
  `pricePerKgCol`, `capKgCol`, `statusLabel`, `statusActive`, `statusOff`.
- Added section "On-Demand Logistics":
  `riderMode`, `goOnline`, `goOffline`, `onlineStatus`, `offlineStatus`,
  `searchingRider`, `riderFound`, `riderAccepted`, `riderArrived`,
  `orderCompleted`, `nearbyPickups`, `acceptOrder`, `verifyWeights`,
  `completeAndPay`, `cancelOrder`, `estimatedValue`, `actualWeight`, `actualValue`.
- Added section "Onboarding":
  `tellUsAboutShop`, `materialsYouBuy`, `locationAndHours`, `finishSetup`.

### `src/i18n/th.js`
- Added same key sections with Thai translations.

### `NowProject/TASK_BREAKDOWN.md`
- Appended four new specialist sections after the Summary table:
  SENIOR PROMPT ENGINEER, SENIOR DEVOPS, CLEAN CODE / CODE REVIEWER,
  REACT BEST PRACTICES / REACT TRAINING.
- All existing content preserved intact.

## Validation

- `npm run lint` should pass with no errors on changed files.
- PricingPage loads existing shop_pricing rows correctly after migration 013b is applied.
- Saving from PricingPage upserts rows with `price_per_kg` and `cap_kg` columns.
- `useMarketPricing` returns valid market averages per material type.
- `useShops` hydrates each shop with `price_per_kg` / `cap_kg` per material.

## Notes

- The `pricingSlice` internal shape (`{ clean, dirty }`) was intentionally kept
  unchanged to avoid cascading changes to BasketPage and other consumers. The save
  handler in PricingPage bridges the two shapes at the boundary.
- `shopPrice()` in `useMarketPricing` no longer accepts a `clean` param; callers
  that passed it will still work (the extra argument is ignored in JS).
