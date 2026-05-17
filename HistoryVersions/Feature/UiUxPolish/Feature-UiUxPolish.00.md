# Feature-UiUxPolish.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview

Multi-fix UI/UX polish pass covering CSS tokens, mobile nav redesign, BuyerLayout sidebar redesign, cursor states, MapPage header/legend, EmptyState/Skeleton components, and targeted teammate-comment fixes.

## Reason

Teammate review identified: missing CSS tokens, inconsistent sidebar style between UserLayout and BuyerLayout, mobile bottom nav lacking a hero AI Scanner tab, missing cursor-pointer states across interactive elements, no page title on the map, and empty basket state with no EmptyState component.

## Changes

### `src/index.css`
- Added `--line` and `--shadow` CSS tokens to `:root` block
- Added `@keyframes shimmer` and `.skeleton` utility class
- Added cursor utility classes: `.cursor-pointer`, `.cursor-wait`, `.cursor-not-allowed`, `.cursor-grab`, `.cursor-grabbing`, `.cursor-loading`

### `src/layouts/UserLayout.jsx`
- Updated `mobileNav` array from 5-item set (home, scan, basket, map, profile) to new 5-item set (home, marketplace, scan/AI, basket, map)
- Updated `Tab` component to accept `isHero` prop — center scan tab renders as elevated circular hero button
- Updated nav render to pass `isHero={i === 2}` to the center tab

### `src/layouts/BuyerLayout.jsx`
- Full redesign: removed plain text-only sidebar and horizontal scroll mobile nav strip
- Added inline icon functions: IconDashboard, IconSchedule, IconPricing, IconRoute, IconBell, IconMarketBuyer, IconProfile, IconSettings, IconSignOut, IconSun, IconMoon
- Added `SideLink` component matching UserLayout style (green active bar, badge support, icon + label)
- Added `BuyerTab` mobile component with same hero center button pattern
- Sidebar now shows profile chip, dark mode toggle, lang toggle, logout — matching UserLayout
- Mobile replaced horizontal scroll with proper bottom tab bar (dashboard, schedule, route/hero, marketplace, pricing)
- Added `toggleDarkMode` import and dispatch

### `src/components/EmptyState.jsx` (new file)
- EmptyState component with icon, title, body, primaryCta, secondaryCta props

### `src/components/Skeleton.jsx` (new file)
- Skeleton component using `.skeleton` shimmer class

### `src/pages/BasketPage.jsx`
- Added `useNavigate` import and `EmptyState` import
- Replaced plain card empty state with full `EmptyState` component pointing to /scan and /marketplace

### `src/pages/MapPage.jsx`
- Added `IconPin` SVG function
- Added full-width page header with area label (pin icon + "CHIANG MAI AREA") and title ("Nearby Buyers · N shops")
- Added map legend strip (green dot = open/match, grey dot = closed/no match)
- GPS status strip and filter grid wrapped in inner container div

### `src/pages/SchedulePage.jsx`
- Added `IconClock` SVG function
- Time group labels (Morning/Afternoon/Evening) now render with clock icon prefix

### `src/pages/LandingPage.jsx`
- Added "FIRST: choose your role" label above the role-choice heading

### `src/components/BookingModal.jsx`
- Added `useState` import
- Added `selectedTime` state
- Added time picker (`<input type="time">`) above the total row
- `handleConfirm` now passes `selectedTime` to `onConfirm`

### `src/components/Button.jsx`
- Added `cursor-pointer` to base class array

### `src/pages/SettingsPage.jsx`
- Added `cursor-pointer` to `LangBtn` class string

### `src/pages/DashboardPage.jsx`
- Added `cursor-pointer` to `TabBtn`, day toggle buttons, and material toggle buttons

### `src/pages/MarketplacePage.jsx`
- Added `cursor-pointer` to category filter tab buttons, clean/dirty toggle buttons, and location button

### `src/pages/ProfilePage.jsx`
- Added `cursor-pointer` to material toggle buttons

## Validation

- `npm run lint` — no errors
- `npm run build` — successful (661ms)

## Notes

- BuyerLayout now requires `toggleDarkMode` from userSlice; this was already exported in that slice.
- The `BookingModal` in `src/components/BookingModal.jsx` is a separate component from the inline `BookingModal` in `BasketPage.jsx`; only the standalone component was updated with the time picker.
- `--line` and `--shadow` tokens are defined in `:root` only; dark mode overrides are not needed as they reference other tokens that already have dark variants.
