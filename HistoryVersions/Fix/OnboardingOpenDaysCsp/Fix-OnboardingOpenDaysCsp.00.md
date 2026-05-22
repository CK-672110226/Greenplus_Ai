# Fix-OnboardingOpenDaysCsp.00

**Date:** 22 May 2026 (22 พฤษภาคม 2569)

## Overview

Three bugs discovered via browser console and Supabase API logs:

1. **`open_days` type mismatch** — `BuyerOnboardingPage` stored day selections as string abbreviations (`'Mon'`, `'Tue'`, …) but `user_profiles.open_days` is `integer[]` (0=Sun … 6=Sat). This caused a 400 Bad Request on every "Finish setup" submit.
2. **Duplicate shops on retry** — Because the PATCH to `user_profiles` failed each time, `setSaving(false)` re-enabled the "Finish" button and the user could re-click. The `shops` upsert had no `onConflict` target and no UNIQUE constraint on `owner_id`, so every click created a new shop row (3 identical pending shops confirmed in DB).
3. **Leaflet CSP violation in LocationPicker** — `LocationPicker.jsx` still loaded marker images from `https://unpkg.com/leaflet@…/dist/images/`, which is blocked by the `img-src` CSP. `MapPage.jsx` had already been fixed but `LocationPicker` was missed.

## Reason

- The `open_days` mismatch was introduced when the onboarding UI used human-readable day labels without a conversion step.
- The `shops` UNIQUE constraint was never added to the initial migration, and the upsert call did not specify a conflict target.
- The Leaflet CSP fix from Fix/CspLeafletShopsRls only patched `MapPage.jsx`, not the `LocationPicker` component used in `BuyerOnboardingPage`.

## Changes

### `src/components/LocationPicker.jsx`
- Removed `delete L.Icon.Default.prototype._getIconUrl` (not needed with bundled imports)
- Replaced three `unpkg.com` CDN strings with Vite-bundled imports from `leaflet/dist/images/`

### `src/pages/BuyerOnboardingPage.jsx`
- Added `DAY_TO_INT` constant mapping string day abbreviations to 0–6 integers
- `open_days` in the `saveOnboarding` call now maps through `DAY_TO_INT` before sending to Supabase

### `src/hooks/useOnboardingActions.js`
- Added `{ onConflict: 'owner_id' }` to the `shops.upsert()` call so retries update rather than insert

### `supabase/migrations/20260522170000_shops_owner_unique.sql`
- Deduplicates existing `shops` rows (keeps oldest per `owner_id`, deletes later duplicates)
- Adds `UNIQUE(owner_id)` constraint to `public.shops`

## Validation

- Migration applied to remote; 2 duplicate shops deleted, constraint added
- `useOnboardingActions` upsert now idempotent on re-submit
- LocationPicker no longer references unpkg (CSP violation gone)
- `open_days` integer array round-trips correctly through Redux `buyerSlice` (already used integers)

## Notes

- The 3 x 400 errors also caused `usePresence` to be suspected, but logs confirmed the failures were from `saveOnboarding` not the heartbeat.
- `HistoryVersions/README.md` updated with this scope.
