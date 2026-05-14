# Feature-DesignSystem.04 — Wireframe-Accurate Desktop Dashboard

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Redesigned `UserLayout` and `HomePage` to match the "Home / Dashboard" wireframe from the HTML export. Key changes: richer sidebar with MAIN/ACCOUNT sections + user profile chip, and a full dashboard homepage with breadcrumb header, 3 KPI cards, weekly chart, quick-action grid, recent scans panel, and nearby buying requests panel.

## Reason

User provided a reference wireframe (Home _ Dashboard.html) showing the target desktop design. The previous layout had a minimal 2-col split; the wireframe specifies a richer information hierarchy matching a real SaaS dashboard.

## Changes

### `src/layouts/UserLayout.jsx`
- Sidebar sections restructured: MAIN nav (Home, AI Scanner, Marketplace, Eco-Points, Map) + ACCOUNT nav (Profile, Settings)
- Sign Out button above user profile chip at sidebar bottom; calls `supabase.auth.signOut()` then redirects to `/`
- User profile chip: avatar initial (green-soft bg), display_name, role badge, language toggle
- Active `SideLink` uses left-bar indicator (`w-[3px] bg-[var(--green)]`) + `green-soft` background instead of full green fill
- Mobile layout unchanged (top header + bottom tab bar)

### `src/pages/HomePage.jsx`
- **Header section**: breadcrumb "Home / Dashboard", large greeting (`{salute}, {name} —`), subtitle with weekly kg, "+ New Scan" CTA button (green with hard shadow)
- **KPI strip**: 3 equal columns — kg recycled, Earnings (with pending payout), Impact points (with tier label). Separated by ink borders (no cards).
- **Left column**: weekly hatch chart with green peak bar highlight + value labels, quick-action 2×4 grid
- **Right column** (w-320px on desktop): Recent scans list (from basket items, up to 5, with time labels), Nearby buying requests (first 3 SHOPS with distance, material, price/kg)
- Chart: peak bar uses `hatch-green` + ink stroke, others use `hatch-dim` + ink-4 stroke
- Empty states for both right-column panels when no data

## Validation

- `npm run lint` → 0 errors
- All imports verified: `WASTE_ITEMS` exported from wasteItems.js, `SHOPS` from shops.js, `supabase` from lib/supabase.js
- Mobile breakpoint unchanged — bottom tab nav still visible at < lg

## Notes

- `localName` call in recent scans uses `item.materialType` (correct field from basket items)
- Nearby buying requests show first accepted material per shop with Grade A price
- Time labels are mock strings (2m ago, 1h ago, etc.) — real timestamps to be added when scan history API is available
