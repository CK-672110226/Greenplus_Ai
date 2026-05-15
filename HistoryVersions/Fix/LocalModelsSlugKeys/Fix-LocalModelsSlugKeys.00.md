# Fix-LocalModelsSlugKeys.00

## Date
16 May 2026 (16 พฤษภาคม 2569)

## Overview
Fixed `src/config/localModels.js` so YOLO and TM class labels use WASTE_ITEMS English slug keys instead of Thai display strings. This was the root cause of ฿0 prices on all pages: `pricePerKg(materialType, ...)` does a key lookup on WASTE_ITEMS — when `materialType` was `'กระดาษลัง'` the lookup failed and returned 0.

## Reason
`pricePerKg()` in `src/data/wasteItems.js` uses English slugs (`cardboard`, `glass`, etc.) as keys. The AI pipeline sets `materialType` from the class label arrays in `localModels.js`. Labels were Thai strings → lookup always missed → price = 0 everywhere (ScanPage batch queue, HomePage last-scan card, BasketPage total, PricingPage table).

## Changes

### `src/config/localModels.js`
- `LOCAL_YOLO_CLASS_LABELS`: Changed indices 1–5 from Thai strings to WASTE_ITEMS slugs.
  - Index 0 (`'ไม่ใช่ขยะ'`) kept unchanged — `twoStageAI.js` filters this sentinel string for troll detection.
  - `'กระดาษลัง'` → `'cardboard'`
  - `'ขวดแก้ว'` → `'glass'`
  - `'เหล็ก'` → `'aluminum_can'`
  - `'กระดาษ'` → `'newspaper'`
  - `'พลาสติก'` → `'mixed_plastic'`
- `LOCAL_STAGE1_LABELS`: Changed all 11 Thai label strings to WASTE_ITEMS slugs.
  - `'ขวดน้ำ'` → `'pet_bottle_clear'`
  - `'เหล็ก'` / `'อลูมิเนียม'` → `'aluminum_can'`
  - `'กระดาษ'` / `'หนังสือ'` → `'newspaper'`
  - `'กระดาษลัง'` → `'cardboard'`
  - `'พลาสติก'` → `'mixed_plastic'`
  - `'ขวดแก้ว'` → `'glass'`
  - `'น้ำมันเก่า'` → `'cooking_oil'`
  - `'เครื่องใช้ไฟฟ้าเสีย'` → `'ไม่ใช่ขยะ'` (e-waste not in WASTE_ITEMS; reject as non-recyclable)
  - `'ไม่ใช่ขยะ'` kept as troll sentinel
- `LOCAL_STAGE2_URLS`: Changed all Thai string keys to matching WASTE_ITEMS slug keys.
  - Physical model folder paths under `public/model_ai/` are unchanged (still Thai names).

## Validation
- `pricePerKg('cardboard', true)` → 3 (was 0 when key was `'กระดาษลัง'`)
- `pricePerKg('glass', false)` → 0.7 (was 0)
- Troll detection: YOLO index-0 detections still produce `materialType: 'ไม่ใช่ขยะ'` → filtered by `twoStageAI.js` line 98 → `{ troll: true }` response
- Stage-2 URL lookup: `tmStage2Urls['pet_bottle_clear']` now resolves correctly

### `src/pages/ScanPage.jsx` — multiResult path fixes
- Added `setResult(infer.multiResult[0])` + `dispatch(setLastScan(infer.multiResult[0]))` in the YOLO multiResult path so Live Analysis panel always shows the highest-confidence detection.
- Added dirty-popup trigger: when YOLO returns a single dirty item in normal (non-batch) scan mode, `setPendingItem` + `setDirtyAlert(true)` + `setPhase('result')` now fire — same behaviour as the TM/ONNX single-item path.

## Notes
- `LOCAL_STAGE2_URLS` folder paths (`/model_ai/ขวด/`, `/model_ai/ลัง/`, etc.) are unchanged — those are physical directories in `public/`, not materialType labels.
- If the YOLO model's actual training class index differs from the comment assumptions, re-check the training metadata and update index → slug mapping accordingly.
- Dirty popup in batch mode (or when YOLO returns multiple items): items go straight to queue — no popup. This is intentional; interrupting once per item in batch would break the scanning flow.
