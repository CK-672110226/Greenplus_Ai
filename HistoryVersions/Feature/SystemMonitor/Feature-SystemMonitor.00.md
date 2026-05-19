# Feature-SystemMonitor.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview
Admin system-health monitor: live presence tracking for all users (shops, buyers, drivers, regular users) with a 5-rule anomaly detection engine. Admins see who is online now, which shops are open/closed, driver availability, and a flagged feed of suspicious booking patterns.

## Reason
No way for admins to observe platform health in real time: impossible to see if shops had stopped accepting orders, which users were active, whether drivers were online, or if unusual booking patterns (spam, ghost orders, high cancellations) were occurring.

## Changes

### `supabase/migrations/022_user_last_seen.sql`
- Adds `last_seen TIMESTAMPTZ DEFAULT now()` to `user_profiles`
- Index on `last_seen DESC` for fast "online in last N minutes" queries
- RLS UPDATE policy so each user can write their own `last_seen`

### `src/hooks/usePresence.js`
- NEW: fires a `last_seen` ping on mount and then every 2 minutes for any logged-in user
- Mounted in `AuthInitializer` in `App.jsx` — covers all roles automatically

### `src/App.jsx`
- Imports and calls `usePresence()` inside `AuthInitializer` so presence is global

### `src/hooks/useSystemMonitor.js`
- NEW admin hook with auto-refresh every 30 seconds
- `shopStatus` — `{ open, closed, list }` from `shops` table
- `userActivity` — `{ online, total, list }` from `user_profiles WHERE role='user'`, "online" = `last_seen` within 5 min
- `driverStatus` — `{ online, total, list }` from profiles where `is_driver=true OR role='buyer'`, "online" = `is_online=true`
- `anomalies[]` — 5 detection rules:
  1. **Rapid booking**: same user >3 bookings in 1 hour → severity HIGH
  2. **Weight outlier**: single booking weight >100 kg → severity MEDIUM
  3. **High cancellation**: same user >2 cancellations in 24 h → severity MEDIUM
  4. **Ghost on-demand**: on-demand booking with null `pickup_lat` → severity LOW
  5. **Stale group**: `booking_group` past `expires_at` still in `searching` → severity LOW
- Returns `onlineThresholdMs` constant so callers avoid calling `Date.now()` during render

### `src/pages/AdminPage.jsx`
- Imports `useSystemMonitor`
- "Monitor" tab added as **first** tab with `⚠ N` badge when anomalies exist
- Monitor tab layout:
  - Header row with last-refresh timestamp + manual Refresh button
  - 4-cell KPI grid: Shops open, Shops closed, Users online, Drivers online
  - Anomaly feed: severity badge (HIGH/MED/LOW) + type label + description per flag
  - Empty state when no anomalies
  - Shop list: name + open/closed chip
  - Active users list (most-recently-seen first, max 20): name + last-seen time + green/grey dot
  - Drivers list: name + online dot

### `src/i18n/en.js` + `src/i18n/th.js`
- Added 22 keys: `monitorTab`, `monitorRefresh`, `monitorRefreshedAt`, `monitorShopsOpen`, `monitorShopsClosed`, `monitorUsersOnline`, `monitorDriversOnline`, `monitorAnomalies`, `monitorNoAnomalies`, `monitorSevHigh/Medium/Low`, `monitorTypeRapid/Weight/Cancel/Ghost/Stale`, `monitorShopsSection`, `monitorUsersSection`, `monitorDriversSection`, `monitorOnline`, `monitorOffline`, `monitorNeverSeen`

## Validation
- `npm run lint` — clean
- `npm run build` — success (759ms)

## Notes
- Anomaly thresholds (ONLINE_WINDOW_MIN=5, WEIGHT_OUTLIER_KG=100, RAPID_BOOKING_N=3, CANCEL_THRESHOLD=2) are constants at the top of `useSystemMonitor.js` — easy to tune.
- The `last_seen` approach relies on the client sending heartbeats; if a user closes the app without logging out, they show offline within ~5 min automatically.
- Supabase Realtime Presence could replace polling in a future iteration for sub-second accuracy, but the 30-second poll is sufficient for an admin dashboard.
- Migration 022 must be applied to remote Supabase before presence tracking works.
