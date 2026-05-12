# Feature-AuthRoles.01

**Date:** 12 May 2026 (12 พฤษภาคม 2569)

## Overview
Added Google OAuth sign-in to the existing email/password login flow (U-15, M2).

## Reason
Users prefer social login over managing a separate password. Google OAuth reduces friction for new users and eliminates password-reset support burden.

## Changes

### `src/i18n/en.js`
- Added `signInWithGoogle: 'Sign in with Google'`
- Added `orDivider: 'or'`

### `src/i18n/th.js`
- Added `signInWithGoogle: 'เข้าสู่ระบบด้วย Google'`
- Added `orDivider: 'หรือ'`

### `src/hooks/useAuth.js`
- Renamed `fetchProfile` → `fetchOrCreateProfile`, now accepts full `user` object
- If no `user_profiles` row exists (new Google user): creates one automatically using role from `localStorage.gp_pending_role` (fallback `'user'`) and `display_name` from `user.user_metadata.full_name`
- Clears `gp_pending_role` from localStorage after use

### `src/pages/LoginPage.jsx`
- Added `useSelector` to watch `session` + `profile` from Redux
- Added `useEffect` → auto-navigates to `ROLE_DEST[profile.role]` once both are set (handles OAuth redirect and email/password login)
- Removed direct `navigate()` call from `handleSubmit` (unified via effect)
- Added `handleGoogleSignIn`: stores role to `localStorage`, calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Added Google sign-in button with official G logo (inline SVG, no external dependency)
- Added `or` divider between Google button and email/password form

## Validation
- [ ] Email/password sign-in → navigates to correct role destination
- [ ] Email/password sign-up → creates profile, navigates correctly
- [ ] Google sign-in (existing user) → navigates to correct role destination
- [ ] Google sign-in (new user) → creates profile with correct role and display_name
- [ ] Error shown if login fails
- [ ] Thai/English labels render correctly

## Notes
- Requires Google OAuth provider enabled in Supabase dashboard — see PRD Section 13 for setup steps
- `window.location.origin` as `redirectTo` works for both localhost and production
