# Feature-RealtimeIsolation.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview
Add `shop_id` filter to the Supabase Realtime subscription in `useRealtimeNotifications` so buyers only receive notifications for bookings directed at their own shop. Also add a SQL migration for a persistent `notifications` table.

## Reason
Without a `filter` clause every buyer received INSERT events for every booking in the system, leaking cross-buyer data and flooding unrelated buyers with notifications.

## Changes

### `src/hooks/useRealtimeNotifications.js`
- Imported `useMyShop` hook.
- Added `shop` from `useMyShop()` to the hook body.
- Changed channel name from `'buyer-bookings'` to `` `buyer-bookings-${shop.id}` `` to prevent channel collisions between buyers.
- Added `filter: \`shop_id=eq.${shop.id}\`` to the `postgres_changes` subscription options.
- Guard updated: subscription only runs when `shop?.id` is available in addition to session and buyer role.
- Added `shop` to the `useEffect` dependency array.

### `supabase/migrations/009_notifications_table.sql`
- Creates `notifications` table: `id`, `user_id`, `type`, `title`, `body`, `read`, `created_at`.
- RLS policies: owner-only read/insert/update/delete.
- Indexes on `user_id` and `(user_id, read)` for fast unread count queries.

## Validation
- Lint passes (`npm run lint`).
- A buyer logged in as Shop A will not receive Realtime events for bookings inserted with `shop_id` of Shop B.

## Notes
- Requires `shop_id` column on `bookings` table (already present per `useSupabaseBookings` join).
- Migration 009 must be run on the Supabase project before notifications persistence is active.
