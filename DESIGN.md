---
project: GreenPlus Ai
register: product
language: bilingual (Thai primary, English peer)
personality: Honest · Practical · Community
generated: 2026-05-21
---

# Design System

## Overview

GreenPlus Ai uses a **neo-brutalist product aesthetic**: ink-on-paper surfaces, flat offset shadows, crisp 1.5px borders, and monospace data type. Nothing is softened by blur, gradient, or rounded corner. The visual language signals that data is unmediated — a price, a grade, a route — not dressed up for confidence or comfort.

The palette is deliberately off-white (warm paper, not pure white) with a single green accent kept well below saturation. Color earns its place only when it carries meaning: green = accepted/value, orange = warning/status, blue = location/map. Decorative color is absent.

Typography splits cleanly by register: `font-brand` (Architects Daughter + Mitr) for display and heading hierarchy; `font-body` (Caveat + Sarabun) for prose; `font-data` (JetBrains Mono + IBM Plex Sans Thai) for every piece of structured information — prices, weights, labels, tags, timestamps. The data font is the workhorse; it appears on ~70% of UI surfaces.

Both Thai and Latin scripts are peers, not translations of each other. Font stacks are paired: every English face has a Thai equivalent at the same weight and optical size.

The UI is mobile-first and outdoors-legible: 44px minimum tap targets, WCAG 2.1 AA contrast, and animations that respect `prefers-reduced-motion`.

---

## Colors

### Tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `--ink` | `#1A1A1A` | `#FAFAF7` | Primary text, borders, shadows |
| `--ink-2` | `#3A3A3A` | `#D8D8D0` | Secondary text |
| `--ink-3` | `#7A7A7A` | `#9A9A92` | Muted labels, placeholders |
| `--ink-4` | `#B8B8B8` | `#4A4A48` | Disabled states, dividers |
| `--paper` | `#FAFAF7` | `#151512` | Page background |
| `--paper-2` | `#F1EFE8` | `#1E1E1A` | Card/section background |
| `--green` | `#22C55E` | `#22C55E` | Primary action, accepted state |
| `--green-soft` | `rgba(34,197,94,.14)` | `rgba(34,197,94,.18)` | Tinted highlight, avatar bg |
| `--green-ink` | `#0F7A3A` | `#4ADE80` | Green text on light surface |
| `--orange` | `#F59E0B` | `#FBBF24` | Warning, flagged, degraded |
| `--blue` | `#5BC0BE` | `#5BC0BE` | Map, location, distance |
| `--line` | `var(--ink-4)` | `var(--ink-4)` | Horizontal rules, section lines |
| `--shadow` | `var(--ink)` | `var(--ink)` | Flat shadow color |

### Strategy

**Restrained** (one accent ≤10%). Paper backgrounds dominate. Green appears on primary CTAs, accepted-material indicators, and ProgressBar fills only. Orange is reserved for warnings and flagged posts. Blue is map-only. Everything else is ink on paper.

### Rules

- Never use raw hex in JSX. Always reference CSS tokens: `var(--green)` not `#22C55E`.
- `--ink-5` does not exist. Scale stops at `--ink-4`.
- Green text on light surfaces uses `--green-ink` (dark), not `--green` (light). On dark surfaces, `--green-ink` flips to `#4ADE80`.
- Color is never the sole carrier of meaning. Grade labels, status chips, and trend indicators always pair color with a text label or symbol.

---

## Typography

### Font Stack

| Class | Faces | Use |
|---|---|---|
| `font-brand` | Architects Daughter → Mitr → sans-serif | Display, H1, logo, large KPI numbers |
| `font-body` | Caveat → Sarabun → sans-serif | Prose, form values, descriptions |
| `font-data` | JetBrains Mono → IBM Plex Sans Thai → monospace | All structured data: prices, weights, labels, tags, timestamps |

Base body: `font-body 17px / 1.5`, `--paper` background, `-webkit-font-smoothing: antialiased`.

### Scale (observed)

| Step | Size | Font | Weight | Case | Usage |
|---|---|---|---|---|---|
| Display | 32–34px | brand | regular | mixed | Homepage KPI values |
| H1 | 28px | brand | regular | mixed | Page titles |
| H2 / card value | 32px | brand | regular | mixed | `KpiCard` value |
| Data large | 18px | data | regular | mixed | Marketplace price |
| Body | 15–17px | body | regular | mixed | Card content, prose |
| Label | 10–11px | data | regular | UPPERCASE | Section labels, field labels |
| Sub-label | 9px | data | regular | UPPERCASE | Chart axes, timestamps |

Tracking on labels: `tracking-widest` (≈0.15em). No letter-spacing on body or display text.

### Rules

- `font-data` for anything the user scans or acts on: prices, grades, weights, distances, times.
- `font-brand` for hierarchy and display only — never for body copy.
- Thai text is set in Mitr (brand), Sarabun (body), IBM Plex Sans Thai (data). These faces share optical sizing with their English counterparts.
- Line length: cap prose at ~65ch with `max-w-prose` where applicable.

---

## Elevation

GreenPlus Ai uses **flat offset shadows only**. There is no blur, no ambient glow, no layered shadow stack.

### Shadow levels

| Level | CSS | Usage |
|---|---|---|
| Resting | `box-shadow: 2px 2px 0 var(--ink)` | Cards, buttons, inputs, chips |
| Lifted (hover) | `box-shadow: 3px 3px 0 var(--ink)` + `transform: translate(-1px,-1px)` | Card hover, interactive surfaces |
| Pressed (active) | `box-shadow: none` + `transform: translate(2px,2px)` | Button press, active CTA |
| Modal overlay | `box-shadow: 4px 4px 0 var(--ink)` | Modals, drawers |
| None | — | Ghost buttons, dividers, nav items |

### Borders

- **Standard:** `1.5px solid var(--ink)` — cards, buttons, inputs, chips
- **Quiet:** `1px solid var(--ink-4)` — dividers, secondary containers
- No `border-radius` anywhere. Square corners are structural to the aesthetic.

### Depth model

There is no z-axis depth implied by blur or opacity. Depth is communicated only through offset: a shadow at 2px means the element is "on" the surface; 4px means it's lifted above it. Pressing an element returns it to zero.

---

## Components

### Button

Variants: `primary`, `secondary`, `ghost`.

- `primary`: `--green` background, `#062040` text — primary CTAs only
- `secondary`: `--paper` background, `--ink` text, full ink border + shadow — secondary actions
- `ghost`: transparent, no border, no shadow — nav items, inline text actions
- All variants: 1.5px ink border (except ghost), 2px flat shadow, 0.075s press transition
- Minimum height: 44px (mobile tap target)
- Disabled: `opacity: 0.5`, `cursor: not-allowed`

### Card

- Background: `--paper-2`
- Border: `1.5px solid var(--ink)`
- Shadow: `2px 2px 0 var(--ink)`, hover lifts to `3px 3px`
- Padding: 1rem–1.25rem
- Use only when the grouping is genuinely a distinct unit. No nested cards.

### KpiCard

Label → Value → Unit → Trend → Sub pattern.

- Label: `font-data 10px` uppercase `--ink-3`
- Value: `font-brand 2rem` `--ink`
- Unit: `font-data 14px`
- Trend up: `font-data 11px --green-ink`; trend down: `--orange`
- Sub: `font-data 11px --ink-3`

### Chip

Inline status/category tag. Variants: `default`, `soft`, `green`, `orange`.

- `default`: ink border, paper bg, ink text
- `soft`: `--ink-4` border, `--paper-2` bg, `--ink-2` text
- `green`: `--green-ink` border, `--green-soft` bg, `--green-ink` text
- `orange`: `--orange` border, transparent bg, `--orange` text
- Font: `font-data 11px` uppercase, `letter-spacing: 0.1em`

### SectionDivider

Thin horizontal rule with a label. Label: `font-data 10px --ink-3` uppercase. Line: `1px --ink-4`.

### ProgressBar

Track: `--paper-2` bg, `1.5px --ink` border. Fill: `--green`. Optional tick marks (ink, 30% opacity).

### MiniLabel

`font-data 9px --ink-3` uppercase, `letter-spacing: 0.15em`. Use for axis labels, secondary metadata.

### Avatar

Circular. Background: `--green-soft`. Text: `--green-ink` font-brand. Border: `1.5px --ink`. Shows initials or `<img>` when `avatar_url` present.

### Skeleton

Shimmer animation: `paper-2 → ink-4 → paper-2` gradient, 1.4s ease, disabled under `prefers-reduced-motion`.

### NavBar / UserLayout bottom tabs

NavBar: `border-b-[1.5px] --ink`. Logo: `font-brand 22px` with `--green` period. Lang toggle: `font-data 12px` ink-4 bordered pill.

UserLayout bottom tab: fixed 68px, icon + label, active state in `--green-ink`.

---

## Do's and Don'ts

### Do

- Use `font-data` for all prices, weights, distances, grades, timestamps, and field labels.
- Pair every color signal with a text label (chip text, grade letter, trend symbol).
- Apply `2px 2px 0 var(--ink)` shadow to every interactive surface that needs resting elevation.
- Use `--paper-2` for card/section backgrounds; `--paper` for the page body.
- Keep `--green` to primary CTAs and accepted-state indicators. Keep `--orange` to warnings only.
- Respect `prefers-reduced-motion`: disable all keyframe animations; keep static states readable.
- Minimum 44px tap height for all interactive elements on mobile.
- Add new i18n keys to both `en.js` and `th.js` simultaneously.
- Use CSS tokens in JSX — `var(--ink)` not `#1A1A1A`.

### Don't

- No `border-radius`. Square corners throughout.
- No blur shadows (`box-shadow` with blur > 0).
- No gradient text (`background-clip: text`).
- No gradient hero sections or decorative background gradients.
- No leaf, globe, or earth icon sets. No eco-app visual language.
- No streak counters, badge animations, or dopamine-loop UI patterns.
- No `--ink-5` (doesn't exist).
- No raw hex values in JSX — always use CSS tokens.
- No side-stripe `border-left` or `border-right` as a colored accent on cards or callouts.
- No `border-radius` on cards, chips, buttons, or inputs — square corners everywhere.
- Don't use `--green` for text on light surfaces — use `--green-ink` instead.
- Don't nest cards inside cards.
- Don't add gamification copy ("You helped save X trees", streaks, confetti).
