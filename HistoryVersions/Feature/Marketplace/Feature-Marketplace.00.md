# Feature-Marketplace.00

**Date:** 13 May 2026 (13 พฤษภาคม 2569)

## Overview
Implemented the Marketplace page (M4) with filterable mock listings and a grade filter bar.

## Reason
The marketplace allows buyers and sellers to see what materials are available in the Chiang Mai recycling market. The stub needed to be replaced with a working prototype with real data shapes.

## Changes

### src/pages/MarketplacePage.jsx (UPDATED)
- 8 mock listings covering all 8 waste material types
- Filter bar: All / Grade A / Grade B / Grade C (button-based, active state with inverted colors)
- Grid layout: 1 col mobile, 2 col sm+
- Each listing card: GradeTag, localized material name, quantity (kg), price/kg, shop name, distance from CM
- "Contact" button shows sonner toast "Feature in M4 final"
- Empty state shown when filter yields no results

## Validation
- `npm run lint` passes
- `npm run build` succeeds

## Notes
SHOPS_DATA is defined as `LISTINGS` const inline. Translation keys `filterAll/A/B/C`, `noListings`, `contactSeller`, `kmAway` added to both i18n files.
