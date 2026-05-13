# Feature-AdminPanel.01 — AI Suite (C-06, C-07, C-10, C-12)

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Implements the full AI pipeline suite on branch `feat/ai-suite`:

- **C-06** — Two-stage AI architecture (material classification + cleanliness scoring)
- **C-07** — Admin AI Studio (per-class image upload, simulated training, model deploy)
- **C-10** — Supabase `scan_history` insert hook
- **C-12** — ONNX Runtime Web inference framework with mock fallback

## Reason

Replace the single-step mock inference in ScanPage with a production-ready two-stage pipeline. Provide admins with a Teachable Machine–style UI to upload training data, simulate training, and deploy model versions that propagate to all users via Redux aiConfig.

## Changes

### New files

| File | Purpose |
|------|---------|
| `src/services/onnxInference.js` | C-12: ONNX Runtime Web inference. Loads session (cached), preprocesses image to 224×224 NCHW Float32 with ImageNet normalisation. Returns `Float32Array` logits or `null` on failure. Exports `runOnnx`, `softmax`, `clearModelCache`. |
| `src/services/twoStageAI.js` | C-06: Two-stage pipeline. Stage 1 (type + size) → Stage 2 (cleanliness → grade). Each stage tries ONNX first, falls back to mock. Confidence threshold gate between stages. |
| `src/hooks/useScanInsert.js` | C-10: `useCallback` hook that inserts scan results to Supabase `scan_history`. Silent fail if Supabase unconfigured. |

### Modified files

| File | Changes |
|------|---------|
| `src/store/aiConfigSlice.js` | Added `onnxStage1Url`, `onnxStage2Url`, `modelVersion` fields persisted to `localStorage`. |
| `src/pages/ScanPage.jsx` | Replaced `mockInfer()` with `twoStageInfer(videoRef.current, aiConfig)`. Calls `insertScan(result)` on add. Removed unused `WASTE_ITEMS` and `MATERIALS` imports. |
| `src/pages/AdminPage.jsx` | Added "AI Studio" tab (C-07): 8-class image upload grid, simulated training progress bar, Deploy button that dispatches `onnxStage1Url`/`onnxStage2Url`/`modelVersion` to aiConfigSlice. Added `ClassUploadCard` helper component. |
| `src/i18n/en.js` | Added AI Studio i18n keys: `aiStudio`, `trainingClasses`, `studioHint`, `addImages`, `noImagesYet`, `trainModel`, `training`, `deployModel`, `modelDeployed`, `trainFirst`, `studioActiveVer`. |
| `src/i18n/th.js` | Same keys in Thai. |
| `package.json` / `package-lock.json` | Added `onnxruntime-web` dependency. |

## Validation

- `npm run lint` — 0 errors, 0 warnings
- `npm run build` — 186 modules, build successful (ONNX wasm is large; chunking advisory only, not an error)

## Notes

- The Studio "Train Model" simulation increments a progress bar over ~2 seconds using `setInterval` at 80ms. No real Teachable Machine API call is made in this revision.
- Deploy writes `local://<version>-s1` / `local://<version>-s2` as ONNX URLs. These will not trigger real ONNX inference (no valid URL), so `runOnnx` returns `null` and the two-stage pipeline falls back to mock — consistent UX for development.
- When S-08 (Supabase Storage upload) is complete, the deploy handler can be updated to write a real bucket URL.
