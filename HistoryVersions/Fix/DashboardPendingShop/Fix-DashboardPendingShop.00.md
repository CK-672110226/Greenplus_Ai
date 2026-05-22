# Fix-DashboardPendingShop.00

**Date:** 23 May 2026 (23 พฤษภาคม 2569)

## Overview

Two issues reported: shop doesn't appear on the map, and the buyer dashboard shows no information after shop creation.

## Root Cause

1. **No pending-state UI**: `DashboardPage` had no visual indication when `shop.status === 'pending'`. Buyers see an empty dashboard with zero KPIs and no explanation — the shop is waiting for admin approval and is intentionally hidden from the map until approved.

2. **All remaining Leaflet CSP violations**: Three more components still loaded marker images from `unpkg.com` or `raw.githubusercontent.com`, both blocked by the `img-src` Content Security Policy. Previously only `MapPage` and `LocationPicker` were fixed.

## Changes

### `src/pages/DashboardPage.jsx`
- Added pending approval banner above KPI row when `shop?.status === 'pending'`
- Orange-bordered notice with title + body text explaining the shop is under review

### `src/i18n/en.js` + `src/i18n/th.js`
- Added `shopPendingTitle` and `shopPendingDesc` keys (EN + TH)

### `src/components/SmartRouteMap.jsx`
- Replaced `delete L.Icon.Default.prototype._getIconUrl` + unpkg URLs with local `leaflet/dist/images` imports

### `src/components/UserTrackingPanel.jsx`
- Replaced default icon unpkg URLs + `raw.githubusercontent.com` colored icons with inline SVG `L.DivIcon` (green rider, blue user pins)

### `src/pages/RiderDashboardPage.jsx`
- Same as UserTrackingPanel — inline SVG DivIcons for blue rider and green pickup markers

### `src/hooks/useSystemMonitor.js`
- Removed stale `// eslint-disable-next-line no-console` above a `console.error` call (lint warning cleanup)

## Validation

- Lint passes clean (0 errors, 0 warnings)
- All Leaflet map components now use bundled or inline SVG icons — no external `img-src` required
- Buyer on pending shop sees a clear orange banner explaining what to do next
- Admin approves shop via AdminPage → Shops tab → Pending Approval section

## Notes

- The shop on the map is only visible to users after admin sets `status = 'active'` — this is by design
- `useShops()` retains the `.eq('status', 'active')` filter for public map display
