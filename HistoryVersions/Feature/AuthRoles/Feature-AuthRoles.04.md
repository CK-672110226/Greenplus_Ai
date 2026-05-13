# Feature-AuthRoles.04 — C-04: Buyer Portal Industrial Layout

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview
Implemented C-04: BuyerLayout — an industrial dashboard shell with a fixed left sidebar on desktop and a horizontal scrollable nav strip on mobile. Wired into SmartLayout so buyers automatically get this layout when logged in.

## Changes

### `src/layouts/BuyerLayout.jsx` (NEW)
- Desktop (md+): fixed left sidebar (200px) with role badge, nav links (Dashboard/Marketplace/Profile/Settings), language toggle, logout
- Active sidebar link: left green border + inverted ink/paper background
- Mobile: sticky TopBar (logo, lang, logout) + horizontal scrollable nav strip with uppercase tracking labels
- Main content: `<Outlet />` fills remaining space

### `src/layouts/SmartLayout.jsx` (MODIFIED)
- Added `role === 'buyer'` branch → renders `<BuyerLayout />`
- Import added for BuyerLayout

### `src/pages/HomePage.jsx` (BUG FIX)
- Fixed `border-[var(--ink-5)]` → `border-[var(--ink-4)]` (only ink-2/3/4 exist in design tokens)

## Validation
- `npm run lint` — 0 errors
- `npm run build` — success
