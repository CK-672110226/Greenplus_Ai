# Feature-SqlAggregations.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview
Replace hardcoded placeholder values and broken formulas with real Supabase queries and correct calculations across LandingPage, HomePage, DashboardPage, and ProfilePage.

## Reason
Stats shown as `'—'` on LandingPage and wrong multipliers/formulas on other pages made the data layer look disconnected from the database.

## Changes

### `src/pages/LandingPage.jsx`
- Added two new `useState` + `useEffect` calls that query `scan_history` for `weight_kg` (SUM) and `calculated_value` (SUM).
- Stats bar now shows real totals formatted as `Xt` (tonnes) or `฿Xk` for large values.

### `src/pages/HomePage.jsx`
- Added `useState`/`useEffect` import.
- Replaced static string `"last refresh 4m"` with a state variable set on component mount showing the actual HH:MM time.
- Removed `* 0.63` arbitrary payout multiplier; now shows `basket value ฿X` only when basket is non-empty.

### `src/pages/DashboardPage.jsx`
- Fixed revenue calculation: `(b.totalKg ?? 0) * 10` → `(b.estValue ?? 0)`. `estValue` is already computed correctly by `useSupabaseBookings` via `estValueForBooking()`.

### `src/pages/ProfilePage.jsx`
- Added `useEffect` import.
- `AdminProfile` component now fetches real counts from Supabase on mount:
  - Pending shops: `shops` table, `status = 'pending'`
  - Active shops: `shops` table, `status = 'active'`
  - Flagged posts: `marketplace_posts` table, `flagged = true`
- Shows `'—'` while loading, real count once resolved.

## Validation
- Lint passes (`npm run lint`).
- LandingPage stats update from `—` to real values after mount.
- DashboardPage revenue matches sum of `estValue` on accepted bookings.
- AdminProfile stats populate after mount.

## Notes
- All queries use `{ count: 'exact', head: true }` for O(1) count queries where possible; scan_history sums fetch all rows and reduce client-side (acceptable for pilot scale).
