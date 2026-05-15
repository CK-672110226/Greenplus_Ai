# Fix-AIStudioStage2.03

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Added auto-translation in the New Class dialog. Typing in either the Thai or English field automatically fills the other field after a 600ms debounce using the MyMemory free translation API (no API key required).

## Reason

Admin should not need to know both languages to create a bilingual class name. Typing in one language and having the other auto-filled removes friction while ensuring all users see names in their own language.

## Changes

### `src/pages/AdminPage.jsx`

- Added `translateText(text, from, to)` helper — calls `api.mymemory.translated.net`, returns translated string or `null` on failure (silent error).
- `NewFolderDialog` now has:
  - `translating` state ('th' | 'en' | null) — shows "แปล…" / "translating…" label next to the target field header while in-flight
  - `scheduleTranslate()` — debounces 600ms then calls `translateText` and sets the other field
  - `handleChangeTh()` / `handleChangeEn()` — trigger translate in opposite direction; uses refs to avoid re-triggering when the auto-filled value updates
  - `timerRef` cleanup on confirm and close
- Hint text updated to "พิมพ์ภาษาใดก็แปลให้อัตโนมัติ"

## Behaviour

- Type Thai → English auto-fills after 600ms
- Type English → Thai auto-fills after 600ms
- Admin can still manually edit either field after auto-fill
- If translation API fails (offline/rate limit) → field stays empty, admin can fill manually
- Pressing Enter/confirming cancels any pending translation timer

## Notes

MyMemory free tier: 10,000 chars/day without email, 50,000 chars/day with registered email. Sufficient for admin class creation. No API key needed.

## Validation

- `npm run lint` passes with 0 errors, 0 warnings
