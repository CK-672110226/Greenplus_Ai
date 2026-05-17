# Fix-DesignSpecFullPass.00

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

Full alignment pass across all pages against `docs/design-spec.md`. Covers CSP fix, DashboardPage rewrite, and targeted fixes to ScanPage, MarketplacePage, MapPage, plus creation of EcoPointsPage and route registration.

## Reason

Previous session partial patches left several spec gaps open. User requested "ทำทุกหน้าให้เหมือนกับ design ทุกอย่าง" — every page must match design-spec.md exactly.

## Changes

### `vercel.json`
- Added `https://*.ingest.sentry.io https://*.ingest.us.sentry.io` to `connect-src` in CSP headers to unblock Sentry event reporting.

### `src/pages/DashboardPage.jsx`
- Complete rewrite: removed `items-center` from main (was narrowing content), added `max-w-4xl mx-auto w-full` full-width layout.
- h1 shows real shop name from profile.
- 4 KPI cards in `grid-cols-2 md:grid-cols-4` with hover lift.
- `AvatarInitial`, `StatusChip`, `BookingRow` components added.
- Tab bar with flush gap-0 tabs and orange "● N new" badge.

### `src/pages/ScanPage.jsx`
- Added `+N impact pts` line (green-ink, font-data, 13px) inside the Estimated value box, below the ฿ total. Formula: `Math.max(1, Math.round(weight * 10))` pts per kg.

### `src/pages/MarketplacePage.jsx`
- Added `[All grades] [Grade A] [Grade B] [Grade C]` filter tab row in the right-column header, below the Listings/Buy Requests tabs. State (`grade`) was already declared.

### `src/pages/MapPage.jsx`
- Removed unused `useNavigate` import.
- Added scrollable shop list BELOW the map container showing name, distance (km), open/closed chip, accepted materials (·-separated), and Directions ↗ button per shop.
- Shop list uses same border/ink design tokens, no raw hex values.

### `src/pages/EcoPointsPage.jsx` _(new)_
- Created `/eco-points` user page per spec section 3.8.
- Tier system: Bronze (0–999), Silver (1000–1999), Gold (2000–2999), Platinum (3000+) with multiplier bonus labels.
- Progress bar to next tier.
- Tier table with current tier highlighted in green-soft bg.
- "How points work" info card.
- Timeline of recent scan history from `useScanHistory` hook showing material + pts earned per entry.
- Data from `user.profile.eco_points` (redux).

### `src/App.jsx`
- Added lazy import for `EcoPointsPage`.
- Added route `<Route path="/eco-points" element={<ProtectedRoute requiredRole="user"><EcoPointsPage /></ProtectedRoute>} />`.

### `src/pages/BasketPage.jsx`
- Removed unused `routeMode`, `setRouteMode`, `showRoute`, `setShowRoute` state vars.
- Removed unused `materials` destructure from `computeRoutes`.

### `src/pages/HomePage.jsx`
- Removed unused `t` (useT) hook call and its import.

## Validation

- `npm run lint` — 0 errors
- `npm run build` — clean, 608ms, no new errors

## Notes

Grade filter in MarketplacePage adds UI tabs only; full per-grade shop filtering would require joining `shop_pricing` data to shops table (deferred).
