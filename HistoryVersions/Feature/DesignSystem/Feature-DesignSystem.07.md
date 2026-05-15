# Feature-DesignSystem.07 — Dark / Light Mode Toggle in Layouts

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Added quick-access dark/light mode toggle buttons to UserLayout and BuyerLayout so users can switch themes from any page without navigating to Settings.

## Reason

The dark mode infrastructure (CSS variables, Redux slice, localStorage persistence) was already in place, but the toggle was only accessible inside the Settings page. Users needed a persistent, one-click toggle visible at all times.

## Changes

### `src/layouts/UserLayout.jsx`
- Imported `toggleDarkMode` from `../store/userSlice`
- Added `darkMode` to `useSelector` state read
- Added `handleToggleDark` dispatch function
- Added `IconSun` and `IconMoon` SVG icon components
- **Desktop sidebar** (profile chip area): Added a sun/moon icon button next to the language toggle
- **Mobile topbar**: Added a sun/moon icon button in the top-right control group

### `src/layouts/BuyerLayout.jsx`
- Imported `toggleDarkMode` from `../store/userSlice`
- Added `darkMode` to `useSelector` state read
- Added `handleToggleDark` dispatch function and inline `IconSun`/`IconMoon` helpers
- **Desktop sidebar** (bottom control area): Added sun/moon toggle alongside the language button
- **Mobile topbar**: Added sun/moon toggle in the header controls

## Validation

- Toggle button visible in sidebar (desktop) and topbar (mobile) for both UserLayout and BuyerLayout
- Clicking the button dispatches `toggleDarkMode()` → updates `document.documentElement.classList` (via `AuthInitializer` in App.jsx) → CSS variables switch between `:root` (light) and `.dark` overrides
- Preference persisted to `localStorage` key `gp_dark` — survives page reload
- Icon reflects current state: moon icon = light mode active (click to go dark), sun icon = dark mode active (click to go light)
- Settings page toggle still works independently

## Notes

- No new files created; changes are purely additive to existing layouts
- CSS variables already covered all tokens for both modes in `src/index.css`
