# Feature-DriverAssignment.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview
Conflict-free driver assignment system: shops select a specific driver for each booking; drivers accept or decline from their dashboard; the system blocks double-booking within a 30-minute window.

## Reason
Shops need to control which driver handles each pickup day without scheduling conflicts. The previous system only had anonymous "first to accept" open-pool dispatch, which caused double-booking and no accountability when multiple shops competed for the same driver.

## Changes

### `supabase/migrations/021_driver_assignment.sql`
- Adds `is_driver BOOLEAN DEFAULT false` and `driver_vehicle TEXT` to `user_profiles` — drivers self-register
- Adds `assigned_driver_id UUID` and `driver_assignment_status TEXT DEFAULT 'unassigned'` to `bookings`
- RLS: drivers can SELECT and UPDATE bookings where `assigned_driver_id = auth.uid()`
- RLS: shops (any user with a shop) can SELECT `user_profiles` where `is_driver = true`

### `src/hooks/useDriverAssignment.js`
- `fetchAvailableDrivers(date)` — returns all `is_driver=true` users with `todayLoad` count (invited+accepted bookings for that date)
- `assignDriver(bookingId, driverId, scheduledFor)` — checks ±30-min conflicts first; returns `{ conflict: true }` if blocked, else updates booking to `driver_assignment_status='invited'`
- `respondToAssignment(bookingId, accept)` — driver sets status to `accepted` or `rejected`
- `myAssignments` state — drivers: auto-loaded and Realtime-subscribed assignments for the current user

### `src/components/ProtectedRoute.jsx`
- Added `allowIfDriver` prop — when true, users with `profile.is_driver = true` can access the route even if `requiredRole` doesn't match their role
- Enables independent drivers (role='user') to access `/driver` without being a buyer

### `src/App.jsx`
- `/driver` route now uses `<ProtectedRoute requiredRole="buyer" allowIfDriver>` — both shop owners and registered drivers can access

### `src/pages/DashboardPage.jsx`
- Added `AssignmentChip` component — shows `invited/accepted/rejected` badge alongside booking status
- `BookingRow` extended with `onAssignDriver` prop — "Assign Driver" button appears on `accepted` bookings that have no driver or a rejected driver
- Added `AssignDriverModal` component — fetches available drivers, shows name + vehicle emoji + today's job count, opens conflict warning if ±30-min clash, triggers assignment on select
- Added `assignModal` state and `handleOpenAssignDriver` handler
- Wired `useDriverAssignment()` for `fetchAvailableDrivers` and `assignDriver`

### `src/pages/DriverDashboardPage.jsx`
- Added `useDriverAssignment` import for `respondToAssignment` and `myAssignments`
- Default tab changed from `pickups` to `assignments`
- Added "My Assignments" tab as first tab
- Assignment cards show shop name, material, weight, scheduled time
- Invited assignments: Accept ✓ / Decline buttons; accepted assignments: green "Assigned" label

### `src/i18n/en.js` + `src/i18n/th.js`
- Added 14 keys: `assignDriver`, `assignDriverTitle`, `driverPickupsToday`, `noDriversAvailable`, `conflictWarning`, `assignmentInvited`, `assignmentAccepted`, `assignmentRejected`, `tabMyAssignments`, `noMyAssignments`, `acceptAssignment`, `declineAssignment`

## Validation
- `npm run lint` — clean
- `npm run build` — success (798ms)

## Notes
- Driver registration: a buyer (shop owner) enables `is_driver=true` in their profile, or a standalone driver account registers via the normal flow and an admin/shop owner flips `is_driver=true` in Supabase. UI for self-registration (toggle in Settings/Profile) is a follow-up.
- Vehicle type (`motorcycle | pickup | truck`) is optional metadata for shops to make smarter assignment decisions.
- Conflict check is client-side before the DB write — there is a narrow TOCTOU race if two shops assign the same driver simultaneously; a DB constraint or function can close this gap in a future migration.
- Migration 021 must be applied to remote Supabase before assignment features are functional.
