# Feature-UiUxPolish.04

**Date:** 17 May 2026 (17 พฤษภาคม 2569)

## Overview

UI pass — third round via Ruflo swarm (3 parallel agents). Updates DashboardPage, MarketplacePage, LoginPage, SchedulePage, AdminPage to match design-spec.md.

## Reason

Continuing systematic alignment with design-spec.md Neo-brutalist mono. Used Ruflo star-topology swarm to distribute work across 5 pages simultaneously.

## Changes

### `src/pages/DashboardPage.jsx`
- Added "Buyer Dashboard" mono eyebrow label above `<h1>`
- KPI row: `grid-cols-3` → `grid-cols-2 md:grid-cols-4`, added 4th "accepted" card
- KPI cards: replaced `<Card>` wrapper with raw `<div border-[1.5px] border-[var(--ink)]>` pattern per spec KPI pattern; values at `text-[32px] font-brand leading-none`
- Separated `accepted` / `completed` count variables (was conflated)
- Status chips: replaced inline-styled `<span>` with 4 conditional bordered chips (pending=ink, accepted=green-soft, completed=paper-2, rejected=orange)

### `src/pages/MarketplacePage.jsx`
- Added "Chiang Mai · Today" mono eyebrow label above `<h1>` per spec 3.7
- Category filter tabs already matched dark pill pattern — no change needed

### `src/pages/LoginPage.jsx`
- Role badge: replaced inline `style={{ borderColor, color }}` with Tailwind token classes `border-[var(--ink)] text-[var(--ink)]`
- All 5 inputs: `border-[var(--ink-4)] focus:border-[var(--ink)]` (was `border-[var(--ink)] focus:border-[var(--green)]`)
- All 3 error displays: upgraded to mono bordered style `font-data text-[12px] uppercase tracking-widest border-[1.5px] border-[var(--orange)] px-3 py-2`

### `src/pages/SchedulePage.jsx`
- Added "Schedule" mono eyebrow label above `<h1>`
- Slot time `font-brand` → `font-data` (times are data, not personality headings)
- `statusBadge` rejected color: `#E53E3E` → `var(--orange)` (no raw hex)

### `src/pages/AdminPage.jsx`
- Added "Platform Admin" mono eyebrow label above `<h1>`
- Pending shop status chip: `border-[var(--orange)] text-[var(--orange)]`
- Active shop status chip: `border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-ink)]`
- Tab buttons and Approve/Reject buttons were already correct — skipped

## Validation

- DashboardPage: 4-column KPI grid, bordered cards, correct status chips
- MarketplacePage: "Chiang Mai · Today" eyebrow visible
- LoginPage: input borders use ink-4/ink pattern; error displays are mono bordered
- SchedulePage: time values in mono font; no raw hex
- AdminPage: status chips use token colors; heading has eyebrow

## Notes

Ruflo swarm ID: swarm-1779006047898-y913yk (star topology, 3 agents).
Design spec reference: `docs/design-spec.md` sections 3.1, 3.7, 3.10, 3.11, 3.12.
