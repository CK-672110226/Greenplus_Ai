# Feature-AuthRoles.03 — C-03: User Portal Shopee-like Layout

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview
Implemented C-03 from WORKPLAN.md: a Shopee-like layout for the user role portal, replacing the top NavBar with a sticky TopBar + fixed BottomTabBar. Introduced `SmartLayout` as a single layout route that renders the correct shell based on Redux role state.

## Reason
User portal needs a mobile-first Shopee-like experience with bottom navigation tabs. Buyer/Admin must continue using the existing NavBar layout. A single `SmartLayout` component avoids duplicate route definitions for shared pages (e.g. `/profile`) by deciding layout at render time rather than at route definition time.

## Architecture Decision
**SmartLayout pattern**: wraps all routes as a single React Router layout route. At render time reads `profile.role` from Redux:
- `role === 'user'` → renders `UserLayout` (TopBar + `<Outlet />` + BottomTabBar)
- all other roles / unauthenticated → renders NavBar + `<Outlet />`
- `loading === true` → returns `null` (matches ProtectedRoute behavior, prevents flash)

This allows `/profile`, `/marketplace`, `/settings` to render correctly inside UserLayout for users and inside the NavBar layout for buyers/admins, without duplicate route entries.

## Changes

### `src/layouts/SmartLayout.jsx` (NEW)
- Reads `{ profile, session, loading }` from Redux
- Returns null during loading
- Returns `<UserLayout />` when `role === 'user'`
- Returns `<NavBar /> + <Outlet />` wrapper for all other roles

### `src/layouts/UserLayout.jsx` (NEW)
- Sticky TopBar: GreenPlus.Ai logo (clicks to /home), language toggle, basket icon with active-item badge
- `<Outlet />` content area with `pb-[68px]` to clear the fixed bottom bar
- Fixed BottomTabBar: Home / Scan / Basket (badge) / Map / Profile
- Tab items use `NavLink` with `isActive` for green active state
- All icons are inline SVG (no external icon library)
- Basket badge shows `basket.filter(i => !i.skipped).length`

### `src/pages/HomePage.jsx` (NEW)
- Scan CTA card (full-width, taps to /scan) with scanner SVG icon
- Active basket summary: lists up to 3 items with grade + value, "Find Route" CTA
- Last scan result card (from `state.waste.lastScan`)
- Quick-link grid: Map → /map, Eco Points → /eco-points

### `src/App.jsx` (REWRITTEN)
- Removed top-level `<NavBar />` and wrapping `<div className="min-h-screen...">`
- All routes wrapped under `<Route element={<SmartLayout />}>`
- Added `<Route path="/home" element={<ProtectedRoute requiredRole="user"><HomePage /></ProtectedRoute>} />`
- `/eco-points` moved to user-only (`requiredRole="user"`)
- Import `SmartLayout`, `HomePage` added

### `src/pages/LandingPage.jsx`
- `ROLE_DEST.user` changed from `'/scan'` to `'/home'`

### `src/i18n/en.js` + `src/i18n/th.js`
- Added `home: 'Home'` / `home: 'หน้าหลัก'`

## Validation
- `npm run lint` — 0 errors
- `npm run build` — 177 modules, success
- Manual checklist:
  - [ ] User login redirects to /home (not /scan)
  - [ ] /home shows scan CTA + basket summary + quick links
  - [ ] TopBar logo clicks → /home
  - [ ] TopBar basket icon → /basket, shows badge count
  - [ ] BottomTabBar tabs highlight active route
  - [ ] /profile, /marketplace, /settings accessible via tab bar and work correctly
  - [ ] Buyer login still shows NavBar at top (no BottomTabBar)
  - [ ] Admin login still shows NavBar

## Notes
- BuyerLayout (C-04) will follow the same SmartLayout pattern — add `role === 'buyer'` branch returning `<BuyerLayout />`
- `SmartLayout` is the integration point for all future role-specific layouts
