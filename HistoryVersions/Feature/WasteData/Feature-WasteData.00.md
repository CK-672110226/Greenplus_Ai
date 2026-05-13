# Feature-WasteData.00

**Date:** 13 May 2026 (13 พฤษภาคม 2569)

## Overview
Created the `src/data/wasteItems.js` data layer providing canonical waste material definitions, pricing functions, and localization helpers used across the entire application.

## Reason
Scanner, Basket, Marketplace, Map, and Second Brain all need consistent material names and prices. Centralizing this data prevents duplication and ensures the Thai junk shop price scale is consistent (THB/kg realistic rates).

## Changes

### src/data/wasteItems.js (NEW)
- `WASTE_ITEMS` object with 8 keys: `pet_bottle_clear`, `aluminum_can`, `cardboard`, `newspaper`, `mixed_plastic`, `copper`, `glass`, `cooking_oil`
- Each entry: `{ nameEn, nameTh, basePrice }` (basePrice in THB/kg)
- Prices: PET 8, aluminum 40, cardboard 3, newspaper 2, mixed plastic 5, copper 200, glass 1, cooking oil 12
- `pricePerKg(materialType, grade)` — Grade A = base * 1.2, B = base * 1.0, C = base * 0.7; returns 0 for unknown material
- `localName(materialType, language)` — returns `nameTh` when language is 'th', `nameEn` otherwise

## Validation
- `npm run lint` passes
- `npm run build` succeeds
- Unit tests in `src/__tests__/wasteItems.test.js` pass (7 tests)

## Notes
This file has no React dependencies and is pure JS, making it easily testable with Vitest.
