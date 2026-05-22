# Fix-MarketplaceMobile.01

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview

Full Marketplace redesign per §3.7 design-spec.md, DashboardPage shop open/close toggle, and BuyerProfile shop info editing. Previous version had a pricing table + shop card two-column layout that violated the spec.

## Reason

Design spec §3.7 defines MarketplacePage as individual classified-ad listing cards filtered by grade (A/B/C), not a pricing lookup table. Buyers also had no way to toggle their shop open/closed or edit shop name/area from the UI.

## Changes

### `src/pages/MarketplacePage.jsx`
- **Complete rewrite** — removed 2-column layout (pricing table left + shop cards right)
- New layout: single-column listing cards per §3.7 spec
- Grade filter tabs: All / Grade A / Grade B / Grade C (replacing plastic/paper/metal/glass category filter)
- `ListingCard` component: grade badge, material name, weight (kg), price (฿/kg), seller name, [Contact →] button navigating to `/chat`
- `PostAdForm` modal: replaced `clean/dirty` condition toggle with `grade [A/B/C]` selector to match Supabase `grade` field in `marketplace_posts`
- Removed `useShops` dependency (shop cards are gone)
- `marketPrice` kept for suggested price hint in PostAdForm
- Sticky [+ Post Ad] button at bottom with correct offset: `bottom-[76px]` for user role (above tab bar), `bottom-4` for buyer role
- Posts filtered from `useSupabaseMarketplace` hook (grade field already populated)

### `src/pages/DashboardPage.jsx`
- Added `isOpen` state synced from `shop.is_open` via `useEffect` (async wrapper for lint compliance)
- Added `handleToggleOpen` — toggles `shops.is_open` via Supabase, shows toast
- Header: added green (open) / orange (paused) toggle button visible when `shop?.id` is available
- Toggle button shows colored dot indicator + `t.shopOpen` / `t.shopClosed` label

### `src/pages/ProfilePage.jsx`
- Added `useMyShop` import
- `BuyerProfile`: added `shopName`, `shopArea`, `isOpen`, `editingShop` state
- Added "Shop Info" card section with: open/close toggle, Edit/Cancel button, inline edit form for shop name + area
- `handleSaveShop` — updates `shops.name` and `shops.area` via Supabase
- `handleToggleOpen` — toggles `shops.is_open` via Supabase (same logic as Dashboard)
- Renamed material save handler to `handleSaveMaterials`

### `src/i18n/en.js` + `src/i18n/th.js`
Added keys:
- `shopOpen` — 'Open' / 'เปิดรับ'
- `shopClosed` — 'Paused' / 'หยุดรับ'
- `shopPauseIntake` — 'Pause Intake' / 'หยุดรับขยะ'
- `shopResumeIntake` — 'Resume Intake' / 'เปิดรับขยะ'
- `saveShopInfo` — 'Save Shop Info' / 'บันทึกข้อมูลร้าน'

## Validation

- `npm run lint` — 0 errors
- `npm run build` — clean
