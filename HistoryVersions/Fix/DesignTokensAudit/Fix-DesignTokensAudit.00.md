# Fix-DesignTokensAudit.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Design token enforcement audit: replaced all `font-brand` usages on price/monetary values with `font-data` (JetBrains Mono) per the design spec rule "JetBrains Mono for all prices/metrics".

## Reason

Design spec says `font-data = JetBrains Mono` for all data/metrics including prices. Several pages used `font-brand` (Architects Daughter handwriting) on ฿ values — inconsistent with the data typography system.

## Changes

### `src/pages/DashboardPage.jsx` (line 85)
- `font-brand text-[22px]` → `font-data text-[22px]` on `฿{revenue}` KPI card

### `src/pages/BasketPage.jsx` (lines 78, 311, 367, 405)
- 4× `font-brand` → `font-data` on shop estimate, basket total, shop route total, multi-stop total

### `src/pages/HomePage.jsx` (line 137)
- `font-brand text-[40px]` → `font-data text-[40px]` on hero basket earnings value

### `src/pages/ProfilePage.jsx` (line 46)
- `font-brand text-[22px]` → `font-data text-[22px]` on "earned" stat

## Validation

- `npm run lint` — 0 errors
- `npm run build` — 205 modules, clean

## Notes

- No violations found in `DashboardPage`, `AdminPage` for border-radius > 4px or blur shadows — those pages use only `border-[1.5px]` and flat `shadow-[2px_2px_0]` / `shadow-[3px_3px_0]` correctly.
- The only design token violations found were `font-brand` on monetary values.
