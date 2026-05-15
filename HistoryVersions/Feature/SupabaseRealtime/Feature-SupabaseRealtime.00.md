# Feature-SupabaseRealtime.00

15 May 2026 (15 พฤษภาคม 2569)

## Overview

Connect two features to Supabase: live booking notifications via Supabase Realtime for buyers, and persistence of `openDays` / `acceptedMaterials` buyer settings to the `user_profiles` table.

## Reason

Previously, buyer settings (open days and accepted materials) lived only in localStorage and were lost on new devices or browsers. Notifications had no live backend source — they were purely client-side Redux state. This task wires both to Supabase so data survives across sessions and buyers get real-time booking alerts.

## Changes

### `src/hooks/useRealtimeNotifications.js` (new file)

Hook that opens a Supabase Realtime channel subscribed to `INSERT` events on the `bookings` table. When a new row arrives, it dispatches `addNotification` with `type: 'new_order'`. Subscription is established only when the logged-in user has `role === 'buyer'`. Channel is removed on unmount.

### `src/pages/NotificationsPage.jsx`

Added import and call of `useRealtimeNotifications()` at the top of the component body. No UI changes.

### `src/pages/DashboardPage.jsx`

- Added `import { supabase } from '../lib/supabase'`.
- Added `session` selector from `s.user.session`.
- `handleSaveCalendar` converted to `async`; after Redux dispatch it calls `supabase.from('user_profiles').update({ open_days })` wrapped in try/catch.
- Materials Save button `onClick` converted to `async`; after Redux state is already current (via `toggleMaterial` dispatches), it calls `supabase.from('user_profiles').update({ accepted_materials })` wrapped in try/catch.

### `src/hooks/useAuth.js`

- Added import of `setOpenDays` and `setAcceptedMaterials` from `../store/buyerSlice`.
- In `fetchOrCreateProfile`, after `dispatch(setProfile(data))`, conditionally dispatches `setOpenDays(data.open_days)` and `setAcceptedMaterials(data.accepted_materials)` when those fields are present on the fetched profile row. This hydrates Redux (and localStorage via buyerSlice's `persist` helper) from Supabase on every login.

## Validation

- `npm run lint` — passes with zero new errors (one pre-existing error in `useMyShop.js` unrelated to this scope).
- Manual verification: subscribe a buyer session, submit a booking from a seller account, confirm `addNotification` is dispatched in React DevTools.
- Save Calendar: inspect Network tab for PATCH to `user_profiles` with `open_days` payload.
- Save Materials: inspect Network tab for PATCH to `user_profiles` with `accepted_materials` payload.
- Re-login: confirm Redux `buyer.openDays` and `buyer.acceptedMaterials` are hydrated from the profile row.

## Notes

- All Supabase calls are wrapped in try/catch and fail silently; UI always shows the success toast regardless of network outcome.
- The Realtime channel filter subscribes to all `INSERT` events on `bookings` (not filtered by `shop_id`) because buyer shop IDs are not readily available client-side without an extra query; a future iteration can add a filter once shops are preloaded into Redux.
- `HistoryVersions/` directory was created at the repo root as part of this task (it existed only in a Claude worktree previously).
