# Fix-DesignAudit.06 — ScanPage Drag-and-Drop Upload

18 May 2026 (18 พฤษภาคม 2569)

## Overview

Added drag-and-drop support to the image upload zone on ScanPage.

## Reason

Drop zone was click-only. onDrop/onDragOver handlers were absent. Users on desktop who attempted to drag an image onto the viewfinder area got no response.

## Changes

### src/pages/ScanPage.jsx

- Added `isDragging` state (`const [isDragging, setIsDragging] = useState(false)`)
- Extracted file-processing logic from `handleFileChange` into a standalone `handleFile(file)` function — stops the camera stream, creates an object URL, sets `inputMode='upload'`, and fires `runInference` via `img.onload`. `handleFileChange` now delegates to `handleFile`.
- Added `onDragOver`, `onDragLeave`, `onDrop` event handlers on the viewfinder `<div>` (the `relative w-full aspect-video` container). Drop handler filters for `image/*` files and calls `handleFile(file)`.
- Visual feedback — viewfinder border and background switch via inline `style` when `isDragging` is true:
  - Default: `1.5px solid var(--ink)` border, implicit paper background
  - Dragging: `2px dashed var(--green)` border, `var(--green-soft)` background
- "DROP IMAGE HERE" label renders in `font-data` uppercase when `isDragging` is true:
  - In `phase === 'starting'` overlay: replaces the camera icon + upload hint with the drop label
  - In all other phases: an absolute overlay (z-20) appears over the viewfinder content

## Validation

- Lint: 2 pre-existing errors in `AdminPage.jsx` (`ModelRegistrySection` unused, `AiStudioTab` undefined). Zero new errors introduced by this change.
- Drop zone accepts `image/*` files via drag in all phases (starting, idle, camera live, etc.)
- `isDragging` visual feedback (green dashed border + green-soft background) applies correctly on dragover and resets on dragleave/drop
- Click-to-upload path (`fileRef` / `handleFileChange`) is unchanged in behaviour

## Notes

- `handleFile` is not async-declared since `runInference` is triggered via `img.onload` callback rather than awaited directly — this matches the original `handleFileChange` pattern.
- The drag handlers are placed on the viewfinder div rather than a separate overlay, so the entire video/image area is a valid drop target in every phase, not just during `phase === 'starting'`.
- `var(--green-soft)` is an existing design-token; no raw hex values were introduced.
