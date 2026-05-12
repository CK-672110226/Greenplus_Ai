# Feature-DesignSystem.00

**Date:** 12 May 2026 (12 พฤษภาคม 2569)

---

## Overview

Replaced Vite default styles with the Mono-Logic Minimalist v0 design system specified in PRD §5. Installed Tailwind CSS v4 via the Vite plugin, defined all CSS design tokens, imported Google Fonts, and created the base component library (Button, Card, GradeTag, NavBar, ProtectedRoute).

## Reason

The repository had the default Vite scaffold styles. PRD Milestone M1 requires a complete design system — CSS tokens, typography, and component library — before any feature page can be built.

## Changes

### `vite.config.js`
- Added `@tailwindcss/vite` plugin alongside existing `@vitejs/plugin-react`

### `src/index.css`
- Replaced all Vite defaults with PRD §5 design tokens
- `@import "tailwindcss"` — Tailwind v4 CSS-first entry
- Google Fonts URL import: Architects Daughter, Caveat, JetBrains Mono, Sarabun, IBM Plex Sans Thai, Mitr
- `@theme` block: `--font-brand`, `--font-body`, `--font-data` utility classes; `--color-paper`, `--color-ink`, `--color-green`, `--color-orange`
- `:root` block: full token set (`--ink`, `--ink-2`, `--ink-3`, `--ink-4`, `--paper`, `--paper-2`, `--green`, `--green-soft`, `--green-ink`, `--orange`, `--blue`)

### `src/App.css`
- Cleared Vite scaffold styles

### `src/components/Button.jsx` (new)
- Variants: primary (`--green` fill), secondary (`--paper` fill), ghost
- Design system rule: 1.5px border + 2px flat offset shadow; no blur/drop shadow

### `src/components/Card.jsx` (new)
- `--paper-2` background, 1.5px border, 2px flat shadow
- onClick prop for interactive cards

### `src/components/GradeTag.jsx` (new)
- Grade A (`#22C55E` / `#062040`), B (`#FFF3A8` / `#5A4A1A`), C (`#FFFFFF` / `#7A7A7A`) per PRD §4

### `src/components/NavBar.jsx` (new)
- Role-aware navigation links (user/buyer/admin)
- Language toggle (TH/EN) dispatches to Redux
- Sign-in link / sign-out button

### `src/components/ProtectedRoute.jsx` (new)
- Redirects unauthenticated users to `/login`
- Role-mismatch redirects to `/`
- Renders null during auth loading state

## Validation

- `npm run dev` starts without errors
- Design tokens visible in browser `:root`
- Google Fonts load in Network tab
- All base components render with correct Mono-Logic Minimalist styling

## Notes

- Tailwind v4 uses CSS-first config — no `tailwind.config.js` required
- Font utilities `font-brand`, `font-body`, `font-data` are generated from `@theme --font-*` entries
- Color tokens defined in both `@theme` (Tailwind utilities) and `:root` (for `var()` in JSX)
