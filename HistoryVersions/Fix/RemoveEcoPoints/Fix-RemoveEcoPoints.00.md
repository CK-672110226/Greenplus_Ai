# Fix-RemoveEcoPoints.00

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

Removed the Eco Points system entirely from the application.

## Reason

User request: ลบ ECO point ECO System all.

## Changes

### Deleted
- `src/pages/EcoPointsPage.jsx` — entire page removed

### `src/App.jsx`
- Removed `lazy()` import for `EcoPointsPage`
- Removed `/eco-points` route

### `src/pages/ProfilePage.jsx`
- Removed `getEcoTier()` helper function
- Removed `ecoPoints` and `ecoTier` variables
- Removed the ECO-POINTS quick-action button row

### `src/i18n/en.js`
- Removed entire `// Eco Points page` key block (18 keys)

### `src/i18n/th.js`
- Removed entire `// Eco Points page` key block (18 keys)

## Validation

- `npm run lint` — 0 errors
- No remaining references to `/eco-points`, `EcoPointsPage`, or `eco*` i18n keys outside deleted files

## Notes

`scan_history` table, `useScanHistory` hook, and `eco_points` DB column are untouched — they are used by ProfilePage scan history display, SettingsPage, AdminPage, and LandingPage counters.
