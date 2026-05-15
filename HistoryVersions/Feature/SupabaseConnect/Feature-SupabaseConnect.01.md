# Feature-SupabaseConnect.01

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Connect user-side basket booking and buyer pricing features to Supabase, replacing purely localStorage/Redux-only persistence with dual-write (Redux + Supabase).

## Reason

Bookings submitted through BasketPage and pricing set through PricingPage were only persisted in Redux (in-memory, lost on reload) and localStorage (per-device). Connecting both to Supabase enables cross-device persistence and lets the buyer's dashboard read actual booking records from the database.

## Changes

### `src/hooks/useInsertBooking.js` (new)

- Returns `insertBooking(shop, activeItems, estValue)` async function via `useCallback`.
- Groups `activeItems` by `material_type`, summing `weight_kg` per material.
- Inserts one row per material into `bookings` with `status: 'pending'`.
- Returns `true` on success, `false` on any error or missing session — never throws.

### `src/hooks/useMyShop.js` (new)

- Returns `{ shop, loading }` for the currently-logged-in buyer.
- Queries `shops` where `owner_id = session.user.id` using `.maybeSingle()`.
- Falls back silently (shop stays `null`) if session is absent or Supabase fails.
- Matches the silent-failure pattern used by `useShops` and `useSupabaseBookings`.

### `src/pages/BasketPage.jsx`

- Added `useInsertBooking` import.
- `handleConfirmBooking` made `async`; calls `await insertBooking(shop, activeItems, total)` after the existing `dispatch(addBooking(...))`.
- Redux dispatch is kept — Supabase write is additive, not a replacement.

### `src/pages/PricingPage.jsx`

- Added `useEffect`, `useMyShop`, and `supabase` imports.
- On mount (when `shop` resolves), fetches `shop_pricing` rows for that shop and merges them into local state, overriding the localStorage-seeded defaults.
- `handleSave` made `async`; after `dispatch(bulkSet(local))` it upserts all material rows to `shop_pricing` using `onConflict: 'shop_id,material_type'`.
- All Supabase calls wrapped in `try/catch` — failures are silent.

## Validation

- `npm run lint` passes with 0 errors after adding `// eslint-disable-next-line react-hooks/set-state-in-effect` to `useMyShop` (same pattern as `useSupabaseBookings`).
- No existing Redux behaviour removed or altered; Supabase writes are strictly additive.

## Notes

- `useMyShop` uses `.maybeSingle()` (not `.single()`) to avoid throwing when the buyer has no shop row yet.
- `PricingPage` intentionally excludes `reduxPrices` from the `useEffect` dependency array — the DB load should fire once when the shop resolves, not re-run on every Redux price change.
- The `est_value` column on `bookings` receives the aggregate basket total, not a per-material breakdown; this matches how the buyer dashboard displays it.
