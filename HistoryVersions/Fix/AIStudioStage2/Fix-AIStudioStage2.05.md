# Fix-AIStudioStage2.05

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Three interlocking improvements to the AI Studio pipeline: (1) local Teachable Machine models are now served as Vite static files so the app works without remote model hosting; (2) the stage 2 cleanliness result was simplified from a letter grade (A/B/C) to a binary Pass/Fail (สะอาด/ไม่สะอาด) throughout the stack; (3) the EcoPoints feature was removed from all navigation and routing. A location field (lat/lng + browser geolocation) was also added to MarketplacePage listings.

## Reason

- **Local models**: The previous design fetched model URLs from Supabase. When Supabase returned nothing (empty table, offline, or unregistered model), stage 2 silently failed. Serving from `public/model_ai/` makes the app self-contained.
- **Grade → Pass/Fail**: A three-tier grade added complexity without meaningful business value for sellers. Price impact (×1.0 / ×0.7) maps cleanly to a binary state, and Thai UI labels (สะอาด/ไม่สะอาด) are easier to understand.
- **EcoPoints removal**: The EcoPoints feature was not part of the current milestone scope and cluttered navigation for both users and buyers.
- **Marketplace location**: Buyers need to know pickup coordinates; seller location captured via geolocation API on listing creation.

## Changes

### `public/model_ai/` (new directory)

- Moved `model_ai/` from repo root to `public/model_ai/` so Vite serves all TM model files (`model.json`, `weights.bin`, `metadata.json`) as static assets under `/model_ai/`.

### `src/config/localModels.js` (new file)

- Defines `STAGE1_MODEL_URL` pointing to `/model_ai/stage1/model.json`.
- Defines `STAGE1_LABELS` — array of 11 Thai material class names used by stage 1 classification.
- Defines `STAGE2_MODEL_URLS` — object mapping 7 material keys to their local TM model URLs. Materials without a stage 2 model (`หนังสือ`, `อลูมิเนียม`, `เครื่องใช้ไฟฟ้าเสีย`) are intentionally absent from this map (omission = auto-pass).

### `src/hooks/useActiveModels.js`

- Added fallback: when `fetchActiveModels()` from Supabase returns an empty array or throws, the hook now returns values from `localModels.js` instead of leaving model URLs undefined.

### `src/data/wasteItems.js`

- Removed `GRADE_MULTIPLIERS` constant (was `{ A: 1.0, B: 0.85, C: 0.7 }`).
- Rewrote `pricePerKg(materialType, clean)` signature: `clean` is a boolean; returns `basePrice` when `true`, `basePrice × 0.7` when `false`.

### `src/services/tmInference.js`

- Stage 2 inference output changed from `{ grade, score }` to `{ pass, cleanlinessScore }`.
- `pass` is `true` when the model's top class maps to the "clean" category, `false` otherwise.
- `cleanlinessScore` is the raw confidence value (0–1) for display purposes only.

### `src/services/twoStageAI.js`

- Pipeline output changed: removed `grade`, `factorScores`, and `score` fields.
- Added `stage2Pass` (boolean) and `stage2Skipped` (boolean).
- When a material has no entry in `STAGE2_MODEL_URLS`, `stage2Pass` is set to `true` and `stage2Skipped` to `true` — preserving full price for those materials automatically.

### `src/components/GradeTag.jsx`

- Rewritten to accept a `clean` boolean prop instead of `grade` string.
- Renders green "สะอาด" badge when `clean === true`; red "ไม่สะอาด" badge when `false`.
- Removed all A/B/C colour logic.

### `src/hooks/useMarketPricing.js`

- `marketPrice(materialType, clean)` now takes a boolean `clean`.
- Internally maps `clean → grade A` and `!clean → grade C` for backward-compatible price lookup, then returns the numeric price.

### `src/pages/ScanPage.jsx`

- Reads `stage2Pass` and `stage2Skipped` from the AI result instead of `grade`.
- Passes `clean={stage2Pass}` to `<GradeTag>`.
- Removed `<ContaminationMeter>` component render and `factorScores` display block.

### `src/pages/BasketPage.jsx`

- All references to `item.grade` replaced with `item.clean` (boolean).
- Price calculation calls `pricePerKg(materialType, clean)` with the boolean.
- `<GradeTag>` updated to use `clean` prop.

### `src/pages/MarketplacePage.jsx`

- Grade selector filter replaced with สะอาด/ไม่สะอาด toggle.
- Added location capture: lat/lng fields on the listing form, and a "ใช้ตำแหน่งปัจจุบัน" button that calls `navigator.geolocation.getCurrentPosition()` to auto-fill coordinates.

### `src/store/marketplaceSlice.js`

- Removed `gradeFilter` state and its reducer.
- Added `cleanFilter` (boolean | null) state for the สะอาด/ไม่สะอาด toggle.
- Listing schema now includes `lat` and `lng` fields.

### `src/App.jsx`

- Removed the `/eco-points` route and the lazy `EcoPointsPage` import.

### `src/layouts/UserLayout.jsx`

- Removed the EcoPoints entry from `mainNav`.

### `src/components/NavBar.jsx`

- Removed the eco-points navigation link.

### `src/pages/HomePage.jsx`

- Removed the `eco_points` stat display card from the dashboard summary.

## Validation

- Models are served from `/model_ai/` via Vite static serving; no Supabase model record required.
- Stage 2 is skipped (auto-pass) for: `หนังสือ`, `อลูมิเนียม`, `เครื่องใช้ไฟฟ้าเสีย`.
- Price rule: สะอาด = `basePrice × 1.0`; ไม่สะอาด = `basePrice × 0.7`.
- `npm run lint` passes with 0 errors, 0 warnings.

## Notes

- `ContaminationMeter` component remains in the codebase but is no longer rendered; it can be removed in a future cleanup pass.
- The `STAGE2_MODEL_URLS` map in `localModels.js` is the single source of truth for which materials have a stage 2 model. Adding a new material only requires adding one entry to that map.
