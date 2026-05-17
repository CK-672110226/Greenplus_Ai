# Feature-ForgotPasswordFlow.01

17 May 2026 (17 พฤษภาคม 2569)

## Overview

Add an inline forgot-password panel directly within the sign-in form, between the
password field and the sign-in button. The panel appears/disappears when the user clicks
"Forgot password?" without switching to a separate page mode.

## Reason

The existing flow (ForgotPasswordFlow.00) navigates to a full-screen `mode === 'forgot'`
view. This revision adds a lighter inline alternative: the user clicks "Forgot password?",
an email input and "Send reset link" button expand in place below the password field, and
on success a green confirmation message replaces the form — all without leaving the sign-in
view. The full-screen forgot/forgot-sent/reset modes from .00 are preserved intact for
the email-link recovery path.

## Changes

### `src/pages/LoginPage.jsx`

- Added five new state variables:
  - `showForgot` (`boolean`) — controls visibility of the inline panel
  - `forgotEmail` (`string`) — email input value for the inline form
  - `forgotSent` (`boolean`) — true after a successful reset-link dispatch
  - `forgotError` (`string|null`) — error message scoped to the inline form
  - `forgotLoading` (`boolean`) — loading state for the inline submit
- Added `handleInlineForgot(e)`: prevents default, calls
  `supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: window.location.origin + '/login' })`;
  sets `forgotSent = true` on success, `forgotError` on failure
- Changed "Forgot password?" button `onClick`: now toggles `showForgot`, resets
  `forgotSent`, `forgotError`, and `forgotEmail` each time it opens — does not change
  `mode` (preserves the existing full-screen forgot flow separately)
- Added inline panel `{showForgot && ...}` rendered between the "Remember me" row and
  the error block / sign-in button:
  - When `forgotSent === false`: renders an email `<input>` (styled
    `border-[1.5px] border-[var(--ink-4)] focus:border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] w-full px-3 py-2 outline-none`)
    and a "Send reset link" submit button; optional `forgotError` shown in the
    `border-[1.5px] border-[var(--orange)] font-data text-[12px] uppercase tracking-widest px-3 py-2` pattern
  - When `forgotSent === true`: renders a `<p>` with
    `font-data text-[11px] text-[var(--green-ink)] uppercase tracking-widest` reading
    "Check your email for a reset link"

## Validation

- `npx eslint src/pages/LoginPage.jsx` — zero errors
- Inline flow: sign-in view → click "Forgot password?" → email input + button expand →
  enter email → submit → green "Check your email for a reset link" appears; clicking
  "Forgot password?" again resets the panel to the email input
- Full-screen flow from .00 (mode === 'forgot' / 'forgot-sent' / 'reset') remains
  unchanged and still functions for the email recovery redirect path

## Notes

- The inline form uses `forgotEmail` (separate state from the main `email` field) so
  the sign-in form value is not disturbed
- Error state is scoped to `forgotError`; the main form `error` is untouched
- `redirectTo` matches the existing full-screen flow: `window.location.origin + '/login'`
