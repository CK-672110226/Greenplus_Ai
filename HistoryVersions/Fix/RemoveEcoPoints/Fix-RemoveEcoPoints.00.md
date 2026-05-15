# Fix-RemoveEcoPoints.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Removed all EcoPoints references from the application (route, lazy import, navigation links, KPI display) and fixed incorrect `GradeTag` prop usage in `AdminPage.jsx` to match the updated component API (`clean` boolean instead of `grade` string).

## Reason

EcoPoints feature is being retired from the current release scope. The `GradeTag` component was refactored to accept a `clean` boolean prop; all call sites using the old `grade` string prop needed to be updated to remain compatible.

## Changes

### `src/App.jsx`
- Removed `const EcoPointsPage = lazy(...)` import line.
- Removed `<Route path="/eco-points" ...>` route from the user portal section.

### `src/layouts/UserLayout.jsx`
- Removed `function IconEco() { ... }` SVG icon helper.
- Removed `{ to: '/eco-points', icon: <IconEco />, label: t.ecoPoints }` entry from `mainNav` array.

### `src/components/NavBar.jsx`
- Removed `<NavLink to="/eco-points">{t.ecoPoints}</NavLink>` from the user-role nav links block.

### `src/pages/HomePage.jsx`
- Removed `const ecoPoints = profile?.eco_points ?? 0` variable declaration.
- Removed the entire "Impact points" KPI card div that rendered `ecoPoints` and the Gold-tier label.

### `src/pages/AdminPage.jsx`
- Changed `<GradeTag grade={post.grade} />` to `<GradeTag clean={post.grade !== 'C'} />` in the moderation tab post list.
- Changed `{report.ai_grade && <GradeTag grade={report.ai_grade} />}` to `{report.ai_grade != null && <GradeTag clean={report.ai_grade !== 'C'} />}` in the reports tab.

## Validation

- `npm run lint` passes with zero new errors (pre-existing errors in `ScanPage.jsx` and `twoStageAI.js` are unrelated to this change).
- No orphaned references to `EcoPointsPage`, `IconEco`, or `ecoPoints` remain in the modified files.
- `GradeTag` now receives the correct `clean` boolean in all AdminPage call sites.

## Notes

- The `EcoPointsPage` source file itself (`src/pages/EcoPointsPage.jsx`) was not deleted — it is left in place to avoid accidental data loss; it can be removed separately once confirmed no other references exist.
- The KPI strip in `HomePage` now has 2 cards (kg recycled, earnings) instead of 3; grid layout is `sm:grid-cols-3` and may need adjustment to `sm:grid-cols-2` as a follow-up UI fix if desired.
