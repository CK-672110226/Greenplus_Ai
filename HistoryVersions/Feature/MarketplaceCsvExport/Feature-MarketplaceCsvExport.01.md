# Feature-MarketplaceCsvExport.01

17 May 2026 (17 พฤษภาคม 2569)

## Overview

Add a second CSV export button to MarketplacePage that exports the visible shops array
(name, area, accepted materials, distance) rather than the shop-pricing rows. The button
is placed in the "Active shops" right-column header alongside the heading.

## Reason

The existing CSV export (.00) downloads the `shopPricing` table (one row per
material-shop-price entry). Users also need a shop directory export listing each shop
once with its accepted materials — useful for offline reference and logistics planning.

## Changes

### `src/pages/MarketplacePage.jsx`

- Added module-level helper `exportCSV(shops)` before `MarketplacePage`:
  - Builds a CSV with four columns: Name, Area, Materials, Distance (km)
  - Each shop's `accepts` array is joined with `'; '` into a single cell
  - Values are double-quote escaped (`""` for embedded quotes)
  - Triggers browser download named `greenplus-marketplace-YYYY-MM-DD.csv`
  - Revokes object URL after triggering click
- Added `<button onClick={() => exportCSV(shops)} ...>` in the right-column header
  (`/* Right header */` div), wrapped in a `flex items-start justify-between` container
  alongside the two `<h2>` heading elements
  - Styled: `font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink-4)] px-3 py-1.5 bg-transparent hover:border-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors cursor-pointer shrink-0 mt-0.5`
  - Label: "↓ Export CSV"
- `shops` comes from `useShops()` which was already in scope

## Validation

- `npx eslint src/pages/MarketplacePage.jsx` — zero errors
- Manual: click "↓ Export CSV" in the Active Shops header → browser downloads
  `greenplus-marketplace-YYYY-MM-DD.csv` with one row per shop, materials semicolon-delimited

## Notes

- The existing pricing CSV export in the table footer (from .00) is untouched
- `language` parameter was intentionally omitted from `exportCSV` since the column
  headers are always English; material names are stored as keys in `accepts`, not
  localized labels, so no language context is needed
