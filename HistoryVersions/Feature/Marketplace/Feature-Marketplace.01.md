# Feature-Marketplace.01 History

Date: 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Replaced the flat flex-wrap filter bar with a responsive desktop sidebar + mobile filter drawer layout for `MarketplacePage.jsx`. Added a `materialFilter` state that filters visible listings by material type independently of the existing grade filter.

## Reason

The original single-row filter bar had no material dimension and collapsed poorly on narrow viewports. The target design requires a sticky 180 px sidebar on desktop (md: breakpoint) with grade pills stacked vertically, a divider, and material chips below, while mobile shows an inline expandable panel triggered by a toggle button.

## Changes

### `src/pages/MarketplacePage.jsx`

- Added `filterOpen` state (default `false`) controlling the mobile filter drawer visibility.
- Added `materialFilter` state (default `'all'`) for filtering listings by `materialType`.
- Updated the `visible` derivation to chain three `.filter()` calls: flagged check → grade filter → material filter.
- Extracted two internal render helpers `GradePills` and `MaterialPills` that accept a `vertical` prop; `vertical=true` renders full-width stacked buttons (sidebar), `vertical=false` renders inline wrapping chips (mobile drawer).
- Mobile section (`md:hidden`): toggle button with "Filters" label; when `filterOpen` an inline `<div>` card appears below it showing both Grade and Material pill groups.
- Desktop section: outer `div` uses `md:grid md:grid-cols-[180px_1fr] md:gap-6 md:items-start`; `<aside>` is `hidden md:flex md:flex-col gap-2 sticky top-4 self-start` containing "FILTERS" label, `GradePills vertical`, `<hr>` divider (`h-px bg-[var(--ink-4)] border-none my-3`), "MATERIAL" label, and `MaterialPills vertical`.
- Main content column holds `PostAdForm` (when `isPosting`) and the listings grid, now using `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (added `lg:grid-cols-3`).
- Page header `max-w-xl` updated to `max-w-5xl` to match the wider two-column layout.
- All existing logic (PostAdForm, dispatch, Redux selectors, listing card rendering) is unchanged.

## Validation

- On mobile viewports: filter bar is hidden; "Filters" button toggles an inline card showing grade and material pills; listings are single-column.
- On desktop (>= 768 px): `<aside>` is visible with stacked grade pills, divider, and stacked material chips; listings grid expands to 3 columns on large screens.
- Selecting a material chip filters `visible` to only posts with matching `materialType`; selecting "All" resets.
- Grade filter from Redux (`setGradeFilter`) continues to work independently and combines with `materialFilter`.
- Active pills display as `bg-[var(--ink)] text-[var(--paper)]`; inactive as `bg-[var(--paper)] text-[var(--ink)]` — no raw hex used anywhere.

## Notes

- `GradePills` and `MaterialPills` are local render functions inside `MarketplacePage` (not exported components) as they close over dispatch, gradeFilter, materialFilter, and language — keeping the file self-contained.
- `materialFilter` is local state only; no Redux slice change needed since material filtering is a UI-only concern at this stage.
