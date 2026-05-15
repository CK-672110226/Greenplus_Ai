---
# Feature-DarkModeAuto.02

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview
Removed the Eco Points feature entirely from the application.

## Reason
Feature was requested to be deleted.

## Changes

### `src/pages/EcoPointsPage.jsx` — DELETED

### `src/App.jsx`
- Removed lazy import for `EcoPointsPage`
- Removed `/eco-points` route

### `src/layouts/UserLayout.jsx`
- Removed `IconEco` SVG component
- Removed `/eco-points` entry from `mainNav` array

### `src/components/NavBar.jsx`
- Removed `<NavLink to="/eco-points">` link

### `src/pages/LandingPage.jsx`
- Removed `'eco-points'` from user role features list

### `src/pages/HomePage.jsx`
- Removed `ecoPoints` variable (`profile?.eco_points ?? 0`)
- Removed "Impact points" KPI card from the 3-column strip
- Changed KPI grid from `sm:grid-cols-3` to `sm:grid-cols-2`

### `src/hooks/useAuth.js`
- Removed `eco_points: 0` from new profile insert

### `src/i18n/en.js`
- Removed `ecoPoints` key
- Removed entire `// Eco Points` section (ecoPointsTitle, yourPoints, pointsHistory, earnedFrom, redeemPoints, pointsExplain)

### `src/i18n/th.js`
- Same removals as en.js

## Validation
- No remaining references to `eco-points`, `ecoPoints`, or `EcoPointsPage` in the codebase
- KPI strip on HomePage now shows 2 cards (kg recycled + Earnings)
