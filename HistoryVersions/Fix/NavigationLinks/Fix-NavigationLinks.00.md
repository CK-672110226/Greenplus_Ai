# Fix-NavigationLinks.00 — Missing navigation links across layouts and pages

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

Full audit of inter-page navigation revealed six places where pages could not be reached when they should be reachable. All fixes applied in a single pass.

## Reason

Navigation gaps found during audit:
1. `UserLayout` mobile bottom tab had only 2 items (`/home`, `/marketplace`), and `isHero={i === 2}` never triggered — no Scan hero button appeared on mobile. `/basket` and `/map` were also unreachable from the mobile tab bar.
2. `UserLayout` desktop sidebar had no `/basket` link, despite `/basket` being a key action page.
3. `HomePage` buyer-alert banner `→` arrow was a plain `<span>` — not clickable, not navigating anywhere.
4. `BuyerLayout` mobile topbar was missing the notifications bell (only had dark mode, lang toggle, logout).
5. `BuyerLayout` mobile bottom tab had no Chat link (dashboard, schedule, route, marketplace, pricing).
6. `MarketplacePage` `ShopCard` had only "View on Map" — no way to start a chat with a shop.

## Changes

### src/layouts/UserLayout.jsx

- `mainNav` — added `/basket` entry (with `activeCount` badge) between Scan and Marketplace
- `mobileNav` — expanded from 2 to 5 items: Home | Basket | **Scan (hero at index 2)** | Map | Marketplace
  - `isHero={i === 2}` now correctly targets Scan

### src/layouts/BuyerLayout.jsx

- `BuyerTab` component — added `badge` prop with badge dot rendering (parity with `Tab` in UserLayout)
- Mobile topbar — added `<IconBell />` button that navigates to `/notifications` with unread badge
- Mobile bottom tab — replaced Marketplace with Chat (badge: `unreadChat`); Marketplace is available in the desktop sidebar and searchable via Cmd+K

### src/pages/HomePage.jsx

- Buyer-alert banner `→` changed from `<span>` to `<button onClick={() => navigate('/map')}>` with label "View on map →"

### src/pages/MarketplacePage.jsx

- Added `import { useNavigate }` from `react-router-dom`
- `ShopCard` — added `useNavigate` and a "Chat →" button alongside "View on Map →"; both buttons use `flex-1` split layout

## Validation

- `npm run lint` — 0 errors, 0 warnings
- `npm run build` — clean

## Notes

- EcoPoints page is still only reachable via Profile page quick-actions (not in any nav bar). This is by design per `docs/user-flow.md` — it is a secondary/achievement page, not a primary destination.
- Chat route for MarketplacePage shops navigates to `/chat` (global chat); shop-specific chat room deep-linking would require a `shopId` query param and is a future enhancement.
