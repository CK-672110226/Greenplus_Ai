# Feature-ProfilePages.01 History

Date: 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Fixed two issues in `ProfilePage.jsx`: desktop layout constrained to `max-w-sm`, and `BuyerProfile` using a hardcoded local constant instead of Redux state.

## Reason

On desktop, all profile cards rendered as a narrow strip (~384px) in the center of the viewport because every card was capped at `max-w-sm`. Additionally, `BuyerProfile` maintained its own local `useState` copy of accepted materials seeded from a hardcoded `BUYER_ACCEPTED` constant, meaning changes were never persisted to the Redux store or localStorage and were lost on navigation.

## Changes

### `src/pages/ProfilePage.jsx`

- Removed `useState` import (no longer used anywhere in the file).
- Added `useDispatch` to the `react-redux` import.
- Added `import { setAcceptedMaterials } from '../store/buyerSlice'`.
- Removed the `BUYER_ACCEPTED` module-level constant.
- **`UserProfile`**: Replaced the two separate `max-w-sm` wrapper elements with a single `w-full max-w-2xl grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-5 items-start` container. Identity card is the left column; scan history list is the right column. `Card` no longer carries its own `max-w-sm`.
- **`BuyerProfile`**: Replaced `const [accepted, setAccepted] = useState(BUYER_ACCEPTED)` with `useDispatch` + `useSelector(s => s.buyer?.acceptedMaterials ?? [])`. `toggle()` now dispatches `setAcceptedMaterials(next)` instead of calling a local setter. Both cards updated from `max-w-sm` to `max-w-2xl`.
- **`AdminProfile`**: Card updated from `max-w-sm` to `max-w-2xl`.
- **`ProfilePage`** `<h1>`: Replaced `max-w-sm` with `max-w-2xl` so the heading aligns with content.
- `Avatar` `text-[#062040]` intentionally preserved (brand contrast, not a design token).

## Validation

- `npm run lint` — zero errors in `src/`; pre-existing errors in `.claude/helpers/` are unrelated and unchanged.
- Visual: on desktop the identity card and scan history form a two-column layout up to 672px wide instead of a 384px strip.
- Redux: toggling materials in `BuyerProfile` now dispatches to `buyerSlice`, which persists to `localStorage` via the slice's `persist()` helper.

## Notes

- `buyerSlice.setAcceptedMaterials` replaces the full array on each toggle, matching the existing pattern used by `DashboardPage`.
- The `<main>` wrapper class was already `"flex flex-col items-center px-4 py-10 gap-6"` and did not require changes.
