# Fix-AIStudioStage2.00

15 May 2026 (15 พฤษภาคม 2569)

## Overview

Updated the YOLO + two-stage AI pipeline to return **all** detected waste items per frame (multi-object detection), instead of only the single top detection. The scan page now adds every valid detection to the batch queue in one operation.

## Reason

YOLO runs NMS and can return multiple non-overlapping bounding boxes per frame. Previously only `dets[0]` was used, discarding all other detections. For high-density waste frames this caused significant data loss and required the user to re-scan repeatedly for items already visible.

## Changes

### `src/services/yoloInference.js`
- Changed return type of `yoloStage1()` from single object / null to `Array<{materialType, confidence, bbox, sizeKg}>` (empty array on failure or no detection).
- Updated log line to show total detection count and all labels/confidences.
- Updated JSDoc comment in header to reflect new signature.

### `src/services/twoStageAI.js`
- Added `runStage2ForDet(det, config, imageSource, b64)` — runs stage-2 cleanliness for a single YOLO detection, mirrors the existing single-item stage-2 logic.
- `twoStageInfer()` now handles YOLO returning an array:
  - Filters out `ไม่ใช่ขยะ` (troll class) and items below `confidenceThreshold`.
  - Runs `runStage2ForDet` concurrently via `Promise.all` for all valid detections.
  - Returns `{ multiResult: [...] }` with one entry per detection.
  - Falls through to TM / ONNX / Vertex single-result path when YOLO returns `[]`.
- Single-result return shapes (TM / ONNX / Vertex paths) are unchanged.

### `src/pages/ScanPage.jsx`
- `runInference()` now checks for `infer.multiResult` before the existing single-result branch.
- When `multiResult` is present, maps each entry to a queue item with `crypto.randomUUID()` as id.
- Adds all items in one `setBatchQueue(prev => [...prev, ...newItems])` call.
- Shows `Detected ${n} items` toast when n > 1, otherwise uses the existing single-item message.
- Single-result path (dirty-item overlay, swipe UX, `setResult`, etc.) is unchanged.

## Validation

- `npm run lint` — no errors.
- Manual: YOLO with multiple detections → all appear in batch queue simultaneously.
- Manual: YOLO with zero detections → falls through to TM/ONNX/Vertex as before.
- Manual: TM/ONNX/Vertex path unaffected — single result still flows through existing UI.

## Notes

- `crypto.randomUUID()` is used (instead of `materialType_Date.now()`) so concurrent same-material detections get unique ids.
- Troll-class filtering per detection: if *all* dets are troll the pipeline returns `{ troll: true }`; if *all* remaining after troll filter fail confidence the pipeline returns `{ lowConfidence: true }`.
