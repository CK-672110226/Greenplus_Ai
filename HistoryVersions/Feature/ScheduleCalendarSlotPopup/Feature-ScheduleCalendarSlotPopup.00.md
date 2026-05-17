# Feature-ScheduleCalendarSlotPopup.00

**Date:** 17 May 2026 (17 พฤษภาคม 2569)

---

## Overview

Adds two new React components to support the Buyer Dashboard scheduling workflow:
`ScheduleCalendar` (week-view booking grid) and `SlotCreatePopup` (modal for creating a new booking slot).

---

## Reason

Buyer-role users need a visual week-view calendar to see their existing bookings by day/hour and to create new collection slots directly from the grid. These components were not yet built; the Buyer Dashboard previously had no scheduling UI.

---

## Changes

### New files

**`src/components/ScheduleCalendar.jsx`**
- Exports `ScheduleCalendar`.
- CSS grid with `gridTemplateColumns: '46px repeat(7, 1fr)'`; hours 08:00–17:00 (10 rows), row height 38px.
- `getWeekDays(offset)` computes Mon–Sun ISO dates for the given week offset from today.
- Internal `weekOffset` state; prev/next buttons navigate weeks.
- Current day column tinted with `var(--green-soft)`; today header underlined with `var(--green)`.
- Bookings rendered as absolute-positioned colored blocks inside each cell:
  - `pending` → `var(--orange)` / 0.85 opacity
  - `accepted` → `var(--green)` / 0.85 opacity
  - `rejected` → `var(--ink-4)` / 0.55 opacity, line-through text
  - other → `var(--blue)`
- Empty cells are hover-highlighted and call `onSlotCreate(date, hour)` on click.
- Material label truncated to 12 chars; falls back to `totalKg` then `status`.
- Time labels: `font-data` 10px `var(--ink-3)`.
- Props: `bookings[]`, `onSlotCreate(date, hour)`.

**`src/components/SlotCreatePopup.jsx`**
- Exports `SlotCreatePopup`.
- Fixed-inset overlay (`rgba(0,0,0,0.40)`), centered card `max-w-sm`, 1.5px ink border.
- Internal state: `note`, `duration` (default 1), `capacity` (default 50), `loading`.
- `handleCreate` inserts into `bookings` table via Supabase: `shop_id`, `scheduled_date`, `start_hour`, `duration_hours`, `cap_kg`, `status: 'pending'`, `note`. Calls `onCreated(data[0])` and `onClose()` on success; `toast.error` on failure.
- Duration selector: segmented 1h / 2h / 3h toggle buttons.
- Capacity: number input clamped 1–500, focus highlights border with `var(--green)`.
- Note: optional textarea.
- Buttons: Cancel (ghost) + Create slot (primary) using `<Button>` component.
- `formatDisplayDate` renders "Mon 16 May · 09:00" from ISO date + hour.
- Imports: `supabase` from `'../lib/supabase'`, `toast` from `'sonner'`, `Button` from `'./Button'`.

---

## Validation

- Lint: no TypeScript, no JSDoc, no multi-line comment blocks.
- Design tokens: all colors reference `var(--*)` CSS custom properties; no raw hex except `#062040` (dark navy) for booking block text on green/orange backgrounds (matches existing project convention in `Button.jsx` and `BookingModal.jsx`).
- Font classes: `font-brand`, `font-body`, `font-data` used per spec.
- Neo-brutalist borders and shadows applied to card and interactive buttons.
- `<Button>` component reused for modal actions.
- Supabase import path matches project convention (`'../lib/supabase'`).

---

## Notes

- `ScheduleCalendar` does not import Supabase — it is a pure presentational/interaction component; the parent page is responsible for fetching and passing `bookings`.
- The nav label shows both a friendly label ("This week") and the date range for clarity.
- `SlotCreatePopup` note field is omitted from the insert when empty (sent as `null`).
