# Fix-DataLayerLogin.00

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

Extracted all Supabase auth calls from `LoginPage.jsx` into a new `useAuthActions` hook. LoginPage had 9 direct `supabase.auth.*` calls across 7 handler functions, making it know too much about the data layer.

## Reason

Architecture audit identified data layer leakage as the top priority issue. Pages calling Supabase directly bind UI components to the DB client, making it harder to test handlers in isolation and harder to swap auth implementations.

## Changes

### `src/hooks/useAuthActions.js` — NEW
Encapsulates all Supabase auth operations:
- `signIn(email, password, rememberMe)` — email/password signin + remember-me localStorage
- `signUp(email, password, role)` — signup with auto-signin on "already registered"
- `signInWithGoogle(role)` — OAuth with pending role storage
- `sendPasswordReset(email)` — reset link via email
- `resendVerification(email)` — resend signup confirmation
- `updatePassword(newPassword)` — password update during recovery session
- `subscribeToRecovery(onRecovery)` — stable `useCallback`-wrapped subscription to PASSWORD_RECOVERY auth event

### `src/pages/LoginPage.jsx` — UPDATED
- Removed `import { supabase }` — no longer touches the DB client
- Added `import { useAuthActions }` + `const auth = useAuthActions()`
- `doSignUp` / `doSignIn`: replaced raw Supabase calls with `auth.signUp` / `auth.signIn`
- `handleResendVerification`, `handleGoogleSignIn`, `handleForgotPassword`, `handleInlineForgot`, `handleSetNewPassword`: each replaced with corresponding `auth.*` call
- `useEffect` for PASSWORD_RECOVERY: now uses `auth.subscribeToRecovery(cb)` instead of inline `supabase.auth.onAuthStateChange`

## Validation

- `grep "supabase" src/pages/LoginPage.jsx` returns empty — confirmed no remaining direct calls
- `npm run lint` passes with no errors

## Notes

This is the first of ~8 pages identified in the data layer leakage audit. Next candidates: SchedulePage (3 calls), NotificationsPage (3 calls), SettingsPage (2 calls), AdminPage (2 calls).
