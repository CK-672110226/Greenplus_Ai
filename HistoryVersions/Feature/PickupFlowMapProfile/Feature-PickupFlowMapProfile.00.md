# Feature-PickupFlowMapProfile.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview
Major buyer/user experience sprint: language persistence, settings i18n, basket 2-mode pickup flow, shop profile expansion, dashboard pricing with volumes, and map scheduled-booking markers with proximity notifications.

## Reason
User audit identified: language preference resets on every page reload; Settings page had hardcoded English strings visible to Thai users; basket lacked clear walk-in vs on-demand pickup modes; shop profile missing phone/location/radius fields; dashboard pricing tab showed no transaction volumes for decision-making; map showed no user's active bookings.

## Changes

### `src/store/userSlice.js`
- Added `resolveInitialLanguage()` — checks localStorage `gp_language` first, falls back to `navigator.language`
- `setLanguage` reducer now also writes to `localStorage.setItem('gp_language', payload)`

### `src/hooks/useAuth.js`
- Added `setLanguage` import
- After profile load, dispatches `setLanguage(data.language_pref)` when `language_pref` exists, so server-side preference wins

### `src/pages/SettingsPage.jsx`
- All hardcoded English section labels and toggle labels replaced with i18n keys

### `src/pages/BasketPage.jsx`
- Added `pickupMode` state (`dropOff` | `onDemand`)
- Added two-button mode toggle strip (Drop off / Request pickup)
- In `dropOff` mode: existing single/multi-stop route UI unchanged
- In `onDemand` mode: new panel shows GPS status + "Call a pickup rider" button that inserts an on-demand booking and navigates to `/map`
- `handleConfirmBooking` passes `{ mode: 'dropOff', lat, lng }` to `insertBooking`

### `src/hooks/useInsertBooking.js`
- Signature: `insertBooking(shop, activeItems, pickupOptions = {})`
- Inserts `pickup_mode`, `pickup_lat`, `pickup_lng` into each booking row
- `shop` is now optional (`shop?.id ?? null`) to support on-demand bookings with no pre-selected shop

### `src/pages/ProfilePage.jsx` — BuyerProfile
- Added `shopPhone`, `shopLat`, `shopLng`, `shopRadius` state fields
- `useEffect` sync extended to load these from `shop`
- Edit form: added Phone, Shop location (with "Use my location" button), Pickup radius fields
- `handleSaveShop` persists all new fields to Supabase
- View mode shows phone, lat/lng, and radius when set

### `src/pages/DashboardPage.jsx`
- Added `materialVolumes` state + `useEffect` querying `bookings` for completed/pending kg per material
- Pricing tab: 2-column table expanded to 4-column (Material | Price | Pending kg | Completed kg)

### `src/pages/MapPage.jsx`
- Reads session user's active bookings (`pending/accepted/searching`) with `pickup_lat/lng`
- Renders orange divIcon markers for bookings on map with popup (status, material, date)
- Proximity effect: fires browser `Notification` when user GPS is within 0.3 km of an active booking's shop

### `supabase/migrations/019_booking_pickup_mode.sql`
- Adds `pickup_mode TEXT DEFAULT 'dropOff'` to `bookings` table

### `src/i18n/en.js` + `src/i18n/th.js`
- Added 8 settings keys: `settingsAccount`, `priceAlertsLabel`, `pickupRemindersLabel`, `marketingLabel`, `linkedAccountsLabel`, `exportMyData`, `deleteAccountLabel`, `settingsRole`
- Added 13 feature keys: `modeDropOff`, `modeOnDemand`, `onDemandTitle`, `onDemandDesc`, `callPickupRider`, `noGpsWarning`, `shopPhone`, `pickupRadius`, `shopLocation`, `addBranch`, `volPending`, `volCompleted`, `nearbyShopNotifTitle`

## Validation
- `npm run lint` — clean
- `npm run build` — success (757ms)

## Notes
- Proximity notification requires browser `Notification.permission === 'granted'`. No permission request is triggered automatically — user must allow from browser prompt on first notification event.
- `pickup_mode` migration must be applied to remote Supabase before on-demand bookings are inserted.
