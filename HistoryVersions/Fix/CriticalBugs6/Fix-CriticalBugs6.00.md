# Fix-CriticalBugs6.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview

Six critical bugs fixed across Redux state management, the buyer onboarding wizard, rider online toggle, ETA calculation, materials persistence, and account deletion.

## Reason

Silent state corruption, missing form functionality, missing error rollback, wrong distance math, missing Supabase writes, and a no-op delete button were all blocking real usage.

## Changes

### `src/store/logisticsSlice.js`
- `setNearbyOrders` reducer now accepts a function payload (functional update pattern) in addition to a plain array. RTK/Immer was previously assigning the function reference to `state.nearbyOrders`, silently breaking realtime order tracking.

### `src/pages/BuyerOnboardingPage.jsx`
- Replaced empty stub with a real 3-step wizard.
- Step 1: inputs for shop name, description, phone, LINE ID.
- Step 2: material toggle buttons sourced from `WASTE_ITEMS` in `src/data/wasteItems.js`.
- Step 3: open-day toggles (Mon–Sun), pickup radius number input, Finish button.
- On Finish: upserts to `shops` table, updates `user_profiles` (`accepted_materials`, `open_days`, `onboarding_complete: true`), navigates to `/dashboard`.
- Added `OnbStepper` component showing done/active/idle step states.
- Back buttons on steps 2 and 3.
- Neo-brutalist styling: `border-[1.5px] border-[var(--ink)]`, `font-brand` headings, `font-data` labels, `font-body` inputs.

### `src/pages/RiderDashboardPage.jsx`
- `toggleOnline`: destructures `{ error }` from the Supabase `.update()` call. On error, rolls back `setIsOnline(!next)` and shows `toast.error('Could not update status')`.

### `src/components/UserTrackingPanel.jsx`
- Added `import { haversineKm } from '../utils/haversine'`.
- ETA calculation replaced: removed `Math.hypot(latDiff, lngDiff) / 0.003` (Euclidean degree approximation) with `haversineKm(riderLat, riderLng, pickupLat, pickupLng)` divided by 30 km/h average speed, multiplied by 60 for minutes.

### `src/pages/DashboardPage.jsx`
- Materials tab: extracted inline async handler to named `handleSaveMaterials` function.
- Error branch: shows `toast.error` on Supabase failure instead of failing silently.
- Added `materialsSaved` state; displays green "● saved" indicator after successful save, clears it when the user toggles any material.

### `src/pages/SettingsPage.jsx`
- Added imports: `useNavigate` from `react-router-dom`, `clearUser` from `../store/userSlice`, `toast` from `sonner`.
- Delete account button: replaced `onClick={() => {}}` with `handleDeleteAccount`.
- `handleDeleteAccount`: confirms via `window.confirm` (bilingual), soft-deletes by setting `deleted_at` in `user_profiles`, calls `supabase.auth.signOut()`, dispatches `clearUser()`, navigates to `/`.

## Validation

- `npm run lint` passes with 0 errors in all 6 edited files.
- Remaining lint errors (6) are pre-existing in `UserLayout.jsx` and `yoloInference.js` — outside the scope of this fix.

## Notes

- The `OnbStepper` is defined inline in `BuyerOnboardingPage.jsx`; if it needs reuse elsewhere it should be extracted to `src/components/`.
- `handleSaveMaterials` in `DashboardPage.jsx` guards `session.user.id` — callers where `session` is null cannot trigger a save (the Save button has `disabled={!session?.user?.id}`).
