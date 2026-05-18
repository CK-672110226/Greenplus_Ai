# Fix-DataLayerPages.00

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

Extracted all Supabase mutation calls from 7 pages into dedicated hooks, completing the data layer leakage fix across the codebase. Pages no longer import or call the Supabase client directly for write operations.

## Reason

Continuation of architecture audit fix (PR #73 covered LoginPage). Remaining pages had direct DB mutations tied to UI components — bookings, notifications, user profile, shop status, marketplace posts, pricing, and onboarding all mutated from page-level handlers.

## Changes

### New hooks

| Hook | Used by | Operations |
|------|---------|------------|
| `src/hooks/useBookingActions.js` | SchedulePage | `updateStatus(id, status)` |
| `src/hooks/useNotificationActions.js` | NotificationsPage | `markRead`, `dismissNotification`, `markAllRead` |
| `src/hooks/useSettingsActions.js` | SettingsPage | `updatePrefs`, `deleteAccount` (soft-delete + signOut), `exportData` |
| `src/hooks/useAdminActions.js` | AdminPage | `approveShop`, `rejectShop`, `flagPost` |
| `src/hooks/useReportActions.js` | ScanPage | `submitReport` |
| `src/hooks/useShopPricingActions.js` | PricingPage | `savePricing` |
| `src/hooks/useOnboardingActions.js` | BuyerOnboardingPage | `saveOnboarding` (shops upsert + user_profiles update) |

### Pages updated

- `src/pages/SchedulePage.jsx` — removed `supabase` import, 3 handlers use `bookingActions.updateStatus`
- `src/pages/NotificationsPage.jsx` — removed `supabase` import, 3 handlers use `notifActions.*`
- `src/pages/SettingsPage.jsx` — removed `supabase` import, `togglePref`/`handleDeleteAccount`/`handleExport` use `settingsActions.*`
- `src/pages/AdminPage.jsx` — kept `supabase` import for read-only `useEffect` queries; mutation handlers use `adminActions.*`
- `src/pages/ScanPage.jsx` — removed `supabase` import, report submit uses `reportActions.submitReport`
- `src/pages/PricingPage.jsx` — kept `supabase` import for read-only `useEffect` load; save handler uses `pricingActions.savePricing`
- `src/pages/BuyerOnboardingPage.jsx` — removed `supabase` import, `handleFinish` uses `onboardingActions.saveOnboarding`

### LoginPage (also updated)

Destructured `useAuthActions` return value directly to fix `react-hooks/exhaustive-deps` warning on `subscribeToRecovery`.

## Validation

- `npm run lint` passes with 0 errors, 0 warnings
- All 7 hooks verified to have no supabase import left in their respective pages
- AdminPage and PricingPage retain supabase for read-only `useEffect` data loading (not a mutation concern)

## Notes

AdminPage still has ~9 read-only supabase calls in useEffects. These could be extracted into hooks in a future pass, but are lower priority than mutations.
