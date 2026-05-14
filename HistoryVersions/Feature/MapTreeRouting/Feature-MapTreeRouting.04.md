# Feature-MapTreeRouting.04 — UI Quality Audit & Remediation

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Full UI audit across all pages for mobile/desktop layout correctness, dark/light mode token integrity, and missing/excess UI components. 10 issues identified (UIQ-01 to UIQ-10) and all fixed in a single pass using 5 parallel agents.

## Reason

Comprehensive visual review revealed: (1) UserLayout missing desktop sidebar despite BuyerLayout having one, (2) EcoPointsPage using hardcoded hex colors breaking dark mode, (3) ProfilePage cards never expanding on desktop, (4) MapPage using fixed inline height and no dark tile layer, (5) SettingsPage/AdminPage minor token/layout issues.

## Changes

### `src/layouts/UserLayout.jsx`
- Added `SidebarLink` component (icon + label + badge, horizontal)
- Added `<aside>` desktop left sidebar: `hidden md:flex md:fixed left-0 top-0 bottom-0 w-[220px]` with logo, nav links, and language toggle
- TopBar `<header>`: added `md:hidden`
- BottomTabBar `<nav>`: added `md:hidden`
- `<main>`: changed to `flex-1 pb-[68px] md:pb-0 md:ml-[220px]`
- Outer wrapper: `flex flex-col` → `flex flex-col md:flex-row`

### `src/pages/EcoPointsPage.jsx`
- `TIERS` array: replaced hardcoded hex with CSS tokens (Bronze→`--orange`, Silver→`--ink-3`, Gold→`--green`, Platinum→`--blue`)
- `<main>`: added `max-w-5xl mx-auto`
- Tier table + Rewards section wrapped in `grid grid-cols-1 md:grid-cols-2 gap-6 items-start`

### `src/pages/ProfilePage.jsx`
- `UserProfile`: desktop 2-col grid `md:grid-cols-[1fr_1.5fr]` (identity left, history right), `max-w-2xl`
- `BuyerProfile`/`AdminProfile`: cards expanded to `max-w-2xl`
- `BuyerProfile`: replaced `BUYER_ACCEPTED` constant + `useState` with `useSelector(s => s.buyer?.acceptedMaterials)` + `dispatch(setAcceptedMaterials(next))`
- Removed `BUYER_ACCEPTED` module-level constant

### `src/pages/MapPage.jsx`
- Map container: removed `style={{ height: 420 }}`, replaced with `h-[55vw] max-h-[480px] min-h-[260px] border-[1.5px] border-[var(--ink)]`
- Layout: `md:grid md:grid-cols-[180px_1fr] md:gap-6` — filter sidebar on desktop, pill row on mobile (`md:hidden`)
- Dark mode tiles: added `darkMode = useSelector(s => s.user.darkMode)` and conditional CartoDB dark tiles

### `src/pages/SettingsPage.jsx`
- `<main>`: added `max-w-xl mx-auto w-full` to constrain desktop width

### `src/pages/AdminPage.jsx`
- `heatColor()`: `'var(--green-soft, #C8F5D8)'` → `'var(--green-soft)'`
- Heatmap legend swatch: same replacement (hex fallback removed)

### `PRD.md`
- Added Section 19: UI Quality Audit (issue register UIQ-01→UIQ-10, remediation plan, desktop nav pattern spec, EcoPoints token map)
- All 10 issues marked ✅ Fixed

## Validation

- `npm run lint` — no new lint errors introduced
- All CSS values use design tokens only (`--ink`, `--paper`, `--paper-2`, `--green`, `--orange`, `--blue`, `--ink-3`, `--ink-4`, `--green-soft`)
- Desktop sidebar pattern matches `BuyerLayout` reference implementation

## Notes

- `--blue` token (`#5BC0BE`) confirmed in `index.css` for both light and dark mode; safe to use for Platinum tier
- CartoDB dark tiles require no API key (free public CDN)
- `buyerSlice.acceptedMaterials` persists to `localStorage['buyer_settings']` automatically via slice reducer
