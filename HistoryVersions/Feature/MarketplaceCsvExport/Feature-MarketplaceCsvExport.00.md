# Feature-MarketplaceCsvExport.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview

Replace the "↓ export CSV" toast stub in MarketplacePage with a real client-side CSV download of the current shop-pricing data.

## Reason

The button existed with `toast.info('CSV export coming soon')` as a placeholder. Users need to export the price comparison table for offline analysis.

## Changes

### `src/pages/MarketplacePage.jsx` (MODIFIED)
- Replaced `onClick={() => toast.info('CSV export coming soon')}` with an inline handler that:
  1. Builds a CSV string from `shopPricing` (columns: material, shop, price_per_kg, grade).
  2. Creates a `Blob` with `type: 'text/csv'`.
  3. Triggers a browser download named `greenplus-prices-YYYY-MM-DD.csv`.
  4. Revokes the object URL after click.
- No server round-trip; uses the already-fetched `shopPricing` array from `useMarketPricing()`.

## Validation

- Lint passes (`npm run lint` — zero warnings).
- Manual: click "↓ export CSV" → browser downloads a .csv file containing current pricing rows.

## Notes

- Export reflects the currently visible category filter (all `shopPricing` rows regardless of `catFilter`), giving users a full snapshot.
