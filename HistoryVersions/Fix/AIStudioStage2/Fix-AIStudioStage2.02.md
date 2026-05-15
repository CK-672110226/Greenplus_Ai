# Fix-AIStudioStage2.02

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Added bilingual (Thai + English) support for admin-defined material class names. Users who can only read one language will now see the name in their own language, regardless of what language the admin used when creating the class.

## Reason

When admin creates a custom class with only one language (e.g., "ขวดพลาสติก" in Thai), English-language users see unreadable text in scan results and studio UI. The fix adds a second name field so both languages can be stored, then resolves to the correct one based on the user's language setting.

## Changes

### `src/store/customLabelsSlice.js` (new)
Redux slice backed by localStorage (`gp_custom_labels`). Stores `{ [key]: { th, en } }` mapping. Actions: `setLabel`, `removeLabel`.

### `src/store/index.js`
Added `customLabels` reducer.

### `src/hooks/useResolvedName.js` (new)
Hook returning a `resolve(materialType)` function. Checks `customLabels` store first; falls back to predefined `localName()` for WASTE_ITEMS keys; falls back to raw key if unknown.

### `src/pages/AdminPage.jsx`
- `NewFolderDialog` now has two inputs: ชื่อภาษาไทย + English name. Key = first non-empty name (backward compatible). At least one required.
- `handleAddFolder` dispatches `setLabel` on creation.
- `handleRemoveFolder` dispatches `removeLabel` on deletion.
- All `localName()` calls replaced with `resolve()` via `useResolvedName` hook.
- Removed unused `language` selector and `localName` import.

### `src/pages/ScanPage.jsx`
- Added `useResolvedName` import and `resolve` hook call in `ScanPage`.
- `QueueRow` sub-component now calls `useResolvedName()` itself (removed `language` prop).
- All `localName(materialType, language)` calls for scan result display replaced with `resolve(materialType)`.

## Translation behaviour

- Admin creates class with both names → users see their language's version everywhere
- Admin creates class with only one name → that name is shown for all users (same as before)
- Predefined WASTE_ITEMS (aluminum_can, pet_bottle_clear, etc.) retain their existing bilingual names via `localName()`

## Validation

- `npm run lint` passes with 0 errors, 0 warnings
