# Feature-SupabaseEmailTemplates.00

16 May 2026 (16 พฤษภาคม 2569)

## Overview

Create branded HTML email templates for all Supabase Auth emails so users receive
GreenPlus AI design instead of the default Supabase logo and text. Also provide a
step-by-step dashboard setup guide.

## Reason

Supabase sends plain default emails (Supabase logo, generic text) for signup
confirmation, password reset, magic link, and email change. Users were clicking
confirmation links and landing on a generic Supabase-branded page with no connection
to GreenPlus AI.

Root causes:
1. No custom email templates set in Supabase Dashboard → Auth → Email Templates
2. Site URL and redirect URLs not configured in URL Configuration
3. No `emailRedirectTo` passed in `signUp()` options

## Changes

### `supabase/email-templates/confirm-signup.html` (new file)

Branded HTML email for new-user email verification. Green button, GreenPlus AI
wordmark, bilingual EN/TH text, flat-shadow card in project design system.

### `supabase/email-templates/reset-password.html` (new file)

Branded HTML email for password reset. Orange button (warning colour from design
system), 1-hour expiry notice, bilingual text.

### `supabase/email-templates/change-email.html` (new file)

Branded HTML email for email-address change confirmation. Green button, security
warning note, bilingual text.

### `supabase/email-templates/magic-link.html` (new file)

Branded HTML email for magic-link sign-in. Green button, 1-hour expiry, bilingual
text.

### `supabase/email-templates/SETUP.md` (new file)

Step-by-step guide covering:
- Setting Site URL and Redirect URLs in Supabase Dashboard
- Where to paste each template (exact dashboard path)
- Recommended subject lines per template
- How to add `emailRedirectTo` in `LoginPage.jsx` for post-confirmation redirect
- How to optionally swap text logo for hosted PNG once deployed

### `src/pages/LoginPage.jsx` — note only, no code change

The `signUp()` call can accept `options.emailRedirectTo` to control where users land
after clicking the confirmation link. Current value `window.location.origin` is
acceptable. Developers can change to `${window.location.origin}/home` if a specific
post-confirm destination is wanted.

## Validation

- Open each `.html` file in a browser — card, button, and bilingual text should render
  correctly with green button and black flat shadow
- Paste `confirm-signup.html` into Supabase Dashboard → Auth → Email Templates →
  Confirm signup → click Save → register a test account → verify branded email arrives
- Click the confirmation link → verify it redirects back to the app, not to a
  Supabase-branded page

## Notes

- Templates use system fonts (Arial/Helvetica) because web fonts (Google Fonts) are
  unreliable in email clients, especially Outlook
- Logo uses a CSS/text "G+" circle rather than the `public/Lightmode.png` image
  because the image URL depends on a stable deployed domain; comment in SETUP.md
  explains how to swap once the domain is confirmed
- All `{{ .ConfirmationURL }}` placeholders are Supabase Go-template variables — they
  must remain exactly as written; do not URL-encode or modify them
