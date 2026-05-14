# Feature-DarkModeAuto.00

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Dark mode now auto-detects the OS preference on first load (`prefers-color-scheme: dark`). If the user has never explicitly toggled dark mode in the app, the OS setting is respected and followed in real-time. Manual toggles (via `toggleDarkMode`) still save to localStorage and override auto-detect.

## Reason

- Previously, `darkMode` initialised to `false` unless `localStorage.gp_dark === '1'` — new users were always in light mode regardless of their OS setting.
- No listener was registered for OS preference changes, so switching the OS theme mid-session had no effect.

## Changes

### `src/store/userSlice.js`

- `resolveInitialDarkMode()` helper: reads `localStorage.gp_dark` first; if not set, reads `window.matchMedia('(prefers-color-scheme: dark)').matches`.
- `initialState.darkMode` now calls this helper instead of a direct localStorage read.
- Added `setDarkMode` action (sets state without writing localStorage) for OS-driven changes.
- Exported `setDarkMode` alongside existing actions.

### `src/App.jsx`

- Added `useDispatch` and `setDarkMode` imports.
- `AuthInitializer` now registers a `matchMedia` change listener:
  - Fires when the OS switches between light and dark.
  - Only applies the change if `localStorage.gp_dark` is `null` (user has no explicit preference).
  - Cleans up the listener on unmount.

## Behaviour After This Change

| Scenario | Result |
|---|---|
| First visit, OS = light | Light mode |
| First visit, OS = dark | Dark mode |
| User toggles manually → OS changes | Ignores OS; keeps user choice |
| User resets preference (clear localStorage) → OS changes | Follows OS again |

## Validation

- `npm run lint` — zero errors
- Tested: open app with OS in dark mode → dark; switch OS to light (browser DevTools > Rendering) → light (if no manual toggle).
