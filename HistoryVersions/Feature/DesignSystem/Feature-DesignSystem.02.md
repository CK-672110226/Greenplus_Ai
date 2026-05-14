# Feature-DesignSystem.02 — Revert Window Chrome + UX Polish

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Reverted the window chrome redesign (.01) per user feedback. Restored the original neo-brutalist theme (paper/ink tokens, hard shadows, no rounded corners) and applied targeted UX polish to HomePage: better spacing, clearer hierarchy, scan CTA more prominent, quick-link buttons have press effect.

## Reason

User requested: keep the original theme, make it easier to use and more beautiful — not a new design paradigm.

## Changes

### `src/index.css`
- Removed all `.win-*` and `.os-desktop` CSS added in .01

### `src/components/Card.jsx`
- Reverted to original single-variant card (removed `title` prop / title bar logic)

### `src/components/KpiCard.jsx`
- Reverted to original plain card layout

### `src/layouts/UserLayout.jsx`
- Restored original sticky header (paper bg, logo left, controls right)

### `src/layouts/BuyerLayout.jsx`
- Restored original sidebar layout

### `src/pages/HomePage.jsx`
- Kept same structure but with polish:
  - `max-w-lg mx-auto` for comfortable reading width
  - `gap-6` between sections (was `gap-5`)
  - Scan CTA enlarged: icon box with shadow, brand-size label, `py-10`
  - Chart section uses `bg-[var(--paper-2)]` fill for depth
  - Basket item rows use `py-2.5` + `bg-[var(--paper-2)]`
  - Quick-link buttons: added `active:translate` press effect + `shadow-[2px_2px_0]`
  - "more →" text with hover transition
  - Replaced `/prices` (non-existent route) with `/marketplace`

## Validation
- `npm run lint` passes clean
- Run `npm run dev`, navigate to `/home` as user role
