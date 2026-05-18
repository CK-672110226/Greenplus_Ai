# Fix-I18nCoverage.00 — Translation gaps and unreadably-small font sizes

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

Full i18n audit revealed two categories of issues:
1. Missing translation keys — strings shown in hardcoded English even when Thai language is selected
2. Hardcoded English strings in pages that bypass the `t.xxx` translation system entirely
3. Font sizes as small as `text-[9px]` in day-label grids that are genuinely unreadable

## Changes

### src/i18n/en.js and src/i18n/th.js

Added 39 new keys to both files (keeping both in sync):

| Section | Keys |
|---|---|
| Navigation | `chat` |
| Dashboard | `kpiPending`, `kpiAccepted`, `kpiCompleted`, `kpiRevenue`, `tabBookings`, `tabSmartRoute`, `breadcrumbDash`, `todaysHaul`, `shopNameFallback` |
| Schedule status | `slotPending`, `slotConfirmed`, `slotCompleted`, `slotCancelled` |
| Schedule days | `dayMon`, `dayTue`, `dayWed`, `dayThu`, `dayFri`, `daySat`, `daySun` |
| Eco Points | `ecoPointsTitle`, `ecoImpactLabel`, `ecoCurrentTier`, `ecoPriceBonus`, `ecoTierHeader`, `ecoRangeHeader`, `ecoBonusHeader`, `ecoHowTitle`, `ecoHowBody`, `ecoRecentHistory`, `ecoNoScans`, `ecoUnknown`, `ecoMaxTier`, `ecoToNext`, `ecoTierBronze`, `ecoTierSilver`, `ecoTierGold`, `ecoTierPlatinum` |

### src/pages/EcoPointsPage.jsx

- Added `import { useT }` and `import { SectionDivider }` (removed local duplicate component with `text-[9px]`)
- Changed `TIERS` array: `name: 'Bronze'` → `key: 'bronze'` (translation-key-based)
- Added `tierNames` lookup map inside component
- All hardcoded strings replaced with `t.xxx` keys
- Tier table column headers bumped from `text-[9px]` → `text-[11px]`

### src/pages/SchedulePage.jsx

- `statusBadge(status)` → `statusBadge(status, t)` — labels now go through translation
- `DAY_LABELS = ['Mon', ...]` → `DAY_KEYS = ['dayMon', ...]` resolved via `t[DAY_KEYS[idx]]`
- Hardcoded 'Pending' KPI card label → `{t.slotPending}`
- Hardcoded 'Schedule' breadcrumb → `{t.schedule}`
- Week-grid day header font: `text-[9px]` → `text-[11px]`

### src/pages/DashboardPage.jsx

- Shop name fallback: inline ternary → `t.shopNameFallback`
- Breadcrumb: inline ternary → `t.breadcrumbDash`
- Sub-heading "today's haul": inline ternary → `t.todaysHaul`
- KPI card labels (Pending/Accepted/Completed/Revenue): hardcoded → `t.kpiXxx`
- Tab array: hardcoded + inline ternaries → `t.tabBookings`, `t.schedule`, `t.tabSmartRoute`, `t.pricing`
- Pricing hint: inline ternary → `t.pricingHint`

## Validation

- `npm run lint` — 0 errors, 0 warnings
- `npm run build` — clean

## Notes

- `language` import in DashboardPage is still used for locale-aware date formatting; not removed
- `pricingHint` already existed in en.js/th.js — reused rather than creating a duplicate key
- EcoPoints page tier key change (`name` → `key`) is internal-only; no database or API impact
