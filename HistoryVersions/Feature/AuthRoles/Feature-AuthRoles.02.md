# Feature-AuthRoles.02 — Login System Overhaul

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview
Fixed critical login system issues: removed duplicate Google OAuth button (merge artifact), added email verification error handling with resend flow, and completely separated admin login from the public-facing landing page.

## Reason
- Two `handleGoogle` functions and two Google Sign-In buttons existed in LoginPage.jsx due to a merge conflict resolution error.
- Email verification failures showed a generic Supabase error instead of a user-friendly prompt with a resend option.
- Admin login card was visible on the landing page, creating a security UX issue — admin access should require typing a hidden URL directly.

## Changes

### `src/pages/LoginPage.jsx`
- Removed duplicate `handleGoogle` / second Google button (was rendered twice)
- Consolidated into single `handleGoogleSignIn` with correct `redirectTo: window.location.origin`
- Added `unverified` state; detects "email not confirmed" in Supabase error message
- Added `handleResendVerification` calling `supabase.auth.resend({ type: 'signup', email })`
- Shows bordered orange panel with `t.emailNotVerified` message and resend button when unverified
- Google Sign-In button hidden when `role === 'admin'`

### `src/pages/AdminLoginPage.jsx` (NEW)
- Hidden admin-only login page at `/x/admin` (not linked from anywhere)
- Email + password form only — no Google OAuth
- Dark ink background to visually distinguish from public pages
- Derives `wrongRole` flag from Redux session/profile at render time (avoids `setState` in effect lint error)
- Calls `supabase.auth.signOut()` in effect if non-admin account signs in; displays "This account does not have admin access." from derived state

### `src/pages/LandingPage.jsx`
- Removed Admin role card from the role selector grid
- Grid changed from `sm:grid-cols-3` (implicit) to explicit `sm:grid-cols-2` — only User and Buyer shown

### `src/App.jsx`
- Added `import { AdminLoginPage }` and `<Route path="/x/admin" element={<AdminLoginPage />} />`

### `src/i18n/en.js` + `src/i18n/th.js`
- Added `emailNotVerified` key: prompt user to check inbox
- Added `resendVerification` key: button label for resend action

### `WORKPLAN.md` (NEW)
- Comprehensive task division: user tasks S-01–S-08 (Supabase/Google Console) vs Claude tasks C-01–C-14 (code)
- Architecture specs for upcoming milestones

## Validation
- `npm run lint` — 0 errors, 0 warnings
- `npm run build` — 174 modules, no errors (CSS import order warning is pre-existing)
- Manual checklist:
  - [ ] Landing shows only User + Buyer cards
  - [ ] `/x/admin` renders dark admin login form
  - [ ] Non-admin account at `/x/admin` triggers sign-out + error message
  - [ ] Email/password login with unverified email shows resend panel
  - [ ] Google button not rendered on admin role
  - [ ] Admin account at `/x/admin` redirects to `/admin`

## Notes
- `WORKPLAN.md` is a living document; update as tasks are completed.
- S-01 (disable email confirmation in Supabase dashboard) is optional but simplifies dev; resend flow handles the case when it stays enabled.
