# Feature-AiScannerMvp.00

**Date:** 12 May 2026 (12 พฤษภาคม 2569)

---

## Overview

Implements the AI Scanner page (PRD Section 4, Milestone M3) — real camera feed via `getUserMedia`, simulated YOLO-style inference with anti-troll detection, grade result card, and "Add to Basket" action.

---

## Reason

M3 milestone: users need a working scan UI that shows grade, price estimate, and lets them add the item to their basket. The real ONNX model (M8) is not yet trained; mock inference bridges the gap so the full UI flow is testable.

---

## Changes

### `src/pages/ScanPage.jsx` (replaced)
Full implementation replacing the "Coming soon" placeholder:

- **Camera feed** — `getUserMedia({ video: { facingMode: 'environment' } })` mounted on a `<video>` element. Stream is properly cleaned up on unmount.
- **State machine** — `idle | analyzing | result | troll | error`
  - `idle`: corner-guide viewfinder + Scan button
  - `analyzing`: 1.5 s simulated delay with spinner overlay
  - `result`: grade card with score bar, price, weight, Add to Basket / Scan Again actions
  - `troll`: orange overlay with anti-troll message (8% probability in mock)
  - `error`: message when camera permission denied
- **Mock inference** (`mockInfer()`) — randomly picks material type, generates score (20–100), derives A/B/C grade, estimates unit weight per material. 8% chance returns `isTroll: true`. Will be replaced by ONNX inference in M8.
- **ScoreBar** sub-component — fills from 0–100, color-coded green (A) / yellow (B) / orange (C).
- **Add to Basket** — dispatches `addToBasket` with `id` (UUID), `materialType`, `grade`, `weight`, `pricePerKg`. Button shows ✓ after adding; Scan Again resets to idle.
- Uses `useSelector(s => s.user.language)` for bilingual material names.

### `src/store/wasteSlice.js`
Synced reducers from basket branch (so the slice is consistent across branches):
- `addToBasket` now spreads `skipped: false` onto payload
- `removeFromBasket` now filters by `id` (was `splice` by index)
- Added `updateWeight` reducer
- Added `toggleSkip` reducer
- Exported new action creators

### `src/i18n/en.js`
Added all basket keys (from feature/basket) plus scanner keys: `scanTap`, `scanBtn`, `analyzing`, `scanResult`, `addToBasket`, `scanAgain`, `estWeight`, `scoreLabel`, `confidence`, `cameraError`, `antiTroll`, `rejected`, `rejectedHint`, `signInWithGoogle`, `orDivider`.

### `src/i18n/th.js`
Same additions in Thai.

---

## Validation

- `npm run lint` — zero errors.
- Manual browser test: camera opens, scan flow runs through all five states (idle → analyzing → result → add to basket; troll overlay appears occasionally; error state when camera denied).

---

## Notes

- TROLL_PROBABILITY = 0.08 (8%) is only for testing the anti-troll UI. In production the real model's living-being classifier replaces this.
- `crypto.randomUUID()` is available in all modern browsers (Chrome 92+, Safari 15.4+, Firefox 95+) — no polyfill needed.
- `mockInfer()` lives in module scope for easy replacement with the real ONNX loader in M8.
- Stage 2 multi-factor scoring (PRD Section 4.3–4.4) is M8 scope; M3 shows a single composite score.
