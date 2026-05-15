# Fix-MarketplaceCleanDirty.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Migrated Marketplace from the legacy A/B/C grade system to the binary clean/dirty (pass/fail) system introduced upstream. All grade-based API calls and UI controls now use a boolean `clean` flag.

## Reason

Upstream APIs `pricePerKg(materialType, clean)` and `marketPrice(materialType, clean)` switched from string grade (`'A'`/`'B'`/`'C'`) to boolean (`true` = clean, `false` = dirty). The Marketplace UI and Redux slice retained the old grade references, causing incorrect pricing and a stale `gradeFilter` state entry.

## Changes

### `src/pages/MarketplacePage.jsx`

- **ShopCard**: Changed `marketPrice(materials[0], 'A')` → `marketPrice(materials[0], true)`.
- **PostAdForm — initial state**: Replaced `grade: 'A'` with `clean: true`; added `lat: null, lng: null` fields.
- **PostAdForm — suggested price**: Changed `marketPrice(form.materialType, form.grade)` and `pricePerKg(form.materialType, form.grade)` → use `form.clean` boolean.
- **PostAdForm — condition toggle**: Replaced A/B/C grade button group with a two-button สะอาด / ไม่สะอาด toggle bound to `form.clean`.
- **PostAdForm — location field**: Added a geolocation input row (readOnly display + "📍 ตำแหน่ง" button) between the contact input and the submit button. Writes to `form.lat` / `form.lng` via the Geolocation API.
- **PostAdForm — handleSubmit**: No structural change required; `...form` spread already carries `clean`, `lat`, `lng` into the payload.
- **Pricing table**: Changed `marketPrice(key, 'A')` → `marketPrice(key, true)` in the per-row price lookup.

### `src/store/marketplaceSlice.js`

- Removed `gradeFilter: 'all'` from `initialState`.
- Removed `setGradeFilter` reducer.
- Removed `setGradeFilter` from the named exports.

## Validation

- Pricing table rows now display clean-condition prices (×1.0 multiplier) without errors.
- ShopCard best-price badge uses `true` clean flag correctly.
- PostAdForm suggested price reacts to the สะอาด/ไม่สะอาด toggle.
- Location field captures GPS coordinates on button press; displays as `lat, lng` or placeholder when unset.
- Redux store no longer carries unused `gradeFilter` state.
- No other files reference `setGradeFilter` (confirmed by scope of changes).

## Notes

- The `handleSubmit` payload was already using `...form` spread, so `lat`/`lng`/`clean` are automatically included without additional changes.
- If `navigator.geolocation` is unavailable (e.g. HTTPS not served or denied), the location fields remain `null` and no error is thrown.
