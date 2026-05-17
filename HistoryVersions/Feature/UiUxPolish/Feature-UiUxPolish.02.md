# Feature-UiUxPolish.02

**Date:** 17 May 2026 (17 พฤษภาคม 2569)

## Overview

UI pass to align layouts and pages with design-spec.md Neo-brutalist mono spec. Focused on navigation active states, mobile tab pill, profile quick-actions, and settings label.

## Reason

Previous implementations used green-soft/green-ink for active nav states. Design spec requires dark active state (ink background, paper text) for sidebar links and green-soft pill for mobile tabs.

## Changes

### `src/layouts/UserLayout.jsx`
- **SideLink active state**: changed from `bg-[var(--green-soft)] text-[var(--green)]` → `bg-[var(--ink)] text-[var(--paper)]` (dark pill as per spec)
- **Tab component**: added `bg-[var(--green-soft)]` pill wrapper on icon area when active; wrapped icon in inner span with conditional background; uses render props from NavLink for `isActive` state

### `src/layouts/BuyerLayout.jsx`
- **SideLink active state**: same change as UserLayout — `bg-[var(--ink)] text-[var(--paper)]` when active

### `src/pages/ProfilePage.jsx`
- Added `useDispatch`, `useNavigate`, `clearUser` imports
- Added `handleSignOut` function
- Added quick-actions panel below role-specific content: Settings →, Help & FAQ →, Sign out → (per design spec section 3.9)

### `src/pages/SettingsPage.jsx`
- Added "SETTINGS" mono label above h1 (per design spec section 3.10 showing "SETTINGS (mono)" before "Preferences (h1)")

## Validation

- Sidebar active state: dark background with green left-border indicator (3px)
- Mobile bottom tab: green-soft pill behind active icon
- ProfilePage: quick-actions panel with Settings, Help & FAQ, Sign out rows
- SettingsPage: mono label prefix before main heading

## Notes

Design spec reference: `docs/design-spec.md` sections 2 (Navigation Anatomy), 3.9 (ProfilePage), 3.10 (SettingsPage).
