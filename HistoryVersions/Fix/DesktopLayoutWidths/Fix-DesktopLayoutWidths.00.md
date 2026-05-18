# Fix-DesktopLayoutWidths.00 — Desktop pages rendering in mobile layout

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

Several pages and components used narrow `max-w-sm` / `max-w-xl` / `max-w-2xl` wrappers that look correct on mobile but waste most of the viewport on desktop (1280px+), leaving all content squeezed in a narrow center column.

## Reason

The original mobile-first pass set conservative max-widths. At 1280px these wrappers render content at 384px (max-w-sm) or 576px (max-w-xl), leaving large dead margins on both sides.

## Changes

### src/pages/ProfilePage.jsx

All content-level wrappers changed `max-w-sm` → `max-w-2xl` (672px):
- Page `<h1>` heading: `max-w-sm` → `max-w-2xl`
- `UserProfile` card (avatar + stats): `max-w-sm` → `max-w-2xl`
- `UserProfile` scan history list: `max-w-sm` → `max-w-2xl`
- `BuyerProfile` identity card: `max-w-sm` → `max-w-2xl`
- `BuyerProfile` accepted-materials card: `max-w-sm` → `max-w-2xl`
- `AdminProfile` card: `max-w-sm` → `max-w-2xl`
- Quick-actions footer list: `max-w-sm` → `max-w-2xl`

### src/pages/EcoPointsPage.jsx

- Main content column: `max-w-2xl` → `max-w-4xl` (896px)

### src/pages/SettingsPage.jsx

- `<main>` container: `max-w-xl` → `max-w-2xl` (672px)

### src/pages/DashboardPage.jsx

- Pricing tab table container: `max-w-xl` → `max-w-2xl` (672px)

### src/components/SmartRouteMap.jsx

All three render blocks (loading state, empty state, full render) changed `max-w-2xl` → `max-w-5xl` (1024px) so the map and KPI row fill the dashboard panel on desktop.

## Validation

- `npm run lint` — 0 errors, 0 warnings
- `npm run build` — clean (871ms)

## Notes

- Modals and popups (`BasketPage` empty state, `ChatOfferModal`, `BookingModal`, `SlotCreatePopup`, `ScanPage` error alert) intentionally kept at `max-w-sm` — they are centered overlays where narrow width is correct.
- `LoginPage` form kept at `max-w-sm` — login forms are intentionally focused/narrow.
- `LandingPage` prose paragraph kept at `max-w-sm` — prose line-length constraint, not a layout wrapper.
