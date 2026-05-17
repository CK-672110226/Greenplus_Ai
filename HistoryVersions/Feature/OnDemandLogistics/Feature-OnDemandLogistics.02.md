# Feature-OnDemandLogistics.02

17 May 2026 (17 พฤษภาคม 2569)

---

## Overview

M9 Logistics additions: admin rider-assignment panel in AdminPage and star-rating UI in UserTrackingPanel. Also fixes a pre-existing lint error (setState called synchronously inside useEffect) in the heatmap fetch block.

---

## Reason

M9 requires two logistics-facing features:
1. Admins need a UI to assign available riders to accepted bookings that have no `rider_id` yet, transitioning them to `in_transit`.
2. Sellers need to rate their rider after a delivery is completed. Ratings are stored on the `bookings.rider_rating` column so they can inform future matching.

---

## Changes (file-by-file)

### `src/pages/AdminPage.jsx`

- Added `RiderAssignmentPanel` component (above `AdminPage` export):
  - Parallel-fetches `bookings` (status=accepted, rider_id IS NULL) and `user_profiles` (role=rider) on mount.
  - Renders a list of unassigned bookings; each row has a rider `<select>` and an "Assign" button.
  - `handleAssign` writes `{ rider_id, status: 'in_transit' }` to Supabase then removes the row from local state.
  - Shows skeleton while loading, empty state when all bookings are assigned, and a no-riders warning if no rider profiles exist.
- Added "Logistics" tab button to the tab bar (between Moderation and AI Studio).
- Added `{tab === 'logistics'}` render block that mounts `<RiderAssignmentPanel />`.
- Fixed pre-existing lint error: the heatmap `useEffect` was calling `setHeatmapLoading(true)` synchronously inside the effect body. Refactored to an inner `async function fetchHeatmap()` pattern so all setState calls happen inside the async callback, satisfying `react-hooks/set-state-in-effect`.

### `src/components/UserTrackingPanel.jsx`

- Added `import { useState }` (was missing; component previously had no local state).
- Added `StarRating({ value, onChange })` helper component: renders five `★` buttons; filled stars use `var(--green-ink)`, empty stars use `var(--ink-4)`.
- Added `ratingValue` and `ratingSubmitted` local state to `UserTrackingPanel`.
- Updated the `status === 'completed'` render branch:
  - Shows `<StarRating>` only when `booking.rider_rating == null && !ratingSubmitted`.
  - `handleRatingChange(star)` writes `{ rider_rating: star }` to `bookings` then sets `ratingSubmitted = true` and shows a success toast.
  - After rating is saved (or if already rated from DB), shows a static star display with filled/empty unicode stars.

---

## Validation

- `npm run lint` passes with zero errors and zero warnings after fix.
- No TypeScript; no new dependencies introduced.
- Design tokens used throughout: `--ink`, `--ink-3`, `--ink-4`, `--paper`, `--paper-2`, `--green`, `--green-ink`, `--green-soft`, `--orange`. No raw hex values.
- Font classes: `font-data`, `font-body`, `font-brand`. All labels uppercase + `tracking-widest`.
- State mutation is immutable (functional updaters used for all `setUnassigned`, `setAssignments`, `setRatingValue`).

---

## Notes

- `bookings.rider_id` and `bookings.rider_rating` columns must exist in the DB schema (added in logistics migrations). If they do not exist, Supabase will return a column-not-found error and the feature will degrade gracefully (toast.error shown).
- The `in_transit` status value is added here; the existing booking status machine (from `.00`) supports it implicitly. If the DB CHECK constraint only lists `pending | accepted | rejected | completed | searching | arrived | cancelled`, the constraint must be extended to include `in_transit` before this assignment feature can write to production.
- Rider rating is one-way: once submitted it replaces the null value. A future revision can add an edit flow.
