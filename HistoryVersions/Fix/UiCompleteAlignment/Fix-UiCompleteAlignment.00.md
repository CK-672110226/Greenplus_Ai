# Fix-UiCompleteAlignment.00

**Date:** 17 May 2026 (17 พฤษภาคม 2569)

## Overview

Complete systematic UI/UX alignment pass covering every page and component against `docs/design-spec.md`. Previous passes were partial; this fix targets every remaining gap identified by an explore audit.

## Reason

Full design-spec compliance before M10 pilot launch. Gaps included missing cursor states, no hover animations, BasketPage skip strikethrough missing, MarketplacePage lacking tabs, SchedulePage only showing today, ChatPage missing speed-dial FAB, DashboardPage KPI cards without hover lift, MapPage missing bottom turn-by-turn card and raw hex color.

## Changes

### `src/index.css`
- Added global cursor rules: `input/textarea/select → cursor: text`, `button:disabled → cursor: not-allowed`, `.leaflet-container → cursor: grab / grabbing`, `[data-loading="true"] → cursor: wait`

### `src/components/Card.jsx`
- Added hover lift: `hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150`
- Added conditional `cursor-pointer` when `onClick` prop is present

### `src/pages/HomePage.jsx`
- Added 3rd KPI cell "IMPACT PTS" showing `profile.eco_points` in green-ink
- Added buyer alert banner (green-soft bg, green border) showing nearest open shop

### `src/pages/ScanPage.jsx`
- After scan result, shows `+N impact pts` line in `font-data text-[13px] text-[var(--green-ink)]`
- Points formula: `Math.max(1, Math.round(weight_kg * 10))`

### `src/pages/BasketPage.jsx`
- Skip items now render `line-through opacity-40` on material name and value spans (was opacity-50 only)

### `src/pages/MarketplacePage.jsx`
- Added `[Listings] [Buy Requests]` tab bar (dark pill pattern matching design-spec)
- Listings tab: existing shop cards; Buy Requests tab: iterates community posts

### `src/pages/ChatPage.jsx`
- Replaced plain `+ Offer` text button with floating speed dial FAB (bottom-right of composer)
- FAB `+` rotates 45° when open; shows 3 sub-buttons: ฿ Offer (functional), Photo/Voice (placeholder, disabled)
- Updated offer message prefix to `[OFFER:sell]` / `[OFFER:buy]` via `side` state

### `src/components/ChatOfferModal.jsx`
- Added Sell/Buy toggle as first element after title (ink/paper tab pattern)
- Passes `side` ('sell' | 'buy') in `onSend` payload

### `src/pages/SchedulePage.jsx`
- Added Mon–Sun week grid view (`viewMode === 'week'` default)
- 7-column grid; today cell highlighted with `bg-[var(--green-soft)]`
- Clicking a day cell opens inline slot popup with pre-filled date
- List view preserved as `viewMode === 'list'` toggle option

### `src/pages/DashboardPage.jsx`
- Added hover lift to all 4 KPI cards: `hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150`

### `src/pages/MapPage.jsx`
- Fixed Polyline `color` from raw hex `#22C55E` → `var(--green)` token
- Added bottom floating turn-by-turn card when `routeTo` is set: `absolute bottom-4` with `font-data` mono style and ink border/shadow

## Validation

- `npm run lint` — zero errors
- `npm run build` — zero errors
- All pages: Card hover lift visible; skip items have strikethrough; Marketplace has Listings/Buy Requests tabs; Schedule shows Mon–Sun week grid; Chat has speed dial FAB; Dashboard KPI cards have hover lift; Map bottom card appears when routing

## Notes

Work distributed across 4 parallel Ruflo agents (star topology). Tasks A/B/C completed in first pass; Task D (Buyer console) hit API rate limit after SchedulePage — DashboardPage hover lift and MapPage fixes completed directly.
Branch: `fix/ui-complete-alignment`
