# Fix-RemoveDeadShopsData.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Deleted `src/data/shops.js` — a static array of hardcoded shop records that was never imported by any page or component. All shop data is fetched from Supabase `public.shops` via `useShops()`.

## Reason

Mock/static data policy: ห้ามมี mock data. The file exported `SHOPS = [...]` with hardcoded lat/lng, names, and accepted materials for ~8 shops. It was previously used before `useShops()` was implemented. After the real Supabase hook was added, the file was never cleaned up.

## Changes

- Deleted `src/data/shops.js`

## Validation

- `npm run lint` — 0 errors (file was not imported anywhere)
- `npm run build` — ✓ 205 modules, clean

## Remaining mock data notes

The following are known stubs (not mock data, but incomplete features):
- `AdminPage.jsx` — training progress simulation (real ML training is M10 work)
- `EcoPointsPage.jsx` — Redeem button → toast `'Feature coming in M10'` (rewards table not yet created)
