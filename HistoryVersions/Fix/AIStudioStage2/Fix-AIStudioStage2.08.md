# Fix-AIStudioStage2.08 — Manual capture flow + AI-not-ready error handling

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview
Changed scan flow from auto-scan to manual capture. Added explicit "เปิดกล้อง" / "ถ่ายรูป" buttons. Desktop primary action is upload. Added AI-not-ready error handling.

## Reason
- Auto-scan unsuitable for production: user needs to control when to capture
- Mobile: open camera → frame item → tap capture
- Desktop: camera is for model debugging only; upload is primary
- When AI model fails or isn't configured, show clear error instead of silent mock

## Changes

### `src/pages/ScanPage.jsx`
- Removed camera auto-start useEffect on mount
- Removed auto-scan 2s timeout loop
- Added `stopCamera()` function
- Added cleanup-only useEffect (unmount only)
- Phase 'starting': show "เปิดกล้อง" button (mobile, `lg:hidden`) + "อัปโหลดรูป"
- Phase 'idle' + camera: show "📷 ถ่ายรูปเพื่อสแกน" + "ปิด" buttons
- Phase 'analyzing': show green pulse indicator
- Phase 'idle' + upload: show "สแกนอีกครั้ง" button
- Panel header updated to Thai/English dual instructions
- AI-not-ready red banner replaces orange demo banner
- `runInference`: blocks immediately with toast if `isMockMode` (no model configured)
- `runInference` catch: shows bilingual "AI ขัดข้อง" toast, logs full error to console
- `handleReset`: no longer restarts camera, goes to 'starting' state
- `handleConfirmClean`/`handleRejectClean`: check `streamRef.current` to decide idle vs starting

## Validation
- `npm run lint` → 0 errors
- `npm run build` → ✓ built
