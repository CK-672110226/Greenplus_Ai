# Feature-MapTreeRouting.01 History

Date: 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Added `buyerSlice` Redux slice with localStorage persistence, wired it into the store, and created the reusable `BookingModal` component for booking confirmation.

## Reason

The map/routing feature requires a persistent buyer configuration (which days the shop is open, which materials it accepts) so that the routing engine can filter shops correctly at runtime. The `BookingModal` component is needed to present a clear confirmation step before a booking is dispatched.

## Changes

### `src/store/buyerSlice.js` — NEW
- Created `buyerSlice` with initial state `{ openDays, acceptedMaterials }`.
- Defaults: `openDays = [1,2,3,4,5,6]`, `acceptedMaterials` = all 8 WASTE_ITEMS keys.
- `loadFromStorage()` reads and validates `localStorage['buyer_settings']` on slice creation; falls back to defaults on parse error or missing key.
- `persist(state)` serialises current state back to localStorage after every reducer; errors (private mode / quota) are silently caught.
- Reducers: `setOpenDays`, `toggleMaterial` (add/remove single key), `setAcceptedMaterials`.
- Exports named action creators and default reducer.

### `src/store/index.js` — UPDATED
- Added `import buyerReducer from './buyerSlice'`.
- Registered `buyer: buyerReducer` in the store's reducer map.

### `src/components/BookingModal.jsx` — NEW
- Fixed overlay: `fixed inset-0 z-50 bg-[#1A1A1Ae6]` with bottom-sheet on mobile (`items-end`), centered dialog on desktop (`md:items-center`).
- Card: `max-w-sm`, `border-[2px] border-[var(--ink)]`, `shadow-[4px_4px_0_var(--ink)]`.
- Renders shop name (`font-brand text-[20px]`) + area/distance chip (`font-data text-[11px] text-[var(--ink-3)]`).
- Booking summary list: shows `localName`, weight, unit price per item, and per-item value using `pricePerKg` / `localName` from `../data/wasteItems`.
- Filters out `item.skipped === true` basket entries before rendering and computing totals.
- Total: `font-brand text-[22px] text-[var(--green)]`.
- Two action buttons using the shared `<Button>` component: primary Confirm (disabled when basket empty) + secondary Cancel.
- Backdrop click dismisses modal; inner card click stops propagation.
- Bilingual labels driven by `language` prop (`'th'` | `'en'`).
- `onConfirm(shop)` called then `onClose()` automatically when user confirms.

## Validation

- ESLint: no new lint errors introduced (no TypeScript, no test runner per CLAUDE.md).
- Manual browser check: import chain resolves — `wasteItems.js` exports `pricePerKg` and `localName` as named exports; `Button.jsx` is a named export.
- localStorage persistence: slice reads on init, writes after every dispatch.

## Notes

- No commit performed; user reviews before committing per project memory rules.
- `persist()` is called inline inside each reducer (Immer draft is serialisable at that point via `JSON.stringify`). This is intentional — avoids adding Redux middleware for a simple persistence case.
