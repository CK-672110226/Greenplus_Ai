# Fix-CspLeafletShopsRls.00

**Date:** 22 May 2026 (22 พฤษภาคม 2569)
**PR:** #106 — fix(map): bundle Leaflet marker icons locally to fix CSP violation
**Branch:** fix/leaflet-csp-shops-rls

## Overview

Two unrelated production errors fixed together:

1. **CSP violation** — Leaflet's default marker icon URLs point to `unpkg.com`, blocked by the app's `img-src` Content-Security-Policy. Markers were invisible on the map.
2. **Shops 500 error** — `GET /rest/v1/shops` returned HTTP 500 due to an RLS infinite-recursion loop: the "Admins can update all shops" policy queried `user_profiles`, whose own RLS policy queried back into `shops`.

## Reason

The CSP meta tag added in a prior fix explicitly blocked external CDN image sources. Leaflet's icon loader uses runtime URL construction that bypasses Vite's asset pipeline unless overridden.

The shops RLS policy was the same infinite-recursion pattern previously fixed on `user_profiles` (dropped the recursive admin update policy there in migration 016).

## Changes

### `src/main.jsx`
- Import `marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png` directly from the `leaflet` npm package using Vite's asset pipeline.
- Delete `L.Icon.Default.prototype._getIconUrl` and call `L.Icon.Default.mergeOptions(...)` with the bundled asset URLs so all map markers use local assets with no external requests.

### Supabase migration (applied via MCP)
- `DROP POLICY IF EXISTS "Admins can update all shops" ON public.shops;`
- The existing `"Admins can manage all shops"` ALL policy using `current_user_role()` already covers admin updates without recursion.

## Validation

- Map page: markers now render correctly; no CSP errors in console.
- `GET /rest/v1/shops` returns 200; shop data loads on Dashboard and Map pages.

## Notes

- The recursive policy was identical in structure to the one dropped on `user_profiles` in migration 016. Both relied on a helper that cross-queried the other table.
- No data was lost; the DROP only removes the policy, not any rows.
