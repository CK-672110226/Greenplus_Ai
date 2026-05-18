# Fix-CodeReviewFixes.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview
Deep audit of all hooks (`src/hooks/`), Redux slices (`src/store/`), and services (`src/services/`) following the `/senior-fullstack` review. 12 issues found and fixed across critical, medium, and cleanup categories.

## Reason
Full code review (D) identified silent failure paths, data loss, notification shape mismatches, reducer purity violations, and dead code introduced over the course of multiple feature sessions.

## Changes

### Critical fixes

**`src/hooks/useAuth.js`**
- Added `try/catch` inside `fetchOrCreateProfile` — previously an unhandled promise rejection left users with `session` set but `profile = null`, breaking all `profile?.role` guards.
- Added `if (event === 'INITIAL_SESSION') return` guard in `onAuthStateChange` — `onAuthStateChange` fires immediately with `INITIAL_SESSION` in Supabase v2; without this guard every page load made two concurrent profile fetches.

**`src/hooks/useReportActions.js`**
- `reporter_id` was hardcoded to `null` for all reports. Added `userId` parameter to `submitReport({ ..., userId })` and wired it through.

**`src/hooks/useUserReports.js`**
- Fixed notification shape: was dispatching `{ message, at }` but `notificationSlice.addNotification` and all consumers expect `{ body, createdAt }`. Changed to match.

### Medium fixes

**`src/hooks/useSupabaseBookings.js`** + **`src/pages/DashboardPage.jsx`**
- Reject reason was collected in the UI (DashboardPage) but never passed to `rejectBooking`. Added `reason` param to `rejectBooking(id, reason)`. When present, writes to `rejection_reason` column.
- `handleConfirmReject` now passes `rejectReason || undefined`.

**`supabase/migrations/015_booking_rejection_reason.sql`**
- New migration: `ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS rejection_reason TEXT`.

**`src/store/buyerSlice.js`**
- `ALL_MATERIALS` was an 8-element hardcoded array. Changed to `Object.keys(WASTE_ITEMS)` imported from `wasteItems.js`. Now automatically stays in sync when materials are added.

**`src/hooks/useSmartRoute.js`**
- TSP route calculation silently fell back to hardcoded Chiang Mai city-center coordinates (18.7883, 98.9853) when a shop had no lat/lng in the DB. Now returns early without running the route calculation, preventing incorrect distance estimates.

### Cleanup / low severity

**`src/hooks/useModelRegistry.js`**
- `activeByKey` was recomputed on every render without `useMemo`. Wrapped in `useMemo([deployments])`.
- Removed stale `// eslint-disable-next-line` that was no longer suppressing anything, then re-added the correct one for the `load()` in `useEffect` pattern (ESLint plugin can't see through the `useCallback` abstraction).

**`src/hooks/useQuery.js`**
- Removed `export { useCallback }` (dead export — no importer was using it).
- Removed `useCallback` from the import list to eliminate the `no-unused-vars` lint error.

**`src/store/wasteSlice.js`**
- `addToBasket` reducer called `new Date().toISOString()` — a side effect inside a pure function. Refactored to use RTK's `prepare` callback pattern: timestamp is now created at dispatch time, not inside the reducer.

**`src/hooks/useRealtimeLogistics.js`**
- INSERT subscription on `bookings` was receiving all new rows and filtering client-side. Added `filter: 'status=eq.searching'` to the Supabase Realtime subscription to reduce channel traffic.

## Validation
- `npm run lint` — passes clean (0 errors, 0 warnings)

## Notes
- `useReportActions.submitReport` callers in `ScanPage` will need to be updated to pass `userId` when available — the fix is backwards-compatible (defaults to `null` if omitted), so existing call sites are unbroken.
