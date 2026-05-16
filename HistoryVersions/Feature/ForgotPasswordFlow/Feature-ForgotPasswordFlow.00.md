# Feature-ForgotPasswordFlow.00

16 May 2026 (16 พฤษภาคม 2569)

## Overview

Implement the full forgot-password and password-reset flow entirely within LoginPage.
Adds three new UI modes: `forgot` (enter email), `forgot-sent` (link sent confirmation),
and `reset` (set new password after clicking the email link).

## Reason

The "Forgot password?" button on LoginPage had no handler — clicking it did nothing.
Users who forgot their password had no recovery path. The Supabase email template for
password reset was also already created (Feature-SupabaseEmailTemplates.00) but had no
app-side handler to use it.

## Changes

### `src/pages/LoginPage.jsx`

- Added `toast` import from `sonner` for success notification after password update
- Added state: `newPassword`, `confirmPass`, `showNewPass`, `showConfirmPass`,
  `recoverySession`
- Added `useId` hooks: `newPassId`, `confirmPassId`
- Modified redirect `useEffect`: added `!recoverySession` guard so the page does not
  auto-navigate away when Supabase delivers a `PASSWORD_RECOVERY` session
- Added new `useEffect`: subscribes to `supabase.auth.onAuthStateChange`; when event
  is `PASSWORD_RECOVERY`, sets `recoverySession = true` and switches mode to `'reset'`;
  cleans up subscription on unmount
- Added `handleForgotPassword(e)`: calls
  `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/login' })`,
  switches mode to `'forgot-sent'` on success
- Added `handleSetNewPassword(e)`: validates length (≥ 6) and match, calls
  `supabase.auth.updateUser({ password: newPassword })`, shows success toast, resets to
  `'signin'` mode
- Wired "Forgot password?" button `onClick`: switches to `'forgot'` mode, clears error
  and unverified state
- Gated `unverified` banner and signin/signup form: only rendered when
  `mode === 'signin' || mode === 'signup'`
- Added three new UI sections:
  - `mode === 'forgot'`: email field + "Send reset link" button + back link
  - `mode === 'forgot-sent'`: green success card with email address, resend link,
    back link
  - `mode === 'reset'`: new-password + confirm-password fields each with eye toggle,
    4-segment strength bar, "Set new password →" submit button

### `src/i18n/en.js`

Added 16 new keys under the Login section: `forgotPassword`, `resetPassword`,
`resetPasswordSub`, `sendResetLink`, `checkInbox`, `resetLinkSent`, `didntReceive`,
`resendLink`, `setNewPassword`, `setNewPasswordSub`, `newPassword`,
`confirmNewPassword`, `passwordMismatch`, `passwordTooShort`, `passwordUpdated`,
`backToSignIn`

### `src/i18n/th.js`

Same 16 keys added with Thai translations.

## Validation

- `npm run lint` — zero errors
- Forgot flow: click "Forgot password?" → email form appears → enter email → submit →
  green "Check your inbox" card appears with the email address shown
- Reset flow: click link in branded reset-password email → lands on `/login` →
  `PASSWORD_RECOVERY` event fires → reset form appears → enter matching passwords →
  submit → success toast → redirected to signin view
- Validation: passwords < 6 chars shows "Password must be at least 6 characters";
  mismatched passwords shows "Passwords do not match"

## Notes

- The `onAuthStateChange` subscription is set up once on mount and cleaned up on
  unmount, so it does not interfere with normal sign-in events
- `redirectTo` in `resetPasswordForEmail` points to `/login` (same page) so the
  recovery event fires on the login page itself — no separate route needed
- The strength bar uses four segments: orange when length < 10, green when ≥ 10
- `supabase.auth.updateUser` requires an active recovery session; Supabase enforces
  this server-side — no extra guard needed in the client
