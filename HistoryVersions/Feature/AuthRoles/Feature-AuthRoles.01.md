# Feature-AuthRoles.01

**Date:** 12 May 2026 (12 พฤษภาคม 2569)

## Overview
Added Google OAuth sign-in to the existing email/password login flow.

## Reason
Users (especially students and expats) prefer social login over managing a separate password. Google OAuth also eliminates password-reset support burden and reduces friction for new users.

## Changes

### `PRD.md`
- Added U-15 (Google OAuth sign-in, Must Have)
- Updated M2 milestone description to include Google OAuth
- Added Section 13 "Google OAuth Setup Guide" with step-by-step instructions for Google Cloud Console, Supabase dashboard, redirect URL allow-list, and how the app handles new Google users

### `src/i18n/en.js`
- Added `signInWithGoogle: 'Sign in with Google'`
- Added `orDivider: 'or'`

### `src/i18n/th.js`
- Added `signInWithGoogle: 'เข้าสู่ระบบด้วย Google'`
- Added `orDivider: 'หรือ'`

### `src/hooks/useAuth.js`
- Renamed `fetchProfile` → `fetchOrCreateProfile`, now accepts full `user` object
- If no `user_profiles` row exists (new Google user), creates one automatically using:
  - `role` from `localStorage.gp_pending_role` (set before OAuth redirect), fallback `'user'`
  - `display_name` from `user.user_metadata.full_name` (Google provides this)
- Clears `gp_pending_role` from localStorage after use

### `src/pages/LoginPage.jsx`
- Added `handleGoogleSignIn` function: stores role to localStorage, calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Added Google sign-in button with official Google G logo (inline SVG)
- Added "or" divider between Google button and email/password form
- Added `useSelector` + `useEffect` to auto-navigate to the correct dashboard (`profile.role → ROLE_DEST`) once session and profile are both available — handles both OAuth redirect and email/password login
- Removed direct `navigate()` call from `handleSubmit` (navigation now unified via the effect)

## Validation
- [ ] Email/password sign-in → navigates to correct role destination
- [ ] Email/password sign-up → creates profile, navigates correctly
- [ ] Google sign-in (existing user) → navigates to correct role destination
- [ ] Google sign-in (new user) → creates profile with correct role and display_name, navigates correctly
- [ ] Error message shown if OAuth or email login fails
- [ ] Language toggle works (Thai/English labels on Google button and divider)

## Notes
- Requires Google OAuth provider to be enabled in Supabase dashboard (see PRD Section 13)
- `window.location.origin` is used as `redirectTo` — works for both `localhost:5173` and production domain without additional env vars
