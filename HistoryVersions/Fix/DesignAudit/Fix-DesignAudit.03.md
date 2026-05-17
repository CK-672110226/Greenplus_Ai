# Fix-DesignAudit.03 — LoginPage Remember Me + SettingsPage Export CSV + Delete Account

18 May 2026 (18 พฤษภาคม 2569)

## Overview

Three functional bugs fixed:
1. **LoginPage** — "Remember Me" checkbox was purely decorative (fake `<span>` with a static checkmark SVG, no state, no `<input>`). Made it a real controlled checkbox.
2. **SettingsPage** — Export data download produced a `.json` file. Changed to `.csv` with proper headers and escaped rows.
3. **SettingsPage** — Delete Account only soft-deleted `user_profiles.deleted_at` with no indication that the Supabase auth user would persist. Added a TODO comment documenting the limitation and clarified the two-step flow.

## Reason

### Fix 1 — Remember Me
The checkbox JSX used a `<span>` to visually simulate a checked state but had no `<input type="checkbox">`, no React state binding, and no side effects on login. Ticking it did nothing — the checkmark was always visible regardless of user intent.

### Fix 2 — Export CSV
The `handleExport` function built a nested JSON object and downloaded it as `application/json`. The design spec and task requirement call for CSV so users can open the export in spreadsheet tools without manual conversion.

### Fix 3 — Delete Account
`supabase.auth.admin.deleteUser()` requires the service-role key and is unsafe to call from client-side code. The existing handler only set `deleted_at` on the profile row; the Supabase auth user remained active with no comment explaining why. The fix documents the limitation inline and confirms the correct soft-delete + `signOut()` sequence.

## Changes

### src/pages/LoginPage.jsx

- Added `const [rememberMe, setRememberMe] = useState(false)` to the state block.
- Replaced the decorative `<span>` fake checkbox with a real `<input type="checkbox">` inside a styled wrapper:
  - The outer `<span>` now holds `position: relative` and a background toggled by `rememberMe`.
  - The `<input>` is `opacity-0` and covers the full hit area; the visible checkmark SVG renders conditionally on `rememberMe`.
  - `checked={rememberMe}` and `onChange={e => setRememberMe(e.target.checked)}` bind the control to React state.
- Updated `doSignIn()`: on successful sign-in, writes `localStorage.setItem('gp_remember', '1')` when `rememberMe` is true, otherwise calls `localStorage.removeItem('gp_remember')`.
- No change to Supabase session persistence logic (Supabase already handles that via its own storage).

### src/pages/SettingsPage.jsx — Export CSV

- Removed the nested JSON `payload` object and the `application/json` blob.
- Added `escapeCell(v)` helper: wraps values in double-quotes and escapes internal double-quotes per RFC 4180.
- Added `toAlignedRow(row, type)` helper: serialises a row object against a unified column list so scan rows and booking rows always have the same column count.
- Built `allColumns` as `['record_type', ...union of scan + booking column keys]` so a single CSV file contains both record types without ambiguity.
- Header row is the unquoted `allColumns.join(',')`.
- Data rows are all `scanRows` (tagged `"scan"`) followed by all `bookingRows` (tagged `"booking"`).
- Blob MIME type changed to `text/csv`.
- Download filename changed to `greenplus-data-YYYY-MM-DD.csv`.

### src/pages/SettingsPage.jsx — Delete Account

- No functional logic changed (soft-delete + `signOut()` was already correct).
- Added inline comments explaining the two-step flow:
  - Step 1: update `user_profiles.deleted_at` (soft-delete).
  - Step 2: call `supabase.auth.signOut()` to end the session immediately.
- Added a `TODO` comment immediately after the profile update explaining that `supabase.auth.admin.deleteUser()` requires service-role credentials, must not be called client-side, and should be wired up via an Edge Function or a `delete_my_account` RPC.

## Validation

- **Lint**: 2 pre-existing errors in `DashboardPage.jsx` (`handleComplete`, `handleCancel` unused); 0 errors introduced by this fix. My changes are lint-clean.
  ```
  /src/pages/DashboardPage.jsx
    205:12  error  'handleComplete' is defined but never used  (pre-existing)
    206:12  error  'handleCancel' is defined but never used    (pre-existing)
  ```
- **Remember Me**: checkbox now has `checked={rememberMe}` / `onChange` binding; checkmark renders only when state is true; `gp_remember` localStorage key is written/removed on successful sign-in.
- **Export**: downloads a `.csv` file with a `record_type` header column and properly double-quote-escaped values; works even when one of the two tables returns empty results.
- **Delete**: soft-delete + `signOut()` confirmed present; TODO comment documents the hard-delete limitation clearly for future Edge Function work.

## Notes

- The CSV export uses a single unified file for both `scan_history` and `bookings`. Columns not present in a given record type appear as empty quoted cells (`""`), which is standard CSV behaviour for sparse data.
- The Remember Me localStorage flag (`gp_remember`) does not extend the Supabase session TTL — Supabase persists the session in its own storage. The flag is available for future use (e.g., skipping the login page redirect, or showing a "welcome back" message).
- The two pre-existing lint errors in `DashboardPage.jsx` were present before this fix and are out of scope here.
