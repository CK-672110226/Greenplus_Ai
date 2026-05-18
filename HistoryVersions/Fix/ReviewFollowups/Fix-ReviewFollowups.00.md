# Fix-ReviewFollowups.00 — Review Follow-ups: Smoke CI, Memoized Helpers, Chat Deep-link

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

Three follow-up fixes identified in the post-session code review of PRs #58–#62.

## Reason

1. **No runtime smoke test in CI** — The PR #61 blank-screen crash (redux-persist `storage.getItem is not a function`) passed lint and build but crashed the app at runtime. A headless smoke check on `/` and `/login` would have caught it before merge.
2. **`marketPrice`/`shopPrice` not memoized** — Both helpers were plain functions defined in the hook body, creating new references on every render. Any consumer using them as effect deps or props would re-render unnecessarily.
3. **Chat deep-link `mobileView` init from async state** — `useState(() => activeRoomId ? 'thread' : 'rooms')` read `activeRoomId` from `useChat()`, which is populated asynchronously after Supabase loads rooms. A user landing on `/chat/:roomId` would briefly see the room list before the hook resolved. Fix: read from `useParams()` which is synchronous and available at mount.

## Changes

### e2e/tests/00-smoke.spec.js (new file)

- 7 smoke tests covering `/` and `/login`:
  - No uncaught JS errors (`pageerror` event) on either page
  - `#root` element renders non-empty content
  - Hero headline visible on landing
  - Email input visible on login
  - `/home` unauthenticated redirects (no blank screen, no crash)
- Designed to run fast (~5s) as a CI gate.

### .github/workflows/pr.yml

- Added `smoke` job (Stage 3) that runs after `build`.
- Installs only Chromium (not all browsers) to keep install fast.
- Runs `e2e/tests/00-smoke.spec.js` only — full suite is opt-in locally.
- Passes `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN` secrets (required for dev server to start without the Supabase guard throwing).
- Uploads Playwright HTML report as artifact on failure (7-day retention).

### src/hooks/useMarketPricing.js

- `marketPrice(materialType)` and `shopPrice(shopId, materialType)` wrapped in `useCallback`.
- `marketPrice` depends on `[pricing]`; `shopPrice` depends on `[shopPricing]`.
- Both are derived from the `useMemo` aggregation, so they only get new references when the underlying data changes.

### src/pages/ChatPage.jsx

- Import `useParams` from `react-router-dom`.
- Extract `routeRoomId` from `useParams()` at component top.
- `mobileView` lazy initializer now reads `routeRoomId` (URL param, synchronous) instead of `activeRoomId` (hook state, async).
- Users navigating directly to `/chat/:roomId` now correctly land in thread view immediately.

## Validation

- `npm run lint` — 0 errors.
- `npm run build` — clean.
- `npx playwright test e2e/tests/00-smoke.spec.js --project=chromium` — 7 passed in 5.4s.
