# Feature-AiScannerMvp.01

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Senior ML/AI pipeline hardening: fixed softmax overflow, ONNX bounds check, session cache invalidation on deploy, Claude API timeout, WASTE_MATERIALS single source of truth, confidence threshold unification, and MODEL_OPTIONS update.

## Reason

- `softmax` used `Math.max(...logits)` spread — call stack overflow on ONNX models with 1000+ output classes (ImageNet)
- `onnxStage1` did not check `logits.length` before indexing — silent wrong-material output with mismatched models
- `handleDeploy` dispatched new ONNX URLs without calling `clearModelCache` — old sessions kept running after deploy
- `secondBrain.js` had no fetch timeout — Claude API call could hang indefinitely
- `WASTE_MATERIALS` hardcoded in `secondBrain.js` duplicating `wasteItems.js` — two sources of truth for material list
- Confidence threshold default was `0.7` in `secondBrain.js` vs `0.6` everywhere else
- `MODEL_OPTIONS` used wrong label format ("Claude claude-haiku-4-5") and was missing Opus 4.7

## Changes

### `src/services/onnxInference.js`
- Replaced `Math.max(...logits)` spread with an explicit loop in `softmax`
- `softmax` now uses `Float64Array` for exp accumulator (more numerically stable than JS number array)
- Returns a plain `Array` of probabilities (same as before, compatible with callers)

### `src/services/twoStageAI.js`
- `onnxStage1`: added guard `if (!logits || logits.length < MATERIALS.length) return null`
- `onnxStage1`: replaced `Math.max(...probs)` top-index search with explicit loop
- `onnxStage1`: uses `logits.slice(0, MATERIALS.length)` before softmax when ONNX model has more outputs than material classes

### `src/services/secondBrain.js`
- Removed hardcoded `WASTE_MATERIALS` array; now derived from `Object.keys(WASTE_ITEMS)` imported from `wasteItems.js`
- Added `AbortController` with 15s timeout on Claude API fetch
- `confidenceThreshold` default changed from `0.7` → `0.6` (matches `aiConfigSlice` and `twoStageInfer`)
- Added `response.ok` check before JSON parse
- More defensive JSON parsing: validates `materialType` against known materials, falls back to `mixed_plastic` if unknown
- `lowConfidence` flag now set on the returned object rather than only when `< threshold`
- Fallback source renamed to `'mock-fallback'` (distinguishes from intentional mock mode)
- Logs whether error was AbortError (timeout) vs other errors

### `src/pages/AdminPage.jsx`
- Added `clearModelCache` import from `onnxInference`
- `handleDeploy` now calls `clearModelCache()` before dispatching new ONNX URLs
- `MODEL_OPTIONS` updated:
  - `mock` → "Mock Inference (demo)"
  - `claude-haiku-4-5` → `claude-haiku-4-5-20251001` with label "Haiku 4.5 — fast, low cost"
  - `claude-sonnet-4-6` → "Sonnet 4.6 — balanced"
  - Added `claude-opus-4-7` — "Opus 4.7 — best accuracy"

## Validation

- `npm run lint` — zero errors
- `npm run build` — successful

## Notes

API key stored in Redux/localStorage is XSS-readable. Acceptable for pre-launch admin use only; move to server-side proxy (Supabase Edge Function) before public launch.

Weight estimation (`sizeKg`) in both mock and ONNX stage 1 is still random — a real bounding-box / depth-estimation model would be required for production accuracy. This is a known gap, not introduced here.
