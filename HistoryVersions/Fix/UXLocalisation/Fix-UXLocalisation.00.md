# Fix-UXLocalisation.00

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

UX research audit: fixed two critical data-display bugs in HomePage, localized all hardcoded English strings in ScanPage and HomePage, split troll/low-confidence feedback into distinct UX states, fixed broken `/prices` route link, and added 14 missing translation keys to both Thai and English dictionaries.

## Reason

- `localName(item.material, ...)` → `item.material` doesn't exist on basket items; the correct key is `item.materialType`. Basket preview in HomePage showed undefined/empty for all items.
- Same bug for `lastScan.material` → `lastScan.materialType` — last scan card was blank.
- `greetingMsg()` always returned English "GOOD MORNING/AFTERNOON/EVENING" regardless of language setting — Thai users saw English greeting even in Thai mode.
- ScanPage had 3 hardcoded English strings ("or upload image", "Starting camera…", "Upload image instead") with no `t` hook usage.
- HomePage had 5 hardcoded English strings ("Weekly earnings", "Weekly scan volume", "quick access", "today's rates", "your account") not run through `t`.
- Quick access link to `/prices` led to a 404 — that route doesn't exist. Changed to `/marketplace`.
- `troll` phase was used for both anti-troll rejection AND low-confidence result — users got the harsh orange "rejected" message even when the item was simply unclear in the photo.
- `source === 'mock'` badge didn't cover `source === 'mock-fallback'` — users got no demo indicator when Claude fell back to mock.

## Changes

### `src/i18n/en.js` and `src/i18n/th.js`

Added 14 keys:
- `invalidCredentials` — "Invalid email or password" / "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
- `goodMorning`, `goodAfternoon`, `goodEvening` — localised greeting segments
- `weeklyEarnings`, `weeklyVolume` — KPI card labels
- `quickAccess`, `todayRates`, `yourAccount` — HomePageQuick access labels
- `uploadImage`, `uploadInstead`, `startingCamera` — ScanPage actions
- `lowConfidenceTitle`, `lowConfidenceHint` — new distinct feedback for unclear scans
- `prices` — quick link label (already existed as separate key; added for completeness)

### `src/pages/HomePage.jsx`

- **`greetingKey()`** replaces `greetingMsg()` — returns a translation key (`goodMorning` / `goodAfternoon` / `goodEvening`) that `t` resolves in the correct language. Display name shown as-is (proper nouns don't translate).
- **KPI labels** — `'Weekly earnings'` and `'Eco points'` now use `t.weeklyEarnings` and `t.ecoPoints`.
- **Chart label** — `'Weekly scan volume (kg)'` uses `t.weeklyVolume`.
- **`item.materialType`** — fixed from `item.material` in basket preview; `lastScan.materialType` fixed from `lastScan.material` in last scan card.
- **Quick access links** — labels use `t` keys; `/prices` → `/marketplace` (valid route).

### `src/pages/ScanPage.jsx`

- **Phase split** — `'troll'` phase now only fires for actual anti-troll rejection. A new `'lowConfidence'` phase fires when `infer.lowConfidence === true`. UI for low-confidence is neutral gray (not orange) with helpful retry guidance instead of rejection language.
- **Hardcoded strings** — "or upload image", "Starting camera…", "Upload image instead" now use `t.uploadImage`, `t.startingCamera`, `t.uploadInstead`.
- **Source badge** — covers `'mock-fallback'` in addition to `'mock'`.

## Validation

- `npm run lint` — zero errors
- `item.materialType` fix verified by code inspection (wasteSlice stores `materialType`, not `material`)
- No runtime test suite — visual verification required in browser

## Notes

The greeting no longer uppercases the user's name (`profile.display_name` is rendered as-is). This respects Thai name capitalization conventions where uppercase is not the norm.

The quick access `/prices` → `/marketplace` change may need to be revisited if a dedicated price-list page is added in a future milestone.
