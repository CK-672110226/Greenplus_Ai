# Fix-M10MobileAdminBan.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview

M10 pre-pilot fixes covering mobile layout alignment, admin ban/unban for users and shops, admin edit for users and shops, and ScanPage error boundary.

## Reason

Architectural review identified six mobile-specific issues (breakpoint inconsistency, touch targets, missing error recovery) and a gap in admin tooling — admin had no way to ban users or shops, and no way to edit their details.

## Changes

### `supabase/migrations/018_admin_ban.sql`
- Added `is_banned BOOLEAN NOT NULL DEFAULT false` to `user_profiles`
- Expanded `shops.status` CHECK to include `'banned'`
- Added admin UPDATE policies for `user_profiles` and `shops`

### `src/layouts/UserLayout.jsx`
- All `lg:` breakpoints → `md:` (aligned with BuyerLayout)
- Mobile nav: replaced `/marketplace` with `/chat` (with unread badge)

### `src/layouts/SmartLayout.jsx`
- Added `SuspendedScreen` component shown when `profile.is_banned === true`
- Imported `useT` hook for i18n

### `src/pages/ScanPage.jsx`
- Added `ScanErrorBoundary` class component (inline, not full-screen)
- Wrapped viewfinder div with `<ScanErrorBoundary>` so camera crashes show a recoverable fallback
- Added `Component` to React import

### `src/pages/DashboardPage.jsx`
- Header truncation fix (`truncate max-w-[60vw]` on shop name)
- BookingRow button touch targets: `py-1` → `py-2.5`
- `in_transit` status chip (green border)
- Revenue calculation includes `accepted` bookings
- Scheduled time uses `toLocaleString` (no hardcoded "today")
- Pricing tab loads live `price_per_kg` from `shop_pricing`

### `src/pages/AdminPage.jsx`
- Tab bar: `flex-wrap` → `overflow-x-auto scrollbar-hide` + `flex-nowrap min-w-max` inner div
- Added Users tab with lazy load and ban/unban toggle
- Added inline **Edit** form for active shops (name + area)
- Added inline **Edit** form for users (display_name + role select)
- Rider assignment row: `flex-col sm:flex-row` stacking, `py-2.5` touch targets
- `useEffect` for users now uses async pattern to satisfy `react-hooks/set-state-in-effect` lint rule

### `src/hooks/useAdminActions.js`
- Added `banUser`, `unbanUser`, `banShop`, `unbanShop` actions
- Added `updateShop(id, patch)` and `updateUser(id, patch)` for admin edit

### `src/i18n/en.js` + `src/i18n/th.js`
- Added: `adminUsers`, `banUser`, `unbanUser`, `banShop`, `unbanShop`, `bannedLabel`, `allUsers`, `userBanned`, `userUnbanned`, `shopBanned`, `shopUnbanned`, `accountSuspended`, `accountSuspendedHint`, `editShop`, `editUser`, `shopUpdated`, `userUpdated`, `shopArea`, `userRole`

## Validation

- `npm run lint` — 0 errors
- `npm run build` — clean build, 690ms

## Notes

- `allShops` comes from `useShops()` hook (read-only). Shop name edits are persisted to DB and will reflect on next data load. Pending shops list is updated optimistically.
- Migration 018 must be applied to Supabase production after merge.
- Migration 017 (`in_transit` status) from PR #86 must also be applied.
