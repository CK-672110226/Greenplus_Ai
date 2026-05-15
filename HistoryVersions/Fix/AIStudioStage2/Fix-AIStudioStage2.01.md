# Fix-AIStudioStage2.01

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Removed all hardcoded `WASTE_ITEMS` / `MATERIAL_KEYS` pre-seeding from AdminPage AI Studio section. State now starts empty and is populated entirely from the database on mount.

## Reason

Since admin defines their own material classes (names can be Thai, English, or any string), the predefined 8-item list was unnecessary mock data in the training context. Keeping it caused phantom folders to appear in Studio on first load before any DB data was added.

## Changes

### `src/pages/AdminPage.jsx`

- Removed `WASTE_ITEMS` from import (only `localName` remains)
- Removed `const MATERIAL_KEYS = Object.keys(WASTE_ITEMS)` constant
- Changed `classImages`, `uploadingClass`, `stage2Counts`, `uploadingStage2` initial state from MATERIAL_KEYS-seeded maps to empty `{}`
- Removed `MATERIAL_KEYS.forEach(...)` pre-seeding in `loadCounts` — DB data alone populates state now

## Translation behaviour

Custom class names (admin-defined labels like "ขวดพลาสติก" or "Plastic Bottle") are displayed as-is in both languages. `localName()` already falls back to returning the raw key when the material is not in `WASTE_ITEMS`, so no additional changes are needed for display. The label the admin typed IS the display name — there is no automatic translation for custom classes.

## Notes

`WASTE_ITEMS` is still used by ScanPage, BasketPage, PricingPage, MarketplacePage, DashboardPage, ProfilePage, MapPage, BookingModal, secondBrain, twoStageAI, and pricingSlice for pricing calculations and scan-result display. Those pages are unaffected.

## Validation

- `npm run lint` passes with no errors
