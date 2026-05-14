# Feature-DesignSystem.03 — Desktop-First Layout Redesign

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Converted the User portal from mobile-first to desktop-first layout while retaining the existing neo-brutalist design language (paper/ink tokens, hard shadows, no rounded corners). Added a persistent left sidebar on desktop and a 2-column homepage grid.

## Reason

User requested desktop-first design that is easy to use and visually polished. The previous layout used `max-w-lg` mobile-constrained columns and a bottom tab bar that was wasted on desktop screens.

## Changes

### `src/layouts/UserLayout.jsx`
- Added `<aside>` desktop sidebar (w-56, sticky, full height) with logo, vertical SideLink nav, and footer controls (language toggle + version label). Hidden on mobile via `hidden lg:flex`.
- Added desktop topbar (`hidden lg:flex`) with platform tagline and basket button — shown only on `lg+`.
- Mobile topbar now has `lg:hidden` to be hidden on desktop.
- Bottom tab nav wrapped with `lg:hidden` so it only appears on mobile.
- Extracted `navItems` array to share between `SideLink` (desktop) and `Tab` (mobile) without duplication.
- Active SideLink uses green background + paper text for clear visual state.

### `src/pages/HomePage.jsx`
- Root container changed from `flex flex-col max-w-lg mx-auto` to `grid lg:grid-cols-[1fr_340px]` two-column layout.
- **Left column**: greeting banner (larger text on desktop: `lg:text-[42px]`), weekly chart (wider `viewBox` with value labels above bars, dimmed non-max bars), quick-access grid (2 cols mobile → 4 cols desktop).
- **Right column**: KPI cards in a 2-cell borderless grid (separated by ink border), scan CTA card, active basket items (up to 4), last scan result, empty state placeholder.
- Bar chart improvements: highlighted peak bar with green hatch, dimmed others with ink-4, added value labels above each bar.
- Sections separated by `border-b-[1.5px] border-[var(--ink)]` dividers for clean scannable structure.

## Validation

- Mobile layout unchanged: bottom tab nav + single column content still works at < lg breakpoint.
- Desktop: sidebar + 2-column page layout fills screen width without artificial max-width cap.
- All existing Redux selectors, routes, and i18n hooks unchanged.

## Notes

- No new dependencies added.
- `SideLink` active state uses bg-green (matches brand) rather than underline to be clearly visible in sidebar context.
- `hatch-home-dim` pattern added to chart for visual hierarchy (peak bar highlighted).
