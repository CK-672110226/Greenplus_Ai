# Fix-AccessibilityAudit.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview

Full accessibility and UX audit of all shared components and layouts. 11 issues found and fixed across 8 files — covering focus rings, touch targets, ARIA roles/labels, reduced-motion, and design-token consistency.

## Reason

The app had no global keyboard focus ring (all interactive elements used `outline-none` or no focus style at all), mobile topbar buttons were 28–32px (well below the 44px WCAG touch target minimum), several interactive elements lacked `aria-label`, and all CSS animations ran without a `prefers-reduced-motion` guard.

## Issues Fixed

### CRITICAL

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | No global focus-visible ring — keyboard users had no visible focus indicator on buttons, links, tab bar | `src/index.css` | Added `:focus-visible { outline: 2px solid var(--green); outline-offset: 2px }` + `:focus:not(:focus-visible) { outline: none }` |
| 2 | No `prefers-reduced-motion` guard — all 5 animations (`scan-laser`, `map-ping`, `flagged-pulse`, `skeleton`, `bbox-draw`) ran unconditionally | `src/index.css` | Added `@media (prefers-reduced-motion: reduce)` block disabling all animations |
| 3 | Mobile topbar buttons in `BuyerLayout` were `w-7 h-7` (28×28px) — below 44px WCAG minimum | `src/layouts/BuyerLayout.jsx` | Changed to `w-11 h-11` (44×44px); `min-h-[44px]` on lang/logout buttons |
| 4 | Mobile topbar buttons in `UserLayout` were `w-8 h-8` (32×32px) | `src/layouts/UserLayout.jsx` | Changed to `w-11 h-11` (44×44px) |
| 5 | Basket button in `UserLayout` mobile topbar had no `aria-label` | `src/layouts/UserLayout.jsx` | Added `aria-label` with item count: `"Basket — 3 items"` |

### MEDIUM

| # | Issue | File | Fix |
|---|-------|------|-----|
| 6 | `ProgressBar` missing `aria-valuemin` — spec requires all three of `aria-valuenow`, `aria-valuemin`, `aria-valuemax` | `src/components/ProgressBar.jsx` | Added `aria-valuemin={0}` |
| 7 | `Tabs` missing `role="tablist"` on container and `role="tab"` / `aria-selected` on each button — screen readers couldn't identify tab widget | `src/components/Tabs.jsx` | Added `role="tablist"`, `role="tab"`, `aria-selected={isActive}` |
| 8 | Language toggle buttons in `NavBar`, `UserLayout` sidebar, `BuyerLayout` sidebar had no `aria-label` — "EN"/"TH" text alone is not descriptive | `NavBar.jsx`, `UserLayout.jsx`, `BuyerLayout.jsx` | Added `aria-label="Switch to English"` / `"เปลี่ยนเป็นภาษาไทย"` |
| 9 | `BuyerLayout` mobile topbar logout button had no hover style and no cursor feedback | `src/layouts/BuyerLayout.jsx` | Added `hover:text-[var(--ink)] transition-colors cursor-pointer` |
| 10 | Inline forgot-password email input in `LoginPage` had no `<label>` — only a placeholder | `src/pages/LoginPage.jsx` | Added `<label htmlFor="forgot-inline-email" className="sr-only">Email address for password reset</label>` |
| 11 | `GradeTag` used raw hex values `#22C55E` / `#FFA500` bypassing CSS token system (breaks dark mode if tokens change) | `src/components/GradeTag.jsx` | Replaced with `var(--green)` / `var(--orange)` / `var(--ink)` |

### LOW (noted, not fixed)

| # | Issue | Notes |
|---|-------|-------|
| A | `KpiCard` trend arrows use Unicode `▼▲` — screen readers announce "down-pointing triangle" | Low impact; consider `aria-label` on trend span in a future pass |
| B | Password strength indicator in `LoginPage` reset form is color-only (no text label) | Low impact; targeted at visual users filling out a focused form |
| C | `GlobalSearch` (Cmd+K) has no touch-accessible trigger on mobile | Feature gap; mobile search requires a button to open it |
| D | `Button` `loading` prop added but `LoginPage` still uses inline `'...'` text for loading state | `LoginPage` callers control the label text directly; they should pass readable text like `"Sending…"` instead of `"..."` |

## Files Changed

- `src/index.css` — focus-visible ring + prefers-reduced-motion block
- `src/components/ProgressBar.jsx` — aria-valuemin
- `src/components/Tabs.jsx` — role="tablist", role="tab", aria-selected
- `src/components/GradeTag.jsx` — CSS tokens for background/color
- `src/components/Button.jsx` — loading prop + aria-busy
- `src/components/NavBar.jsx` — aria-label on language toggle
- `src/layouts/UserLayout.jsx` — 44px topbar buttons, aria-labels, lang toggle label
- `src/layouts/BuyerLayout.jsx` — 44px topbar buttons, aria-labels, lang toggle label, logout hover
- `src/pages/LoginPage.jsx` — sr-only label on inline forgot-password input

## Validation

`npm run lint` — 0 errors, 0 warnings after all changes.
