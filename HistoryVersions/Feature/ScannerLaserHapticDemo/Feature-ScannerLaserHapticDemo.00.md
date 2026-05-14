# Feature-ScannerLaserHapticDemo.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Enhanced AI Scanner with three sensory/UX improvements:
1. Laser scan animation — 2.4s CSS loop sweeping top → bottom of viewfinder during `analyzing` phase
2. Bounding box overlay — 1.5px green rectangle + corner markers appears on the viewfinder when a result is ready, with a label chip showing material name and confidence %
3. Haptic feedback — `navigator.vibrate()` calls at key moments (scan success, dirty item detected, add to basket)
4. Demo Mode banner — orange warning strip under panel header when ONNX is not configured, directing users to Admin settings

## Reason

Wireframe spec and user directive called for:
- Visual feedback during inference (laser line gives clear "scanning" affordance)
- Spatial indication of what was detected (bounding box anchors the result to the viewfinder)
- Mobile haptic feedback at decision moments (standard UX for camera-capture flows)
- Clear distinction between demo and real ONNX mode

## Changes

### `src/index.css`
- Added `@keyframes scan-laser` (2.4s ease-in-out, top 6% → 88%)
- Added `.scan-laser` utility class
- Added `@keyframes bbox-draw` (0.35s scale+opacity entrance)
- Added `.bbox-draw` utility class
- Added `@keyframes map-ping` + `.map-ping` for future MapPage pulsing pins

### `src/pages/ScanPage.jsx`
- **Demo Mode banner:** orange strip between camera controls and viewfinder when `isMockMode`. Shows Thai/English message pointing to Admin → ONNX config. Also changes `gp-vision-2.1` label to `gp-vision-demo` in the analyzing overlay when mock mode is active.
- **Laser line:** `<div className="absolute … scan-laser">` rendered inside viewfinder only during `phase === 'analyzing'`. Green `--green` color with a subtle box-shadow glow.
- **Bounding box:** `<div className="absolute bbox-draw">` rendered during `phase === 'result'`. Positioned at 18% inset on all sides (centered detection region). Includes corner markers and a label chip at bottom-left showing `{localName} · {confidence}%`.
- **Haptic vibrate:** `navigator.vibrate?.()` added (optional chaining so it silently no-ops on desktop):
  - `runInference` success path: `vibrate(100)` — one short pulse on detection
  - `handleAddSingle` dirty branch: `vibrate([100, 50, 100])` — double pulse for warning
  - `handleAddSingle` success path: `vibrate(50)` — brief confirmation
  - `handleConfirmClean`: `vibrate(50)` — brief confirmation

## Validation

- `npm run lint` — 0 errors
- `npm run build` — 205 modules, clean (ScanPage chunk: 33.97 kB)

## Notes

- Bounding box coordinates are fixed (18% inset) because the ONNX stage does not currently return bbox coordinates. When real bbox output is available from the model, replace the hardcoded percentages with `result.bbox.x1 / result.bbox.y1` etc.
- `navigator.vibrate` is a no-op on iOS Safari (not supported) and desktop — optional chaining handles this gracefully.
- `.map-ping` keyframes added here as a pre-cursor for the MapPage pulsing pins feature (next sprint).
