# Feature-MapTreeRouting.02

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Added a responsive desktop left sidebar to `UserLayout`. On screens 768 px and wider the sidebar replaces both the TopBar and BottomTabBar with a persistent 220 px fixed left column; on mobile everything is unchanged.

## Reason

The PRD specifies a fixed left sidebar for desktop viewports (≥ 768 px). Previously `BottomTabBar` rendered on all screen sizes, producing a cramped, mobile-only navigation pattern on wide screens.

## Changes

### `src/layouts/UserLayout.jsx`

- **Added `SidebarLink` component** — horizontal NavLink (icon + label) that mirrors the active/hover styles of `Tab` but laid out in a row. Badge support included for the basket count.
- **Outer wrapper** — changed from `flex flex-col` to `flex flex-col md:flex-row` so the sidebar and main content sit side-by-side on desktop.
- **Desktop `<aside>`** — `hidden md:flex md:flex-col md:fixed` panel, 220 px wide, full viewport height, `z-40`, using `--paper` background and `--ink` right border. Contains: Logo button (navigates to `/home`), vertical `<nav>` with five `SidebarLink` items, language toggle at the bottom.
- **TopBar `<header>`** — added `md:hidden` so it only renders on mobile.
- **`<main>`** — class updated to `flex-1 pb-[68px] md:pb-0 md:ml-[220px]` so content clears the sidebar on desktop and clears the BottomTabBar on mobile.
- **BottomTabBar `<nav>`** — added `md:hidden` so it only renders on mobile.

No other files were modified. All CSS values use design-token custom properties (`--paper`, `--paper-2`, `--ink`, `--ink-3`, `--ink-4`, `--green`); no raw hex values introduced.

## Validation

- Mobile (< 768 px): TopBar and BottomTabBar visible; sidebar absent; `pb-[68px]` prevents content overlap.
- Desktop (≥ 768 px): Sidebar visible with logo, five nav links, language toggle; TopBar and BottomTabBar hidden; `ml-[220px]` offsets main content correctly.
- Active route highlighted in `--green` / `--paper-2` on sidebar links.
- Basket badge propagates to sidebar `SidebarLink` identically to `Tab`.

## Notes

- `SidebarLink` is a file-private component; it does not need to be exported.
- The `Tab` component is unchanged and still used exclusively by `BottomTabBar`.
