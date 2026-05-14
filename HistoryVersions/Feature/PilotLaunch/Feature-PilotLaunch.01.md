# Feature-PilotLaunch.01

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Senior backend hardening: fixed RLS infinite recursion, added missing INSERT policy, added performance indexes, added `handle_new_user` trigger, fixed missing financial columns in scan_history inserts, and stopped unnecessary profile re-fetches on token refresh.

## Reason

- Admin RLS policies queried `user_profiles` from within a `user_profiles` policy → infinite recursion in PostgreSQL's policy evaluation; Supabase silently errors
- No INSERT policy on `user_profiles` → email/password signups could not create their own profile row (RLS rejected the insert; `useAuth.js` silently failed)
- No performance indexes → `scan_history`, `marketplace_posts`, `bookings` queries do full sequential scans; catastrophic at scale
- No `handle_new_user` database trigger → race condition where the browser calls `fetchOrCreateProfile` before the profile row exists
- `useScanInsert.js` never wrote `price_per_kg` or `calculated_value` → all scan history rows have NULL for financial fields
- `useAuth.js` called `fetchOrCreateProfile` on every `TOKEN_REFRESHED` event (every ~5 min) → ~12 unnecessary Supabase reads per user per hour
- No upgrade path from 'user' → 'buyer' role when the DB trigger fires before the JS insertion

## Changes

### `supabase/migrations/002_rls_hardening.sql` (NEW)

1. **`current_user_role()` security definer function** — reads caller's role from `user_profiles` bypassing RLS; eliminates recursion in admin policies

2. **Recreated admin policies** using `current_user_role()`:
   - `user_profiles`: "Admins can read all profiles" + new "Admins can update any profile"
   - `shops`: "Admins can manage all shops"
   - `marketplace_posts`: "Admins can remove posts"

3. **Added INSERT policy** on `user_profiles`:
   - `"Users can insert own profile"` with `with check (auth.uid() = id)`

4. **Performance indexes**:
   - `idx_scan_history_user_id` — filter by user
   - `idx_scan_history_user_scanned` — user + scanned_at DESC (for history page)
   - `idx_marketplace_posts_status` — partial index on `status = 'active'`
   - `idx_bookings_seller_id` / `idx_bookings_shop_id`
   - `idx_eco_point_ledger_user` — user + created_at DESC
   - `idx_shops_status` — partial index on `status = 'active'` (map page)
   - `idx_shop_pricing_shop_id`

5. **`handle_new_user()` trigger** on `auth.users` (after insert):
   - Creates `user_profiles` row atomically when a new auth user is created
   - Accepts `pending_role` from `raw_user_meta_data` (sanitized: only 'user'/'buyer', never 'admin')
   - `on conflict (id) do nothing` — safe if profile already exists

### `src/hooks/useScanInsert.js`
- Added `pricePerKg` import from `wasteItems`
- Now inserts `price_per_kg` and `calculated_value` on every scan write
- `weight_kg` and `confidence` now explicitly set to `null` when not present (not `undefined`)

### `src/hooks/useAuth.js`
- `onAuthStateChange` now switches on `event` type:
  - `SIGNED_IN` → fetch profile
  - `TOKEN_REFRESHED` → update session only (no profile re-fetch)
  - `SIGNED_OUT` → clear user
  - `INITIAL_SESSION` → handled by `getSession()` above, skipped here
- `fetchOrCreateProfile` now checks for `gp_pending_role === 'buyer'` and upgrades an existing `user` profile to `buyer` via UPDATE (handles trigger-first scenario)
- INSERT fallback sanitizes role: only 'user' or 'buyer' can be set from client; 'admin' always falls back to 'user'

## Validation

- `npm run lint` — zero errors
- SQL runs cleanly on a fresh Supabase project after 001_init.sql
- `on conflict (id) do nothing` in trigger prevents duplicate profile errors

## Notes

Run order in Supabase SQL Editor:
1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_rls_hardening.sql`

To set admin role for existing users, run (as service_role / in SQL Editor):
```sql
UPDATE public.user_profiles SET role = 'admin' WHERE id = '<uuid>';
```

`eco_point_ledger` INSERT is intentionally server-side only (no public INSERT policy). Points are awarded via Supabase Edge Function (planned for M11 production hardening).
