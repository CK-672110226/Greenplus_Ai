# Fix-AIStudioStage2.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Fixed three data management bugs in AI Studio's training class manager that caused crashes and missing rows when admin created custom material classes (e.g. Thai-named or English-named folders).

## Reason

When admin created a custom class (e.g. "ขวดพลาสติก" or "Plastic Bottle") in the Stage 1 folder grid, Stage 2 never showed that class, and any Stage 2 upload would crash because `stage2Counts[key]` was `undefined`.

## Changes

### `src/pages/AdminPage.jsx`

**Bug 1 — Stage 2 section hardcoded to `MATERIAL_KEYS`:**
- Changed `MATERIAL_KEYS.map(...)` → `folders.map(...)` in the Stage 2 upload rows section
- Added optional-chaining fallbacks (`?.clean ?? 0`) to guard against uninitialized keys
- Added empty-state message "Add classes in Stage 1 first" when `folders` is empty

**Bug 2 — `handleAddFolder` missing stage2 state initialization:**
- Added `setStage2Counts` and `setUploadingStage2` initialization for new custom keys

**Bug 3 — `loadCounts` only seeded predefined `MATERIAL_KEYS`:**
- Refactored loop to auto-initialize `s1[mt]` and `s2[mt]` for any `material_type` found in DB, regardless of whether it's a predefined key
- Stage 2 rows now also add to `seen` so custom classes are restored to `folders` on mount

## Validation

- Lint passes (`npm run lint`)
- Manual: create new class → appears in both Stage 1 grid and Stage 2 upload list
- Reload page → custom classes restored from DB with correct image counts

## Notes

`localName()` gracefully falls back to returning the raw key when the key is not in `WASTE_ITEMS`, so Thai/English custom class names display correctly without additional changes.
