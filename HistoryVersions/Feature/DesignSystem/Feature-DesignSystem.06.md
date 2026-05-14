# Feature-DesignSystem.06 — Marketplace / Pricing Table Wireframe Layout

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Redesigned MarketplacePage to match the "Marketplace / Prices" wireframe: left panel shows a live pricing table for all material types with 7-day sparkline trends, right panel shows nearby buying requests with a mini SVG map.

## Reason

User provided wireframe (Marketplace _ Prices.html) combining the pricing table and buying-request views into one dashboard page.

## Changes

### `src/pages/MarketplacePage.jsx`

**Removed:** grade filter (A/B/C) tabs and card-grid listing view.

**Added constants:**
- `CATEGORIES` — maps filter keys (all/plastic/paper/metal/glass) to material type arrays
- `TRENDS` — mock 7-day price history per material with direction (up/down/flat)
- `BUYING_REQUESTS` — 4 mock buyer records with mapX/mapY coordinates for SVG map

**New components:**
- `Sparkline` — 48×18 polyline SVG drawn from 7 daily prices; green/orange/ink-4 based on trend direction
- `MiniMap` — 192×160 SVG with grid lines, 5km radius ring (dashed green), shop squares, "me" dot
- `RequestCard` — buying request card (name, distance, min qty, pickup window, material, grade, price/kg, "Deal →" button)

**Left panel — Pricing Table:**
- Header: "Today's market — Chiang Mai" + ฿ THB ▾ + /kg ▾ selectors (display-only)
- Category tabs: All materials | Plastic | Paper | Metal | Glass | ★ My basket (n)
- Table rows: material name + "in basket" badge (green-soft bg highlight), Grade A price, Sparkline + trend label
- Footer: "updated 4 min ago · source: 6 buyers" + "↓ export CSV" + "set price alert" (both toast placeholders)

**Right panel — Buying Requests + Map:**
- Header: "Buying requests — near you" with 5 km ▾ and sort ▾ (display-only)
- 4 `RequestCard` items (mock data matching wireframe)
- `MiniMap` SVG below cards
- "+ Post Ad" button → expands `PostAdForm` inline (existing form logic unchanged)

**PostAdForm:** kept all existing logic (dispatch addPost, validation, grade selector, suggested price) — only minor style polish (smaller labels).

## Validation

- `npm run lint` → 0 errors
- All Redux imports: `addPost` from marketplaceSlice; `waste.basket` selector for "in basket" detection
- Mobile: panels stack vertically; table scrolls independently; map stays visible below cards

## Notes

- Currency/unit selectors and radius/sort dropdowns are display-only (cursor-default) — wired functionality deferred
- Sparkline Y-axis uses min-max normalisation per material so all trends are visually readable regardless of absolute price scale
- Buying requests use hardcoded mock data matching wireframe; real data to come from Supabase buying_requests table
