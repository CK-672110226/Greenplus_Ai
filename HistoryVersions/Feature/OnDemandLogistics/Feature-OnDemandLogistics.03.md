# Feature-OnDemandLogistics.03

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview

Expanded the on-demand booking system to support multi-shop scheduling with a live countdown, and added a new Driver Dashboard page for buyers acting as drivers.

## Reason

The previous on-demand panel sent a single, undifferentiated booking. This version allows users to schedule pickups at multiple shops with separate time slots, watch real-time acceptance status, and handle timeout/complete flows. Buyers now also have a Driver Dashboard tab for accepting customer pickups and inter-shop transfer jobs.

## Changes

### `supabase/migrations/020_booking_groups_driver.sql` (new)
- `booking_groups` table: links multiple shop bookings from one on-demand request; includes seller_id, status, expires_at.
- Adds `booking_group_id`, `scheduled_for`, `expires_at` columns to `bookings`.
- `transfer_jobs` table: inter-shop logistics with from/to shop, driver, material, weight, price, status.
- RLS policies for both tables.

### `src/hooks/useBookingGroup.js` (new)
- `createGroup(shopSlots, activeItems)`: inserts a `booking_groups` row, then inserts one booking row per shop slot.
- Supabase Realtime subscription on `bookings` filtered by `booking_group_id`.
- 10-minute countdown timer.
- Phase state machine: `idle` → `waiting` → `complete` | `timeout`.
- `cancelGroup()` and `reset()` helpers.

### `src/pages/BasketPage.jsx` (modified)
- Removed `handleOnDemandBook` function.
- Added `useBookingGroup` import and hook usage.
- Added `onDemandStep` and `shopSchedules` state.
- Added `generateSlots` and `fmtSlot` helpers (outside component).
- Added `useEffect` to sync `phase` → `onDemandStep`.
- Added `useEffect` to pre-populate `shopSchedules` from computed route when entering on-demand mode.
- Replaced simple on-demand panel with 4-step UI: `schedule` | `waiting` | `timeout` | `complete`.

### `src/pages/DriverDashboardPage.jsx` (new)
- Two-tab page (`/driver`, buyer-only): Customer Pickups + Inter-shop Jobs.
- Online/offline toggle with GPS polling.
- `PickupCard`, `TransferCard`, `ActiveOrderPanel` sub-components.
- Accept → Arrived → weight verification → Complete flow.
- Loads `transfer_jobs` from Supabase on mount when online.

### `src/App.jsx` (modified)
- Lazy-loads `DriverDashboardPage`.
- Adds `/driver` route protected by `requiredRole="buyer"`.

### `src/layouts/BuyerLayout.jsx` (modified)
- Added `IconDriver` SVG (truck).
- Added `/driver` sidebar link with driver mode title label.
- Replaced `/rider` hero tab with `/driver` hero tab in mobile bottom bar.

### `src/i18n/en.js` and `src/i18n/th.js` (modified)
- Added 22 new keys for on-demand scheduling and driver dashboard features.
- `viewOnMap` added alongside spec keys.

## Validation

- `npm run lint` — 0 errors (fixed one `react-hooks/set-state-in-effect` error in `useBookingGroup.js` by wrapping synchronous `setPhase` calls in an async function inside the effect).
- `npm run build` — succeeded, 1847 modules transformed. Chunk-size warnings are pre-existing (tensorflow, onnx, supabase).

## Notes

- The `actualWeight`, `completeAndPay`, and `cancelPickup` i18n keys already existed in both locale files (from the logistics section); the Driver Dashboard reuses them without duplication.
- `eslint-disable-line react-hooks/exhaustive-deps` comment applied to `shopSchedules` init effect — including `activeItems` as a dep would cause infinite re-renders since it is a new array reference each render; `multi.length` and `single.length` are sufficient guards.
