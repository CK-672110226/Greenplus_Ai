# Feature-UiUxPolish.03

**Date:** 17 May 2026 (17 พฤษภาคม 2569)

## Overview

UI pass — second round. Updates BasketPage heading, PricingPage heading prefix, and MapPage circle/open-closed chip to match design-spec.md.

## Reason

Continuing design spec alignment. Previous pass (02) covered layouts and ProfilePage. This pass covers page-level heading patterns and map detail corrections.

## Changes

### `src/pages/BasketPage.jsx`
- Replaced simple `<h1>{t.basket}</h1>` + badge with two-row spec heading:
  - Top: `font-data` eyebrow "BASKET · N of M active" (ink-3, tracking-[0.15em])
  - Bottom: `฿{total}` in `font-brand text-[32px] text-[green-ink]` + "estimated" mono label
  - Matches design-spec.md section 3.5

### `src/pages/PricingPage.jsx`
- Added `font-data text-[10px]` eyebrow "Material Pricing" above the `<h1>`
- Consistent with spec section 3.11 and the pattern established in SettingsPage (02)

### `src/pages/MapPage.jsx`
- 5 km radius `<Circle>` pathOptions updated to ink dashed border, no fill (was green with opacity 0.04)
- Map popup open/closed badge replaced: hardcoded hex colors → design token chips (`border-[var(--green)]` / `border-[var(--ink-4)]`) using `font-data` pattern

## Validation

- BasketPage: heading shows correct "N of M active" count and green-ink total
- PricingPage: "Material Pricing" label above heading
- MapPage: circle renders as ink dashed ring; open/closed uses token-based chips

## Notes

Design spec reference: `docs/design-spec.md` sections 3.5 (BasketPage), 3.11 (DashboardPage/Pricing), 3.6 (MapPage).
