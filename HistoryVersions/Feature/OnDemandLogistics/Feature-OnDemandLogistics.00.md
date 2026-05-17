# Feature-OnDemandLogistics.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

---

## Overview

Implements the On-Demand Logistics feature: a Grab-inspired waste pickup system connecting sellers (users), riders (buyers acting as mobile collectors), and the existing admin heatmap. This is the initial scaffold (M5).

---

## Reason

M5 milestone: enable on-demand pickup flows for the 3-sided marketplace. Sellers call for pickup from their basket; riders toggle online and accept nearby jobs; the system tracks status in real time through Supabase subscriptions.

---

## Changes

### New files

**`src/store/logisticsSlice.js`**
- Redux slice with `activeBooking`, `nearbyOrders`, `riderLocation`, `isOnline` state.
- Actions: `setActiveBooking`, `setNearbyOrders`, `setRiderLocation`, `setIsOnline`, `clearActiveBooking`.

**`src/hooks/useRealtimeLogistics.js`**
- Seller path: subscribes to own `bookings` row on status changes; when `accepted`, subscribes to rider's `user_profiles` row for live GPS.
- Rider path: on `isOnline=true`, loads all `searching` bookings then filters to 5 km radius via `haversineKm`; subscribes to `bookings` INSERT/UPDATE to add/remove orders reactively.
- Returns `{ activeBooking, nearbyOrders, riderLocation }`.

**`src/pages/RiderDashboardPage.jsx`**
- Export: `RiderDashboardPage`.
- Online toggle: updates `user_profiles.is_online` in Supabase; starts 30-second GPS interval via `useGPS`.
- Renders: available order cards (distance, est. value, accept button), active order section (arrived / cancel actions), weight verification panel (per-item ± controls, recalculated value, complete & pay).
- Uses inline `PRICE_PER_KG` map for value estimation (same rates used in weight editor).

**`src/components/UserTrackingPanel.jsx`**
- Export: `UserTrackingPanel`.
- Status-driven UI: pulsing dot for `searching`, Leaflet mini-map (blue user pin + green rider pin) for `accepted`, green banner for `arrived`, receipt + done actions for `completed`.
- Fixes Leaflet default icon paths for Vite bundling.
- Falls back to a placeholder div when GPS coordinates are unavailable.

**`src/pages/ChatPage.jsx`**
- Minimal stub for `/chat` and `/chat/:roomId` routes. Displays "Coming soon" message.

**`src/pages/BuyerOnboardingPage.jsx`**
- 3-step onboarding stub for `/onboarding`. Step state with forward navigation.

### Modified files

**`src/store/index.js`**
- Added `import logisticsReducer from './logisticsSlice'` and `logistics: logisticsReducer` to the store.

**`src/App.jsx`**
- Added lazy imports for `RiderDashboardPage`, `ChatPage`, `BuyerOnboardingPage`.
- Added routes: `/rider` (buyer-only), `/onboarding` (buyer-only), `/chat`, `/chat/:roomId` (all authenticated).
- Changed `/notifications` from `requiredRole="buyer"` to no role restriction (all authenticated users).

---

## Validation

- ESM project: all imports use static `import` statements (no `require` calls).
- `react-leaflet` v5 confirmed in `package.json` — full `MapContainer` used (no placeholder).
- Design tokens: all colors via `--ink`, `--ink-2`, `--ink-3`, `--ink-4`, `--paper`, `--paper-2`, `--green-ink`, `--green-soft`, `--orange`. No raw hex values.
- Typography: `font-brand`, `font-body`, `font-data` classes throughout.
- Neo-brutalist borders: `border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]`.
- Supabase realtime channels properly cleaned up via `useEffect` return functions.
- GPS interval cleared on `isOnline=false` or unmount.

---

## Notes

- `PRICE_PER_KG` in `RiderDashboardPage` is a local constant (`{ PET:12, HDPE:8, Paper:5, Glass:3, Metal:18, Mixed:4 }`). A future task should replace this with live `shop_pricing` rates from Supabase.
- The ETA calculation in `UserTrackingPanel` is a rough Euclidean-degree estimate (`hypot / 0.003`). Replace with a routing API when M8 launches.
- `booking.buyer_name` and `booking.buyer_rating` are read directly from the booking row. If not populated by the DB, display defaults gracefully.
