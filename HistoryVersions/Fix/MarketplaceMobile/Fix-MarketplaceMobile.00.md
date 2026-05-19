# Fix-MarketplaceMobile.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview

Mobile usability fixes for MarketplacePage and i18n cleanup for PostAdForm.

## Reason

Mobile audit identified Post Ad completely hidden on mobile, category tabs overflowing, hardcoded Thai strings, and a raw `<a>` tag causing full page reload.

## Changes

### `src/pages/MarketplacePage.jsx`
- **Post Ad form**: removed `hidden lg:block` — now visible on all screen sizes
- **Category filter tabs**: `flex-wrap` → `overflow-x-auto scrollbar-hide` + `flex-nowrap min-w-max` inner div so tabs scroll horizontally on mobile
- **Directions button**: `<a href="/map">` → `<button onClick={() => navigate('/map')}>` — SPA navigation, no full reload
- **PostAdForm strings**: replaced hardcoded `สภาพ`, `สะอาด`, `ไม่สะอาด`, `ที่ตั้ง`, `กด 'ใช้ตำแหน่งปัจจุบัน'`, `📍 ตำแหน่ง` with `t.conditionLabel`, `t.cleanLabel`, `t.dirtyLabel`, `t.locationLabel`, `t.tapToLocate`, `t.useMyLocation`

### `src/i18n/en.js` + `src/i18n/th.js`
- Added: `conditionLabel`, `cleanLabel`, `dirtyLabel`, `locationLabel`, `tapToLocate`

## Validation

- `npm run lint` — 0 errors
- `npm run build` — clean
