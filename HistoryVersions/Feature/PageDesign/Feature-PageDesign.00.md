# Feature-PageDesign.00

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Applied wireframe design patterns from `Greenplus/` source to all major user-facing pages. Updated `LoginPage` with smart auto-switch auth flow and moved Google OAuth below the email/password form. Added `SectionDivider` and `KpiCard` components and used them across pages. Added `WORKPLAN.md`, `Greenplus/`, and `docs/` to `.gitignore`.

## Reason

Wireframe sources in `Greenplus/` defined the target visual language but had not yet been applied to the React SPA pages. Pages needed to be brought in line with the neo-brutalist design spec (hatch charts, tier tables, timeline history, section dividers, KPI cards).

## Changes

### `.gitignore`
- Added `WORKPLAN.md`, `Greenplus/`, `docs/` to project-specific ignores

### `src/pages/LoginPage.jsx`
- Moved Google OAuth button + OR divider to **below** the email/password form submit button (was above)
- Extracted `insertProfile()` helper to avoid duplication
- Added smart auto-switch: signin with unknown email → auto `signUp`; signup with existing email → auto `signInWithPassword`
- Refactored `handleSubmit` into `doSignIn()` / `doSignUp()` sub-functions for clarity

### `src/pages/HomePage.jsx` (full redesign)
- Added time-aware greeting: `GOOD MORNING/AFTERNOON/EVENING, [NAME]`
- Added `HatchBarChart` SVG component: 7-bar weekly chart with diagonal hatch fill using `<pattern>`
- Added 2-col KPI row using `KpiCard` (weekly earnings + eco points)
- Used `SectionDivider` for basket / last scan / quick access sections
- Expanded quick links grid to 4 items (map, eco-points, prices, profile)
- Removed `Card` import (unused in new layout)

### `src/pages/EcoPointsPage.jsx` (redesign)
- Updated `TIERS` from 3 to **4 tiers**: Bronze / Silver / Gold / Platinum with multipliers ×1.00–×1.15
- Points summary moved to raw bordered div with neo-brutalist shadow (replacing Card)
- Added **tier table** with columns: Tier / Range / Multiplier; active tier highlighted green-soft + green dot
- Fixed `currentTier` / `nextTier` helper naming collision with `t` (from `useT()`) — renamed iteration variable to `item`/`row`
- Replaced flat history list with **timeline** layout: green dot + vertical connector line, "+N pts" right-aligned

### `src/pages/ProfilePage.jsx`
- Added `weight` field to `MOCK_SCAN_HISTORY` items
- Replaced 3-stat row (eco_points / totalScans / total ฿) in `UserProfile` with **lifetime impact grid**: kg recycled / ฿ earned / kg CO₂ saved (CO₂ = kg × 0.37)

### `src/pages/SettingsPage.jsx` (redesign)
- Removed `Card` wrapper; replaced with flat layout using `SectionDivider` between sections
- Added `Toggle` primitive component (used for dark mode and notification settings)
- Added **notifications section**: Price alerts / Pickup reminders / Promotions (local state)
- Added **account section**: Role / Linked accounts / Export data / Delete account
- Added version footer: `v0.4.x · build 20260514`
- Imports: added `useState`, `SectionDivider`; removed `Card`

## Validation

- `npm run lint` — no new errors introduced
- Visual review: homepage greeting + KPI + hatch chart + scan CTA + section dividers render correctly
- LoginPage auto-switch tested against Supabase error strings ("invalid login credentials", "user already registered")

## Notes

- `HatchBarChart` uses mock data (`MOCK_WEEKLY`) — real weekly aggregate to be wired from Supabase in a future milestone
- Notification toggles are local state only — persistence to user_profiles deferred
- CO₂ savings use a fixed factor (0.37 kg CO₂/kg material); a per-material factor may be added later
