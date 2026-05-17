# Fix-DesignAudit.00

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

---

## Overview

Two UI bugs identified during a design audit against `docs/design-spec.md`. Both are visual-correctness issues with no data-model changes.

1. **HatchBarChart empty state** — when the user has no basket items, `weeklyData` produces all-zero values and the chart rendered near-invisible 6px stubs in `ink-4` colour.
2. **Profile eco-points menu row missing** — design spec §3.9 specifies an ECO-POINTS link row above SETTINGS in the profile quick-actions menu; it was absent entirely.

---

## Reason

- Chart empty state was unhandled: `Math.max(6, 0/0.1 * 70) = 6px` bars rendered with `hatch-dim` fill, appearing blank.
- Profile menu was incomplete relative to the design spec wireframe. The `/eco-points` route exists but had no entry point from the profile page.

---

## Changes

### `src/pages/HomePage.jsx`

**Function:** `HatchBarChart`

- Added `isEmpty` boolean: `data.every(d => d.val === 0)`.
- Extracted day-label `<text>` elements into an unconditional pass so axes always render.
- When `isEmpty` is true: renders a single centred SVG `<text>` "NO DATA YET" at mid-chart height using `var(--ink-3)` fill, `var(--font-data)` family, `10px` size, `0.15em` letter-spacing. No bar rects are rendered.
- When `isEmpty` is false: existing bar rendering logic unchanged (rect + optional value label), branched into an explicit else block.

### `src/pages/ProfilePage.jsx`

**New helper function:** `getEcoTier(pts)` (file-scope, above `ProfilePage`)

- Returns `'Platinum'` for pts >= 3000, `'Gold'` for >= 2000, `'Silver'` for >= 1000, `'Bronze'` otherwise.
- Thresholds match `docs/design-spec.md` tier definitions and the existing `getTierName` in `HomePage.jsx`.

**Component:** `ProfilePage`

- Derived `ecoPoints = profile?.eco_points ?? 0` and `ecoTier = getEcoTier(ecoPoints)` in the component body.
- Added ECO-POINTS `<button>` row as the first child inside the quick-actions `<div>`, above the existing SETTINGS row.
  - Label: `"ECO-POINTS"` — `font-data text-[12px] uppercase tracking-widest`.
  - Sub-label: `"{ecoPoints.toLocaleString()} pts · {ecoTier}"` — `font-data text-[10px] text-[var(--ink-3)]`.
  - Arrow: `→` matching all other rows.
  - Click handler: `navigate('/eco-points')`.
  - Hover and cursor classes identical to existing SETTINGS row.

---

## Validation

- `npm run lint` — passes with zero errors or warnings.
- Manual browser check recommended:
  - Open HomePage with empty basket: chart should show day labels and centred "NO DATA YET" text, no bar stubs.
  - Open ProfilePage: ECO-POINTS row appears above SETTINGS; clicking navigates to `/eco-points`.
  - Open ProfilePage with eco_points populated: sub-label shows correct pts and tier string.

---

## Notes

- No Redux slice changes, no new routes, no new components.
- `getEcoTier` duplicates `getTierName` from `HomePage.jsx` intentionally (co-location principle; ProfilePage has no import path to HomePage utilities).
- The existing SETTINGS and Help & FAQ rows are unchanged.
