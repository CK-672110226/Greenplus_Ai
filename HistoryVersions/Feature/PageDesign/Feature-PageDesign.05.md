# Feature-PageDesign.05

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Design system token hardening via `/ui-design-system` skill audit: completed `@theme` color coverage, added shadow/border custom properties, z-index scale, type scale, custom Tailwind utilities, and reduced-motion support.

## Reason

- `@theme` block was missing `--color-ink-2`, `--color-green-soft`, `--color-green-ink`, `--color-blue` — these tokens existed in `:root` but couldn't be used as Tailwind utility classes (had to use bracket syntax `text-[var(--ink-2)]` everywhere)
- Neo-brutalist shadow pattern `shadow-[2px_2px_0_var(--ink)]` repeated in ~6 component files — no single source of truth
- No z-index scale — ad-hoc z-values risk layering bugs as more overlays are added
- No type scale in `@theme` — font sizes were hardcoded per component
- No `prefers-reduced-motion` rule — fails accessibility audit
- `transition: background 0.2s` on body was a magic number

## Changes

### `src/index.css`

#### `@theme` additions
- `--color-ink-2: #3A3A3A` — now usable as `text-ink-2`, `bg-ink-2`
- `--color-green-soft: rgba(34, 197, 94, .14)` — usable as `bg-green-soft`
- `--color-green-ink: #0F7A3A` — usable as `text-green-ink`
- `--color-blue: #5BC0BE` — usable as `text-blue`, `bg-blue`
- Type scale: `--text-2xs` (10px) through `--text-2xl` (28px) aligned to project usage
- Z-index scale: `--z-base/card/sticky/modal/toast/tooltip` (0/10/20/30/50/60)

#### `:root` additions
- `--shadow-neo: 2px 2px 0 var(--ink)` — adapts to dark mode automatically
- `--shadow-neo-sm: 1px 1px 0 var(--ink)` — for small interactive elements
- `--shadow-neo-lg: 4px 4px 0 var(--ink)` — for emphasized cards
- `--border-neo: 1.5px solid var(--ink)` — canonical neo border
- `--border-neo-soft: 1px solid var(--ink-4)` — for inner dividers
- `--duration-snap/fast/base: 75ms/150ms/200ms` — named motion tokens

#### `@utility` additions (Tailwind v4)
- `shadow-neo`, `shadow-neo-sm`, `shadow-neo-lg` — replace all `shadow-[2px_2px_0_var(--ink)]` bracket usages
- `border-neo`, `border-neo-soft` — replace inline border patterns

#### Accessibility
- Added `@media (prefers-reduced-motion: reduce)` block — zeroes all transitions and animations for users with vestibular disorders
- `body` transition now uses `var(--duration-base)` token instead of magic `0.2s`

#### Layout
- Added `scrollbar-gutter: stable` on body — prevents layout shift when scrollbar appears/disappears

## Validation

- `npm run build` — successful, 334ms, zero errors
- All existing token usages via `var(--ink)` etc. unchanged — no breaking changes
- New `@utility` classes are additive — existing bracket-notation classes still work

## Notes

Components can progressively migrate from `shadow-[2px_2px_0_var(--ink)]` to `shadow-neo` as they are touched. No forced migration needed.
