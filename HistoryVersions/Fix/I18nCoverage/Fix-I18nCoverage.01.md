# Fix-I18nCoverage.01

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

Second pass of i18n coverage cleanup. Removed all remaining `t.xxx ?? 'hardcoded fallback'` patterns from pages and layouts where the keys already existed in the i18n files. Added the one genuinely missing key (`locationAcquired`). Fixed duplicate keys that were erroneously added to en.js and th.js.

## Reason

After PR #69, pages still used `?? 'English fallback'` guards on keys that existed in the i18n files — meaning Thai users saw English text. Pages affected: LoginPage, ScanPage, MapPage, MarketplacePage, BasketPage, BuyerLayout, UserLayout.

## Changes

### `src/i18n/en.js`
- Added `locationAcquired: 'Location acquired'` (only genuinely new key)
- Removed duplicate key block that was erroneously added (those keys already existed at lines 171–216)

### `src/i18n/th.js`
- Added `locationAcquired: 'ได้รับตำแหน่งแล้ว'`
- Removed duplicate key block (same reason)

### `src/pages/MapPage.jsx`
- Removed `?? '...'` fallbacks from `t.mapTitle`, `t.useMyLocation`
- Fixed `t.useMyLocation ?? 'Location acquired'` → `t.locationAcquired` (was using wrong key with wrong fallback)

### `src/pages/MarketplacePage.jsx`
- Removed `?? '...'` fallbacks from `t.directions`, `t.chat`, `t.noShopsNear`

### `src/pages/ScanPage.jsx`
- Removed `?? '...'` fallbacks from all report/confidence keys (`t.reportSuccess`, `t.lowConfidenceTitle`, `t.lowConfidenceHint`, `t.reportIssue`, `t.reportTitle`, `t.reportHint`, `t.reportSubmit`, `t.reportCancel`, `t.handlingGuide`)

### `src/pages/LoginPage.jsx`
- Removed `?? '...'` fallbacks from all auth keys (`t.invalidCredentials`, `t.passwordTooShort`, `t.passwordMismatch`, `t.passwordUpdated`, `t.resetPassword`, `t.setNewPassword`, `t.emailNotVerified`, `t.resendVerification`, `t.sendResetLink`, `t.backToSignIn`, `t.email`, `t.password`, `t.forgotPassword`, `t.checkInbox`, `t.resetLinkSent`, `t.didntReceive`, `t.resendLink`, `t.setNewPasswordSub`, `t.newPassword`, `t.confirmNewPassword`, `t.resetPasswordSub`)

### `src/pages/BasketPage.jsx`
- Removed `?? 'All'` fallback from `t.allItems`

### `src/layouts/BuyerLayout.jsx`
- Removed `?? '...'` fallbacks from all nav labels and role badge

### `src/layouts/UserLayout.jsx`
- Removed `?? 'Basket'` and `?? 'Chat'` fallbacks from nav arrays

## Validation

- `npm run lint` — zero errors
- All `t.xxx ?? '...'` patterns in JSX/layouts eliminated (zero remaining)

## Notes

Keys already existed in both en.js and th.js from earlier work. The `?? fallback` pattern masked missing Thai translations — now resolved correctly.
