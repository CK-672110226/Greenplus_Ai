# Fix-Architecture.01 — Fullstack DX Improvements: Loading Skeleton, useQuery Hook, Dark-mode Side-effect Fix

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

Second pass of architecture improvements following Fix-Architecture.00. Focuses on DX quality-of-life fixes that affect every cold-load render and every async data-fetch in the app: a meaningful loading state in SmartLayout, a shared `useQuery` hook that eliminates boilerplate across data-fetching hooks, and a fix to the anti-pattern of writing localStorage from inside a Redux reducer.

## Reason

- `SmartLayout` was returning `null` while session/profile resolved — users on slow connections saw a blank screen for 1–3 seconds on every page load.
- Twelve data-fetching hooks each hand-rolled their own `useState` loading/error pattern. Any change to that pattern (cancellation, error shape, initial state) had to be applied in twelve places.
- `userSlice.toggleDarkMode` called `localStorage.setItem` directly inside a Redux reducer. Reducers must be pure; side effects in reducers break time-travel debugging and violate Redux's contract.

## Changes

### src/layouts/SmartLayout.jsx
- Replaced `return null` during the loading/profile-pending state with a full `<AppSkeleton />` component.
- `AppSkeleton` renders a dark-themed shimmer layout matching the app chrome: topbar bar, shimmer content lines, and a bottom nav placeholder (mobile only).
- Uses only CSS `animate-pulse` and design-token variables (`--paper`, `--paper-2`, `--ink-4`) — no new dependencies.

### src/hooks/useQuery.js (new file)
- Generic async data-fetching hook: `useQuery(queryFn)` → `{ data, loading, error }`.
- Uses `useReducer` with three action types (`PENDING` / `SUCCESS` / `ERROR`) to avoid the `react-hooks/set-state-in-effect` ESLint rule that fires when `setState` is called synchronously at the top of an `useEffect` body.
- Cancellation via closure flag (`cancelled = true` in cleanup) prevents stale dispatches on unmount.
- Re-exports `useCallback` so callers can import both from one place.
- Callers must wrap their fetch function in `useCallback` with a literal dependency array (ESLint `react-hooks/use-memo` requires literal arrays — no variable deps).

### src/hooks/useShops.js
- Migrated from hand-rolled `useState` pattern to `useQuery`.
- `fetchShops` wrapped in `useCallback(fn, [])` — no deps since it only reads from Supabase with no external variables.

### src/hooks/useMyShop.js
- Migrated to `useQuery`.
- `fetchShop` depends on `userId` from Redux; `useCallback(fn, [userId])` ensures re-fetch when user changes.
- Early return (`if (!userId) return null`) prevents a Supabase query before auth is ready.

### src/hooks/useMarketPricing.js
- Migrated to `useQuery`.
- Aggregation logic (average price-per-kg per material type) moved into `useMemo` so it only recomputes when `rows` changes.
- Exposes `marketPrice(materialType)` and `shopPrice(shopId, materialType)` helper functions.

### src/store/userSlice.js
- Removed `localStorage.setItem('gp_dark', ...)` from the `toggleDarkMode` reducer body.
- Reducer is now pure.

### src/App.jsx
- Added `localStorage.setItem('gp_dark', darkMode ? '1' : '0')` to the existing `useEffect` that syncs `darkMode` state to `document.documentElement.classList`.
- Single effect now handles both DOM mutation and storage write — both are side effects that belong outside Redux.

## Validation

- `npm run lint` — 0 errors, 0 warnings.
- `npm run build` — clean build, 1838 modules transformed, no new errors.
- Manual check: SmartLayout shimmer visible on cold load before session resolves.
- `useQuery` hook works for `useShops`, `useMyShop`, `useMarketPricing` — all return correct `{ data, loading, error }` shapes.

## Notes

- The `useCallback` literal-array requirement means callers cannot pass a deps variable — this is enforced by ESLint `react-hooks/use-memo` and is correct behaviour.
- `useQuery` does not support pagination, polling, or mutation — it is intentionally minimal. Extend if needed, but avoid premature abstraction.
- 9 other data-fetching hooks still use the hand-rolled pattern and can be migrated in a follow-up pass.
