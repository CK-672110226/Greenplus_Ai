# Feature-PageDesign.01

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Font loading fix, SectionDivider alignment correction, KpiCard font size correction, and expanded PRD design section.

## Reason

- Fonts loaded via CSS `@import` are render-blocking and cause FOUT (flash of unstyled text), making fonts appear to not load or load late
- `SectionDivider` had label centered between two lines; design spec requires label LEFT with line extending right
- `KpiCard` value was 28px; design spec specifies 32px
- PRD Section 5 was minimal and did not reflect actual implemented design system patterns

## Changes

### `index.html`
- Added `<link rel="preconnect" href="https://fonts.googleapis.com" />`
- Added `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`
- Added `<link rel="stylesheet">` for all 6 Google Fonts families
- Fonts now load in parallel with CSS parsing instead of sequentially after it

### `src/index.css`
- Removed `@import url('https://fonts.googleapis.com/...')` line
- Fonts no longer double-loaded; single `<link>` in HTML is the source of truth

### `src/components/SectionDivider.jsx`
- Changed from `[line][label][line]` (centered) to `[label][line]` (left-aligned)
- Matches design spec section 4 micro-patterns code

### `src/components/KpiCard.jsx`
- Changed value font size from `text-[28px]` to `text-[32px]`
- Matches design spec KPI Card pattern

### `PRD.md` — Section 5
- Expanded from minimal typography table to full design system reference
- Added: aesthetic principles table, complete color token table with dark mode, anti-patterns note, component patterns (Card, Button, SectionDivider, KpiCard, Toggle, ProgressBar, HatchChart), navigation shells table

## Validation

- `npm run lint` — zero errors
- Font loading: fonts now declared in HTML `<head>` before CSS, browser can start fetching immediately
- SectionDivider: label appears at left margin, line extends to right edge

## Notes

- No functional changes — all changes are visual/design-system only
- Vercel deployment pending user login (`npx vercel login`)
