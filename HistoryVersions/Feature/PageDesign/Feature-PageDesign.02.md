# Feature-PageDesign.02

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Full wireframe fidelity pass: Logo wordmark with Ai superscript, LandingPage hero redesign, LoginPage wireframe order (OAuth first, eye icon, remember me), AdminLoginPage dark restricted style.

## Reason

- User identified that many design details were diluted vs the wireframe
- Logo missing wordmark text ("GreenPlus" + small Ai superscript) in all nav positions
- LandingPage was minimal; wireframe shows a full hero with stats bar and rich role cards
- LoginPage had wrong order (email form before OAuth) and missing password eye icon and "Remember me"
- AdminLoginPage was generic; wireframe shows a dark-themed restricted admin console

## Changes

### `src/components/Logo.jsx`
- Added `LogoWordmark` export: renders "Green" (ink) + "Plus" (green-ink) + "Ai" superscript (mono, 26% font size, 65% opacity)
- Updated `Logo` to show mark (PNG) + wordmark text side by side by default (`showWordmark=true`)
- Font size auto-scales: `max(11, Math.round(height * 0.6))`
- Gap auto-scales: `max(6, Math.round(height * 0.28))`

### `src/pages/LandingPage.jsx` — full rewrite
- Top nav bar: Logo + nav links (How it works, Pricing, For buyers) + language toggle
- Hero two-column layout on md+: left = copy, right = role chooser
- Pilot chip with pulsing green dot
- H1: "Scan trash. Earn cash. Recycle smarter." with green accent line
- Two CTA buttons at 48px height (wireframe spec)
- Stats bar: 12,480 kg / ฿286k / 340+ buyers (bordered grid)
- Role cards: icon box + title + description + feature chips + arrow, accent green for recycler
- Footer: v0.4 · pre-launch + support email
- Redirect logic preserved

### `src/pages/LoginPage.jsx` — rewrite
- Logo mark + LogoWordmark at top
- "SIGN IN" label + "Welcome back — continue as {role}" heading
- Role badge chip (color matches role: green for user, ink for buyer)
- OAuth buttons FIRST (Google + LINE for user, Google for buyer)
- SectionDivider "or with email"
- Email input with placeholder
- Password input with eye toggle (show/hide, EyeIcon SVG)
- "Remember me" row (auto-checked visually) + "Forgot password?" link
- Submit button 48px "Sign in → /home" or "Create account →"
- "No account? Sign up free · takes 30s" toggle

### `src/pages/AdminLoginPage.jsx` — rewrite
- Dark theme: `#0e1013` background
- "RESTRICTED" pill badge (red text/border) + "/x/admin" route label + "internal only" chip
- Dark input fields (`#1f2226` bg, `#3a3d42` border)
- Password field with eye toggle
- "Auto sign-out if role ≠ admin. All sessions logged for 90 days."
- "Authenticate →" primary button
- Footer: build #428 + "← back to public site" link

### `src/layouts/UserLayout.jsx`
- Added `showWordmark` to `<Logo>` call so wordmark appears in TopBar

## Validation

- `npm run lint` — zero errors
- All pages preserved auth logic (Supabase calls, smart auto-switch sign in/up)
- AdminLoginPage preserved wrong-role auto-signout

## Notes

- `LogoWordmark` is now exported separately so LoginPage can use it in a stacked layout
- "Remember me" is purely visual (auto-checked); persistent sessions are handled by Supabase's `persistSession: true` default
- LINE login button shows in user role only; fires toast "coming soon" until LINE OAuth is configured
