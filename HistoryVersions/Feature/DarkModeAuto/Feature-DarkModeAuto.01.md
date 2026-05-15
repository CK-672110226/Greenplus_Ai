---
# Feature-DarkModeAuto.01

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview
Added dark/light mode toggle buttons to all navigation surfaces so users can manually switch themes from any role's UI.

## Reason
The Redux `darkMode` state and `.dark` CSS class were already wired in `App.jsx` (`.00`), but no toggle button was exposed to the user in any layout.

## Changes

### `src/components/NavBar.jsx`
- Imported `toggleDarkMode` from `userSlice`
- Added `darkMode` to `useSelector`
- Added `☾`/`☀` toggle button before the language button (shown for all roles using NavBar: landing, login, admin)

### `src/layouts/UserLayout.jsx`
- Imported `toggleDarkMode` from `userSlice`
- Added `darkMode` to `useSelector`
- Desktop sidebar profile chip: added `☾`/`☀` button alongside existing lang button
- Mobile topbar: added `☾`/`☀` button alongside existing lang button

### `src/layouts/BuyerLayout.jsx`
- Imported `toggleDarkMode` from `userSlice`
- Added `darkMode` to `useSelector`
- Desktop sidebar bottom section: added `☾ Dark`/`☀ Light` labeled button above lang button
- Mobile topbar: added `☾`/`☀` button alongside existing lang button

## Validation
- Toggle dispatches `toggleDarkMode()` which saves preference to `localStorage` (`gp_dark`)
- `App.jsx` `AuthInitializer` applies/removes `.dark` class on `<html>` reactively
- All CSS custom properties swap via `.dark` selector in `index.css`

## Notes
- Icon: `☾` (crescent moon) = currently light mode, `☀` (sun) = currently dark mode
- BuyerLayout desktop uses text labels (`☾ Dark` / `☀ Light`) for clarity since it has more space
