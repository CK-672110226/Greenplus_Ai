# Feature-NotificationPersistence.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview
Persist buyer notifications to Supabase so they survive page refresh. Load existing notifications on mount, INSERT to DB on new Realtime event, and sync read/dismiss actions back to the `notifications` table.

## Reason
Notifications were held only in Redux (`notificationSlice.items`) — any page refresh wiped the list. The `notifications` table was created in migration 009 but nothing wrote to or read from it.

## Changes

### `src/store/notificationSlice.js`
- Added `setNotifications` reducer to bulk-hydrate state from DB on load.
- Updated `addNotification` to accept an optional `id` field (Supabase UUID) rather than always generating `Date.now()`. Falls back to `String(Date.now())` if no id is provided.

### `src/hooks/useRealtimeNotifications.js`
- First `useEffect`: on session mount, `SELECT * FROM notifications WHERE user_id = session.user.id` and dispatch `setNotifications` to hydrate Redux. Runs for all authenticated users.
- Second `useEffect` (buyer + shop only): on new Realtime INSERT, immediately INSERTs a row to `notifications` table, gets back the UUID, then dispatches `addNotification` with that UUID so Redux id matches DB id.

### `src/pages/NotificationsPage.jsx`
- Replaced raw `dispatch` prop on `NotifCard` with `onRead` / `onDismiss` callback props.
- `handleRead(id)`: `dispatch(markRead(id))` + `supabase.update({ read: true }).eq('id', id)`.
- `handleDismiss(id)`: `dispatch(dismiss(id))` + `supabase.delete().eq('id', id)`.
- `handleMarkAllRead()`: `dispatch(markAllRead())` + `supabase.update({ read: true }).eq('user_id', session.user.id)`.

## Validation
- Lint passes.
- Buyer receives a booking → notification appears in UI and row appears in `notifications` table.
- Marking read / dismissing updates the DB row.
- On refresh, notifications reload from DB rather than starting empty.

## Notes
- Requires migration 009 to have been applied (notifications table + RLS).
