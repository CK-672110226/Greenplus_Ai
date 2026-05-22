# Fix-I18nCoverage.02

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview
Cross-role audit pass fixing 5 hardcoded strings and adding a missing mobile search trigger for user-role layout.

## Reason
Comprehensive audit of all three roles (user / buyer / admin) found hardcoded Thai and English strings visible to both locales, and the user-role mobile topbar had no way to open GlobalSearch (the component was imported and wired but never triggered from mobile).

## Changes

### `src/layouts/UserLayout.jsx`
- Added search button (magnifier icon) to mobile topbar, left of the notifications bell, to trigger `GlobalSearch` via `setSearchOpen(true)`. Matches the pattern already present in `BuyerLayout`.

### `src/pages/BasketPage.jsx`
- `ManualAddPanel`: replaced hardcoded `['สะอาด', 'ไม่สะอาด']` array with `t.cleanLabel` / `t.dirtyLabel` i18n keys.
- Bottom CTA button: replaced hardcoded `Book pickup · ฿X →` with `t.bookAppointment` key.

### `src/pages/DashboardPage.jsx`
- `BookingRow` accepted-status buttons: replaced hardcoded `COMPLETE` and `CANCEL` with `t.completePickup` and `t.cancelPickup`.

### `src/pages/MapPage.jsx`
- Shop popup "BOOK PICKUP →" button: replaced with `{t.bookAppointment} →`.

## Validation
- `npm run lint` — no errors
- `npm run build` — success (766ms)

## Notes
All i18n keys (`cleanLabel`, `dirtyLabel`, `bookAppointment`, `completePickup`, `cancelPickup`) were already present in both `en.js` and `th.js`. No new keys required.
