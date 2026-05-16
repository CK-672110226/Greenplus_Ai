# Feature-AdminDataPersistence.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview
Wire the Admin Panel's Shop Approval and Moderation tabs to Supabase. Pending shops now load from the DB; approve/reject write `shops.status`. Marketplace moderation loads all posts from DB; flag/unflag and remove write to `marketplace_posts`.

## Reason
- **Shop approval**: the Shops tab always showed "No pending shops" because `pending` state was initialised as `[]` and never fetched from Supabase. Approve/reject buttons only filtered local state.
- **Moderation**: flag/unflag dispatched to Redux (lost on refresh); posts came from Redux which was only populated after visiting MarketplacePage. The `marketplace_posts` table had no `flagged` column.

## Changes

### `supabase/migrations/010_marketplace_flagged.sql` (new)
- `ALTER TABLE marketplace_posts ADD COLUMN IF NOT EXISTS flagged boolean NOT NULL DEFAULT false`.
- Partial index on `flagged = true` for fast admin queries.

### `src/pages/AdminPage.jsx`
- Added `useEffect` and `supabase` imports; removed unused `removePost`, `flagPost` Redux imports.
- **Shop approval**: `useEffect` fetches `shops WHERE status='pending'` with owner join (`owner:owner_id(display_name)`) on mount.
  - `handleApprove(id)`: `supabase.update({ status: 'active' })` → removes from local `pending` state.
  - `handleRejectShop(id)`: `supabase.update({ status: 'rejected' })` → removes from local `pending` state.
  - Shop card owner label now reads `s.owner?.display_name` from the join.
- **Moderation**: added `modPosts` / `modLoading` local state; `useEffect` fetches all non-removed `marketplace_posts` on mount.
  - `handleFlag(post)`: `supabase.update({ flagged: !post.flagged })` → updates local `modPosts`.
  - `handleRemovePost(id)`: `supabase.update({ status: 'removed' })` → filters out from local `modPosts`.
  - Moderation tab now uses `modPosts` instead of `useSelector(s => s.marketplace.posts)`.
- Removed `dispatch` call from `AdminPage` (only `ModelRegistrySection` still uses `useDispatch`).

### `src/hooks/useSupabaseMarketplace.js`
- `flagged` mapping changed from hardcoded `false` to `p.flagged ?? false` to reflect the new DB column.

## Validation
- Lint passes.
- Admin visits Shops tab → sees real pending shops from DB.
- Clicking Approve → `shops.status` becomes `'active'`; shop disappears from pending list.
- Admin visits Moderation tab → sees all active/flagged posts from DB.
- Clicking Flag → `marketplace_posts.flagged` toggles in DB; border turns orange.
- Clicking Remove → `marketplace_posts.status` becomes `'removed'`; card disappears.

## Notes
- Requires migration 010 to be applied before flag/unflag will work.
- Admin RLS policy on `marketplace_posts` (from 002_rls_hardening) already allows admins to UPDATE rows.
