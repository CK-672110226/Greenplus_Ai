# Feature-DesignSystem.01 — Window Chrome UI Redesign

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Redesigned the front-end with a retro OS "window chrome" aesthetic. Every major section now renders inside a panel with a title bar, colored window-control dots (macOS-style: red/yellow/green), and hard box shadows — extending the existing neo-brutalist design language into a desktop OS metaphor.

## Reason

User request: "จัด front-end ใหม่ให้สวยเน้น window เป็นหลัก" — redesign the frontend with windows as the primary visual element.

## Changes

### `src/index.css`
- Added `.win-panel`, `.win-titlebar`, `.win-dots`, `.win-dot`, `.win-dot-red/yellow/green`, `.win-title`, `.win-statusbar` CSS classes for window chrome
- Added `.os-desktop` utility for dotted grid background on layout root

### `src/components/Card.jsx`
- Added optional `title` prop — when provided, renders a full window title bar (dots + centered label) above the card content
- Backwards-compatible: cards without `title` render exactly as before

### `src/components/KpiCard.jsx`
- Replaced plain bordered box with `.win-panel` + `.win-titlebar` using the label as the window title

### `src/components/Logo.jsx`
- Added `invertColor` prop — forces the logo/wordmark into inverse (light-on-dark) mode regardless of theme, used when logo appears inside dark title bars

### `src/layouts/UserLayout.jsx`
- Transformed sticky header into a dark window title bar: dots + centered logo (`invertColor`) + lang/basket controls in `--paper` color
- Outer container uses `.os-desktop` dotted grid background
- Bottom tab bar gains a top shadow for a raised panel feel

### `src/layouts/BuyerLayout.jsx`
- Desktop sidebar becomes an OS panel with `.win-panel` and a title bar showing role label + logo
- Mobile header matches UserLayout window title bar treatment

### `src/pages/HomePage.jsx`
- All page sections (greeting, chart, scan CTA, basket preview, last scan, quick links) wrapped in `.win-panel` with individual title bars and statusbars
- Removed unused `SectionDivider` import

## Validation
- Run `npm run dev` and navigate to `/home` (user role) to verify windowed sections
- Check BuyerLayout on desktop at `/dashboard` for sidebar OS panel
- Verify Logo renders correctly (light text) inside dark title bars

## Notes
- All existing color tokens (`--ink`, `--paper`, `--green`, etc.) unchanged
- Dark mode compatibility maintained — `.win-titlebar` uses `--ink`/`--paper` which auto-invert
- No functional changes to routing, state, or data layer
