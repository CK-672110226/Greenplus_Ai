# Fix-ReregisterSoftDelete.00

**Date:** 22 May 2026 (22 พฤษภาคม 2569)
**PR:** #105 — fix(auth): restore account on re-login after soft-delete
**Branch:** fix/reregister-deleted-account

## Overview

Fixed a bug where users who had previously deleted their account (soft-delete — `deleted_at` set in `user_profiles`) could not sign back in with the same Google account. The Supabase Auth user record still existed, so OAuth login succeeded, but `fetchOrCreateProfile` found `deleted_at != null` and immediately signed the user out, making it impossible to re-register.

## Reason

Soft-delete only sets `deleted_at`; it does not remove the Supabase Auth user. A returning user who re-authenticates via Google should be treated as account restoration, not a banned login.

## Changes

### `src/hooks/useAuth.js`
- In `fetchOrCreateProfile`, when `deleted_at` is found on the existing profile, instead of signing out, update the row: clear `deleted_at`, restore `role` (from `gp_pending_role` in localStorage or the previous role), then dispatch `setProfile` / `setLanguage` / `setOpenDays` / `setAcceptedMaterials` exactly as a fresh login would.
- The "force sign out on deleted account" path is fully removed.

## Validation

- Tested manually: delete account → sign out → sign back in with same Google account → account is restored, correct role applied, app navigates normally.
- Unit tests: not applicable (hook depends on Supabase auth lifecycle).

## Notes

- Only affects soft-deleted accounts where the Supabase Auth user still exists.
- `gp_pending_role` is cleared from localStorage after restoration (same as first-time OAuth flow).
