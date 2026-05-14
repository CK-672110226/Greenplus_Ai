# Feature-PageDesign.04

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

UI/UX audit fix pass: Button style/className forwarding, Card interactive accessibility, AdminLoginPage input focus states.

## Reason

- `Button.jsx` did not forward `style` or `className` props — all `style={{ height: 48, fontSize: 18 }}` calls across LoginPage, LandingPage, AdminLoginPage were silently dropped
- `Card.jsx` with `onClick` had no `cursor-pointer`, no keyboard support, no ARIA role — interactive cards were inaccessible
- `AdminLoginPage.jsx` inputs had `outline-none` with no focus replacement — keyboard users had zero focus visibility

## Changes

### `src/components/Button.jsx`
- Added `style`, `className`, `...rest` prop forwarding
- Added `cursor-pointer` to base class list
- Added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2`
- Added `disabled:opacity-50 disabled:cursor-not-allowed`

### `src/components/Card.jsx`
- When `onClick` prop is present: adds `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space trigger), `cursor-pointer`, and `focus-visible:ring-2` focus ring
- When `onClick` is absent: no extra attributes (static card, no role pollution)

### `src/pages/AdminLoginPage.jsx`
- Email input: replaced bare `outline-none` with `outline-none focus:ring-2 focus:ring-[#4ade80] focus:ring-offset-2 focus:ring-offset-[#0e1013]`
- Password input: same focus ring treatment, ring color matches dark theme green

## Validation

- `npm run lint` — zero errors expected
- Button `style={{ height: 48 }}` now correctly applies 48px height on LandingPage and LoginPage CTAs
- Tab-navigating to a Card with onClick now shows visible green ring
- Tab-navigating to AdminLoginPage inputs now shows visible green ring against dark background
