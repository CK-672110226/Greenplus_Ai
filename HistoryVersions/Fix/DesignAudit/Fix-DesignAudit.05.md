# Fix-DesignAudit.05 — DashboardPage Accepted Booking Actions

18 May 2026 (18 พฤษภาคม 2569)

## Overview

Added COMPLETE and CANCEL action buttons for accepted bookings in the buyer dashboard.

## Reason

`BookingRow` only rendered Accept/Reject buttons for `status === 'pending'` bookings. Once a
booking moved to `accepted`, the buyer had no way to progress it further — no path to mark
it complete or cancel it from the UI.

## Changes

### src/hooks/useSupabaseBookings.js
- Added `completeBooking(id)` callback: calls `supabase.from('bookings').update({ status: 'completed' })` then optimistically updates local state — same pattern as `acceptBooking`/`rejectBooking`.
- Added `cancelBooking(id)` callback: same pattern, sets `status: 'cancelled'`.
- Both added to the return object: `{ bookings, loading, acceptBooking, rejectBooking, completeBooking, cancelBooking }`.

### src/pages/DashboardPage.jsx
- Destructured `completeBooking` and `cancelBooking` from `useSupabaseBookings()`.
- Added `handleComplete(id)` and `handleCancel(id)` handler functions alongside the existing `handleAccept`/`handleReject`; they call the hook methods and show a toast.
- Extended `BookingRow` props signature to accept `onComplete` and `onCancel`.
- Added an `else if (b.status === 'accepted')` rendering block inside `BookingRow` that shows:
  - **COMPLETE** button: `border 1.5px solid var(--green)`, `color var(--green)`, `background var(--paper)`, hover → `var(--green-soft)`. Uppercase, `font-family var(--font-data)`, no border-radius.
  - **CANCEL** button: `border 1.5px solid var(--ink-2)`, `color var(--ink-2)`, `background var(--paper)`. Same typography rules. No hover style change.
- Passed `onComplete={handleComplete}` and `onCancel={handleCancel}` into every `<BookingRow>` rendered in the bookings list.

## Validation

- Lint: 2 pre-existing errors in `AdminPage.jsx` (`ModelRegistrySection` unused, `AiStudioTab` not defined). These existed before this fix and are unrelated. Zero new errors introduced by this change.
- Accepted bookings now show COMPLETE + CANCEL buttons below the booking details row.
- Clicking COMPLETE dispatches `supabase update status: 'completed'` and shows a success toast.
- Clicking CANCEL dispatches `supabase update status: 'cancelled'` and shows an error-style toast.

## Notes

Dispatch is done directly via the Supabase client inside the `useSupabaseBookings` hook rather than through a Redux thunk. The `bookingSlice.updateStatus` action is not used here because `useSupabaseBookings` manages its own local state and syncs Redux via `dispatch(setBookings(bookings))` in the `useEffect` inside `DashboardPage`. This mirrors the exact pattern used by `acceptBooking` and `rejectBooking`.
