# Fix-AIStudioStage2.07 — YOLO stage 1 + TM fix + upload + batch queue

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview
Major scan pipeline refactor:
1. Added YOLO ONNX stage-1 object detection (highest priority)
2. Fixed TM model loading via `@teachablemachine/image` library
3. Fixed upload mode on desktop
4. All scan results now accumulate in batch queue before going to basket

## Changes

### NEW `src/services/yoloInference.js`
- Full YOLO ONNX pipeline: letterbox preprocess (640×640), run ONNX, parse YOLOv5/v8 output, NMS
- Returns `{ materialType, confidence, bbox: {x1,y1,x2,y2}, sizeKg }` or null
- Configurable via `yoloStage1Url` + `yoloClassLabels` in aiConfig

### `src/services/tmInference.js` (rewrite)
- Replaced `tf.loadLayersModel` with `@teachablemachine/image` library
- `tmStage1`: uses `model.predict()` from TM library → returns `{className, probability}[]`
- `tmStage2`: finds สะอาด class probability for pass/fail
- `console.error` instead of `console.warn` — full stack visible in browser devtools

### `src/services/twoStageAI.js` (update)
- Stage 1 priority: YOLO → TM → ONNX classifier → Vertex AI → Mock
- Stage 2 unchanged: TM → ONNX → Vertex AI → Mock
- Passes `bbox` from YOLO through to result

### `src/store/aiConfigSlice.js`
- Added `yoloStage1Url` and `yoloClassLabels` fields

### `src/pages/ScanPage.jsx`
- Added `uploadImgRef` ref to hold uploaded Image element for re-scan
- `handleFileChange`: sets `uploadImgRef.current = img` before inference
- `handleScan`: uses `uploadImgRef.current` when `inputMode === 'upload'` (fixes desktop upload)
- `runInference`: all results now go to batch queue; dirty items show alert → confirm → queue
- Removed `handleAddSingle` (no more direct-to-basket from scan)
- `handleConfirmClean` / `handleRejectClean`: use `pendingItem` state
- `handleAddBatch`: adds all queue items to Redux basket + calls `insertScan` per item
- `isMockMode` / `aiMode`: include YOLO check; badge shows 'yolo'/'tfjs'/'onnx'/'vertex'/'demo'
- Auto-scan useEffect: unchanged (fires every 2s in camera idle mode)

## Validation
- `npm run lint` → 0 errors
- `npm run build` → ✓ built

## Notes
- YOLO model file not included — user must provide a YOLOv5/v8 ONNX model trained on recyclables
- Until YOLO model is provided, TM stage 1 handles material classification
- `@teachablemachine/image` installed with `--legacy-peer-deps` (TF.js version mismatch OK)
