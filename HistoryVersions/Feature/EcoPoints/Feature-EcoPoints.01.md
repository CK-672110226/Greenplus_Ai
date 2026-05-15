# Feature-EcoPoints.01 — Remove Eco Points Feature

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Removed the Eco Points feature entirely from the application UI, routing, navigation, and translations.

## Reason

Feature was cut from the product scope.

## Changes

### Deleted
- `src/pages/EcoPointsPage.jsx` — removed entirely

### `src/App.jsx`
- Removed lazy import for `EcoPointsPage`
- Removed `/eco-points` route

### `src/layouts/UserLayout.jsx`
- Removed `{ to: '/eco-points', icon: <IconEco />, label: t.ecoPoints }` from `mainNav`
- Removed `IconEco` SVG helper function

### `src/components/NavBar.jsx`
- Removed `<NavLink to="/eco-points">{t.ecoPoints}</NavLink>`

### `src/pages/LandingPage.jsx`
- Removed `'eco-points'` from recycler role features list

### `src/pages/HomePage.jsx`
- Removed `ecoPoints` variable derived from `profile.eco_points`
- Removed "Impact points" KPI card from the dashboard header strip

### `src/i18n/en.js`
- Removed `ecoPoints` nav key
- Removed Eco Points section: `ecoPointsTitle`, `yourPoints`, `pointsHistory`, `earnedFrom`, `redeemPoints`, `pointsExplain`

### `src/i18n/th.js`
- Removed `ecoPoints` nav key
- Removed Eco Points section (same keys, Thai values)

## Notes

- `eco_points: 0` initialization in `LoginPage.jsx` and `useAuth.js` was intentionally kept — the Supabase `profiles` table column still exists and the insert would fail if the field were missing.
- No database migration required.
