# Fix-Security.00

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Security audit + QA/frontend polish: removed privilege-escalation vector in LoginPage, fixed label/input a11y, added HTTP security headers, corrected HTML lang, fixed back-navigation after login, removed unimplemented LINE button, moved Google OAuth below the email form.

## Reason

- `LoginPage.jsx` read `?role=admin` from the URL and wrote it directly into the `user_profiles` INSERT — any visitor could navigate to `/login?role=admin` and create an admin account.
- `Field` component had no `htmlFor`/`id` association — screen readers could not link labels to inputs.
- `vercel.json` was missing CSP, HSTS, and Permissions-Policy headers.
- `index.html` declared `lang="en"` for a primarily Thai-language application.
- After login, users were always sent to the role-default destination even if ProtectedRoute had redirected them away from a specific page.
- `doSignIn` auto-switched to signup mode on bad credentials (confusing UX, minor security concern).
- LINE OAuth button was visible but only showed an error toast — removed to avoid misleading users.

## Changes

### `src/pages/LoginPage.jsx`

- **Role sanitization** — `role` is now derived as `['user','buyer'].includes(rawRole) ? rawRole : 'user'`; `?role=admin` silently falls back to `'user'`.
- **Removed `insertProfile()`** — the function and its call in `doSignUp` are deleted. Profile creation is handled by the `handle_new_user` DB trigger (migration 002) and `fetchOrCreateProfile` in `useAuth.js`.
- **`doSignUp` passes `pending_role`** via `options.data` so the DB trigger receives the correct role for email/password signups.
- **`doSignIn` simplified** — no longer auto-switches to signup on bad credentials; shows a clear error message instead.
- **`Field` component** — accepts `id` prop, adds `htmlFor={id}` to the `<label>`; call sites pass `id={emailId}` / `id={passwordId}` (generated with `useId()`).
- **Layout reordered** — email form is now at top; Google OAuth button moved below the submit button (after divider); LINE button removed entirely.
- **Back-navigation** — after login, redirects to `location.state?.from?.pathname` if set (populated by ProtectedRoute); falls back to role-default destination.
- Added `useLocation`, `useId` imports; removed unused `role !== 'admin'` guards.

### `src/components/ProtectedRoute.jsx`

- Now imports `useLocation` and passes `state={{ from: location }}` when redirecting unauthenticated users to `/login`, enabling the back-navigation fix above.

### `vercel.json`

Added three security response headers:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` — allows: `self`, inline scripts (Vite SPA requirement), `wasm-unsafe-eval` (ONNX Runtime), Google Fonts, Supabase (https + wss), Anthropic API, blob workers; blocks all framing via `frame-ancestors 'none'`.

### `index.html`

- Changed `<html lang="en">` → `<html lang="th">` to match the primary language of the application.

## Validation

- `npm run lint` — zero errors
- Role sanitization: visiting `/login?role=admin` now treats the user as role `'user'`
- Field ids: email input id and label htmlFor both resolve to the same `useId()` value
- CSP is broad enough for the current stack (no blocked resources in a clean browser console)

## Notes

- `'unsafe-inline'` in the CSP `script-src` is required for Vite's injected bootstrap script in the production bundle. A nonce-based CSP would require server-side rendering.
- The Anthropic API key stored in `localStorage` (`gp_ai_config`) is accessible to any XSS payload. This is an accepted MVP limitation. Production hardening: proxy Claude calls through a Supabase Edge Function so the key never reaches the browser.
- Admin users can still log in via email/password on the standard login page and are redirected to `/admin` by the `profile.role`-based destination in `useEffect`.
