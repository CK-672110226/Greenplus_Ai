# Fix-AIStudioStage2.06 — Auto-scan camera mode

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview
Replaced manual scan button with continuous auto-scan in camera mode. Camera now runs inference automatically every 2 seconds and shows the result for user confirmation, instead of requiring a button press.

## Reason
User reported the scanner required manual button presses instead of detecting items automatically and presenting the result for confirmation.

## Changes

### `src/pages/ScanPage.jsx`
- Added `aiMode` derived value: `'tfjs' | 'onnx' | 'vertex' | 'demo'` based on `aiConfig` (fixes badge showing hardcoded `'onnx'`)
- Added `useEffect` auto-scan loop: chains 2s `setTimeout` calls while `phase === 'idle'` and `inputMode === 'camera'`; clears on phase/mode change
- Replaced manual Scan button with a status indicator when `inputMode === 'camera'` (shows "สแกนอัตโนมัติ" / "Auto-scanning" or pulse animation while analyzing)
- Kept manual Scan button only for `inputMode === 'upload'`
- Removed two stale `// eslint-disable-next-line react-hooks/purity` comments

## Validation
- `npm run lint` → 0 errors, 0 warnings
- Camera mode: no Scan button visible; inference fires automatically 2s after `idle`
- Upload mode: Scan button still present and functional
- Phase transitions: `idle → analyzing → result` (single) or `idle → analyzing → idle` (batch) correctly start/stop the timer

## Notes
- Auto-scan interval is 2000ms. Can be tuned if needed.
- The `// eslint-disable-line react-hooks/exhaustive-deps` is intentional: `runInference` intentionally reads fresh state via closure each time the effect re-fires.
