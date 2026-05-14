# Feature-MapPulsingPins.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Three Smart Map improvements:
1. Pulsing green pins for shops that accept materials in the user's current basket
2. Open/closed status badge in shop popup (when `opens_at`/`closes_at` are present on the shop record)
3. CartoDB Voyager tile layer (warm Paper-2-like background) replacing OpenStreetMap default in light mode

## Reason

User wireframe spec calls for pulsing pins to guide users toward shops that can accept what they're about to sell. Open/closed status reduces wasted trips.

## Changes

### `src/pages/MapPage.jsx`

- **`makeShopIcon(matches)`** — new `L.divIcon` factory:
  - `matches = true`: 22px container with pulsing `.map-ping` span + 13px filled green dot (border 1.5px ink)
  - `matches = false`: plain 13px grey dot (border 1.5px ink)
  - Uses hardcoded hex colors (#22C55E, #1A1A1A, #B8B8B8) because Leaflet `divIcon` HTML is injected outside the React tree and cannot read CSS custom properties
- **`isShopOpen(shop)`** — derives open/closed from `shop.opens_at` / `shop.closes_at` (HH:MM strings, compared against UTC+7 current time). Returns `null` if fields are absent (hides the badge).
- **`basketMaterials`** — `Set<string>` of `materialType` values from active (non-skipped) basket items, computed each render from Redux state
- **Shop `Marker`**: uses `makeShopIcon(matches)` where `matches = shop.accepts.some(a => basketMaterials.has(a))`
- **Popup**: shows open/closed badge, hours range, "Accepts your basket items" green note when matched
- **`TileLayer`**: light mode now uses CartoDB Voyager (`rastertiles/voyager`) — warm, minimal, similar to Paper-2 palette. Dark mode unchanged.

### `src/index.css` (already in .00 of ScannerLaserHapticDemo)

`.map-ping` keyframes were added in `Feature-ScannerLaserHapticDemo.00`.

## Validation

- `npm run lint` — 0 errors
- `npm run build` — 205 modules, clean (MapPage chunk: 165.77 kB, +1.6 kB vs prior)

## Notes

- `opens_at` / `closes_at` fields are not yet in the `public.shops` Supabase schema. The badge will only appear when those columns are added and populated. No fallback/mock data is used — the badge is simply hidden when the fields are absent.
- CSS custom properties (`var(--green)`) cannot be used inside `L.divIcon` HTML strings since that HTML is injected outside the React shadow tree. Hex constants are used instead and match the design token values exactly.
