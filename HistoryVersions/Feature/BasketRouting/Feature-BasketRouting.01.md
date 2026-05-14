# Feature-BasketRouting.01 — Desktop 2-Column Split Layout + Booking Modal

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

---

## Overview

Converted `BasketPage.jsx` from a single-column centered layout into a responsive 2-column grid for desktop. Added an inline `BookingModal` overlay that fires before dispatching `addBooking`, replacing the previous fire-and-forget `handleBook` pattern.

## Reason

The wireframe specifies a side-by-side layout on desktop: basket items on the left (sticky) and the route planner always visible on the right. Previously both panels stacked vertically and the route planner was hidden behind a toggle on all viewport sizes.

## Changes

### `src/pages/BasketPage.jsx`

- **Layout wrapper** — replaced `w-full max-w-sm flex flex-col` with `w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start`.
- **Left column** — `flex flex-col gap-3 md:sticky md:top-4`; contains all basket item cards and the total/clear/GPS card.
- **Right column** — contains two conditional renders of `RoutePlannerPanel`:
  - `hidden md:flex flex-col gap-3` — always visible on desktop.
  - `md:hidden flex flex-col gap-3` — visible on mobile only when `showRoute` is true.
- **Toggle button** — marked `className="md:hidden"` so it only appears on mobile; replaced by a static "Route shown →" label on desktop.
- **Page heading** — widened from `max-w-sm` to `max-w-5xl` to align with the grid.
- **Empty state** — now uses `max-w-5xl` to fill the grid width (no `col-span` needed as it sits outside the grid).
- **`RoutePlannerPanel` component** — extracted from inline JSX into a named inner component to avoid duplicating markup for mobile/desktop renders. Pure presentational; receives `onBook` callback instead of calling `handleBook` directly.
- **`BookingModal` component** — new; renders a fixed overlay with:
  - Mobile: `items-end` (bottom sheet, `mb-6` gap from edge).
  - Desktop: `items-center justify-center` (centered dialog).
  - Card: `max-w-sm`, `border-[2px]`, `shadow-[4px_4px_0_var(--ink)]`, shop name, estimated value (derived from the live `total`), area + distance.
  - "Confirm Booking" dispatches `addBooking` + fires `toast.success` + closes modal.
  - "Cancel" closes without dispatching.
- **`handleBookClick`** — replaces `handleBook`; sets `bookingShop` state to open the modal.
- **`handleConfirmBooking`** — dispatches `addBooking` using the same fields as before, then clears `bookingShop`.
- All existing logic (`computeRoutes`, GPS, skip, remove, weight input, `openMaps`) is unchanged.

## Validation

- `npm run lint` — no errors in `src/`; pre-existing errors in `.claude/helpers/` are unrelated.
- Manual browser verification required at `md:` breakpoint (768 px) to confirm column split and modal behavior.

## Notes

- `estValue` passed to `BookingModal` is the live `total` (sum of active items). This matches what `handleBook` was computing inline.
- The `RoutePlannerPanel` inner component avoids prop-drilling duplication by receiving all required data as props; it returns `null` when `materials.length === 0` so no empty card renders.
- Token usage for this change was minimal — only layout wrappers and new modal component added; no data or business logic modified.
