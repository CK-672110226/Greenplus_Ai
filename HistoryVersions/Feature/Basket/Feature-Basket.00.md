# Feature-Basket.00

**Date:** 13 May 2026 (13 พฤษภาคม 2569)

## Overview
Implemented the full Basket page (M3 extension) replacing the stub with a functional basket management UI.

## Reason
After scanning waste items, users need to review, adjust weights, skip unwanted items, and see total value before visiting a junk shop.

## Changes

### src/pages/BasketPage.jsx (UPDATED)
- Header "ตะกร้า / Basket" with item count badge (green box, bold number)
- Empty state: shows `t.basketEmpty` translation
- Per-item Card:
  - GradeTag + localized material name + editable weight input + calculated price
  - Skip/Unskip toggle button (primary when skipped)
  - Remove button (ghost variant)
- Footer Card: total value of non-skipped items, Clear Basket button
- Imports: `useSelector` for `waste.basket` and `user.language`; `useDispatch` for `removeFromBasket`, `updateWeight`, `toggleSkip`, `clearBasket`
- Skipped items shown at 50% opacity

## Validation
- `npm run lint` passes
- `npm run build` succeeds

## Notes
Requires `updateWeight` and `toggleSkip` from wasteSlice (added in AiScannerMvp.00 scope).
