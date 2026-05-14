# Feature-DesignSystem.05 — AI Scanner Batch Mode 3-Panel Layout

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Redesigned ScanPage to match the "AI Scanner / batch mode" wireframe. Desktop layout is now a 3-panel grid: Camera panel (2fr) | Batch Queue panel (260px) | Live Analysis panel (260px). All existing inference logic, camera lifecycle, and basket dispatch are unchanged.

## Reason

User provided wireframe reference (AI Scanner _ batch mode.html) showing a richer desktop scanner UI with batch queue and live analysis panels.

## Changes

### `src/pages/ScanPage.jsx`
**New state:**
- `batchMode` (boolean) — toggles single vs batch scanning mode
- `batchQueue` (array) — holds pending scan results before basket commit

**New components:**
- `ContaminationMeter` — 3-segment bar (clean / mixed / contam.) derived from inference score (≥70 = clean, ≥40 = mixed, <40 = contam.)
- `QueueRow` — single row in batch queue showing material, weight, grade, value, remove button

**Panel 1 — Camera:**
- Breadcrumb: "Home / AI Scanner / Batch" (when batch ON)
- Header with title + subtitle describing current mode
- Controls row: flash placeholder, camera 1 placeholder, batch ON/OFF toggle button, live indicator, model badge
- Viewfinder with corner brackets, analyzing overlay, batch detection overlay (item count + kg + est. ฿)
- Batch mode: scan adds to queue and resets to idle; single mode: existing result flow unchanged

**Panel 2 — Batch Queue:**
- List of batchQueue items via `QueueRow`
- Empty state with scan icon
- Footer: basket summary (items + total), queue total, "✓ Add to basket · keep scanning" CTA
- `handleAddBatch()` dispatches all batchQueue items and clears queue

**Panel 3 — Live Analysis:**
- "STAGE 2 / 2" badge when result present
- Detected material name + GradeTag
- `ContaminationMeter` component
- Value breakdown: `weight × price/kg × 1.00 = total` formula display
- Impact pts (value × 1.8) + CO₂ saved (weight × 0.38 kg)
- Waste rules list (from wasteRules.js)
- Confidence percentage
- Override hint text
- Empty state when no result yet

**Mobile:** all 3 panels stack vertically; camera panel stays full width.

## Validation

- `npm run lint` → 0 errors
- All existing logic preserved: `twoStageInfer`, `useScanInsert`, `addToBasket`, `setLastScan`, file upload mode, anti-troll rejection
- `eslint-disable react-hooks/set-state-in-effect` comment kept on same line as `useEffect` (as in original) to suppress correctly

## Notes

- Flash and camera-select controls are placeholder UI (cursor-not-allowed) — functionality to be added when multi-camera support is implemented
- CO₂ multiplier (0.38) and impact pts formula (value × 1.8) are estimates; replace with real values when formula spec is available
