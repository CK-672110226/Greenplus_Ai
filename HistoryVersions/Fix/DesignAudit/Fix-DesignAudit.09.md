# Fix-DesignAudit.09 — NowDesign UI Pass: Nav, Home, Marketplace, Dashboard, Login

18 May 2026 (18 พฤษภาคม 2569)

## Overview

Pixel-perfect pass comparing live app against NowDesign HTML reference files (screenshotted via Playwright). Fixed 5 pages/components to match the designs exactly.

## Reason

All NowDesign files use dark theme as the primary UI. Comparison revealed significant structural differences: mobile nav had 6 items vs design's 2, homepage showed wrong KPI card and extra sections, marketplace had grade A/B/C tabs removed in design, dashboard had incorrect tab labels.

## Changes

### src/layouts/UserLayout.jsx

- **Mobile nav**: Reduced from 6 items (HOME | MARKET | AI FAB | BASKET | MAP | CHAT) to 2 items (HOME | MARKET). Design shows a clean 2-tab bottom bar.
- **Mobile topbar**: Removed dark mode toggle button and language toggle button. Design shows only logo + bell + basket icons.

### src/pages/HomePage.jsx

- **KPI card**: Replaced "Impact pts" card (eco-points + tier progress bar) with "CO₂ Saved" card. Value is `weeklyKg × 2.5` kg CO₂ estimated.
- **Removed "+ New Scan" button** from the page header actions area.
- **Removed "Quick actions" section** (4-tile grid: Scan, Marketplace, Today's prices, Nearby buyer).
- **Removed "Nearby buying requests" section** from right column.
- Cleaned up unused imports (`WASTE_ITEMS`), unused variables (`ecoPoints`, `tierName`, `tierPct`, `nearbyShops`), and unused helper functions (`getTierName`, `getTierPct`).

### src/pages/MarketplacePage.jsx

- **Removed Grade A/B/C filter tabs** from the right panel header (was showing "All grades | Grade A | Grade B | Grade C" buttons).
- **Hid "+ POST AD" button on mobile**: wrapped in `hidden lg:block` — button is desktop-only per design.
- Cleaned up unused `grade` state.

### src/pages/DashboardPage.jsx (buyer)

- **Tab bar**: Changed from 5 tabs (Bookings | Schedule | Route | Shop Days | Materials) to 4 tabs (Bookings | Schedule | Smart Route | Pricing).
- **Removed "Shop Days" tab** and its content (open-days toggle calendar).
- **Removed "Materials" tab** and its content (accepted materials grid).
- **Added "Pricing" tab**: Shows base prices for all accepted materials from `WASTE_ITEMS`.
- **Renamed "Route" → "Smart Route"** (Thai: เส้นทางอัจฉริยะ).
- Cleaned up unused imports (`toggleMaterial`, `setOpenDays`), unused state (`openDays`, `materialsSaved`), and unused handlers (`handleToggleDay`, `handleSaveCalendar`, `handleSaveMaterials`).

### src/pages/LoginPage.jsx

- **Added mail icon** as prefix inside the email input field.
- **Added lock icon** as prefix inside the password input field.
- **Added "press & hold to sign in" hint** text below the submit button (signin mode only).

## Validation

- `npm run lint` — clean (0 errors, 0 warnings)
- Mobile nav now shows 2 tabs as per design
- Homepage KPI row: Earnings | CO₂ Saved
- Marketplace right panel: no grade tabs, no mobile POST AD
- Dashboard: 4 tabs with correct labels
- Login: icons in fields, hint text present

## Notes

- CO₂ estimate uses 2.5 kg CO₂/kg recycled (rough average across materials)
- "Shop Days" and "Materials" functionality still exists in Redux slices — only removed from buyer dashboard UI per design spec
- The `useShops` hook is still imported in HomePage for the buyer alert banner
