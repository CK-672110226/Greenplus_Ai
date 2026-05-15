# Feature-ModelTrainingFolderUI.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Replaced the pre-filled grid of all material-class upload cards in AI Studio (Admin tab) with a dynamic folder manager. Admins now start with an empty canvas and press "+" to create class folders one at a time, then upload images into each folder.

## Reason

The old UI showed all possible material classes at once (10+ rows), forcing admins to scroll through empty slots they hadn't chosen yet. The new folder model matches the mental model of "add a class, then populate it", reducing noise and making training progress clearer.

## Changes

### `src/pages/AdminPage.jsx`

- **Added `FolderCard` component** — folder icon, material label, image count badge, ×-remove button, hidden file input, "+ Add" upload trigger. Border turns green when ≥3 images uploaded.
- **Added `NewFolderDialog` component** — fixed-position modal overlay with a `<select>` of available (unused) material keys. Pressing "Create" adds the key to the `folders` array; pressing "Cancel" closes without side-effects.
- **Added `folders` state** (`useState([])`) — array of materialKey strings the admin has explicitly created.
- **Added `showNewFolder` state** (`useState(false)`) — controls dialog visibility.
- **Updated `loadCounts` useEffect** — builds a `seen` Set from existing `training_images` rows with `stage === 1`, then calls `setFolders([...seen])` to restore previously created classes on page load.
- **Added `handleAddFolder(key)`** — appends key to `folders`, closes dialog.
- **Added `handleRemoveFolder(key)`** — removes key from `folders` (images in Supabase are retained).
- **Replaced Stage 1 grid JSX** — removed `MATERIAL_KEYS.map(key => <ClassUploadCard .../>)` (old component deleted), replaced with `folders.map(key => <FolderCard .../>)` + "+" tile + empty-state hint when no folders exist. Counter "X/Y ready" shown in section header.
- **Wired `<NewFolderDialog>`** — added before closing `</main>`.
- **Fixed `handleTrain` readiness check** — changed from `Object.values(classImages).filter(n => n >= 3).length` (counted all keys including empty) to `folders.filter(k => classImages[k] >= 3).length` (counts only created folders).

## Validation

- `npm run lint` — no warnings or errors
- `npm run build` — ✓ built in 372ms, AdminPage bundle 21.06 kB

## Notes

- Removing a folder via × only removes it from the `folders` UI state; it does not delete images already uploaded to Supabase Storage or `training_images` table. This is intentional — admins should manage deletions via the export manifest or DB console.
- The "+" tile is hidden once all MATERIAL_KEYS have been added, preventing duplicates.
