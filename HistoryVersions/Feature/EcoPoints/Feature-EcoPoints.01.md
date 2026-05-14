# Feature-EcoPoints.01

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Two targeted fixes to `EcoPointsPage.jsx`: replace hardcoded hex tier colors with CSS tokens (dark-mode safety), and restructure the page layout so that the tier table and rewards panel sit side-by-side on desktop.

## Reason

1. **Dark mode breakage** — The `TIERS` array used raw hex values (`#CD7F32`, `#A0A0A0`, `#D4AF37`, `#9BA5B7`) that do not adapt when the `[data-theme="dark"]` attribute is applied. All color values must reference CSS custom properties so they respond to theme switches.
2. **Single-column desktop layout** — Every content block stacked vertically regardless of viewport width, wasting horizontal space on md+ screens. The tier table and rewards list are natural candidates for a two-column layout on desktop.

## Changes

### `src/pages/EcoPointsPage.jsx`

- **TIERS colors** — replaced four hex literals with CSS tokens:
  - Bronze: `'var(--orange)'`
  - Silver: `'var(--ink-3)'`
  - Gold: `'var(--green)'`
  - Platinum: `'var(--blue)'`
- **`<main>` wrapper** — added `max-w-5xl mx-auto` for desktop containment.
- **Responsive grid** — wrapped the tier table and rewards section in `<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">`. Header, progress card, and timeline history remain full-width.
- No new imports. No logic changes. All `style={{ color: tier.color }}` and `background: tier.color` usages continue to work because browsers resolve `var()` in inline style strings.

## Validation

- `npm run lint` — no new lint errors expected (structural JSX change only).
- Manual: resize browser to < 768 px → single column. Resize to >= 768 px → tier table left, rewards right.
- Toggle dark mode → tier badge, progress fill, and tier name text all render with correct token-resolved colors.

## Notes

- `--blue` is used for Platinum as a neutral cool tone replacing the original near-gray hex. Verify `--blue` is defined in `src/index.css` tokens; if absent, substitute `--ink-2`.
