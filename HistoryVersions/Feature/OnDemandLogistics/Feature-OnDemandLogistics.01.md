# Feature-OnDemandLogistics.01

16 May 2026 (16 พฤษภาคม 2569)

---

## Overview

Planning-layer additions for the On-Demand Logistics feature. This revision adds the task breakdown, sprint plan, and expanded user-flow documentation that were missing from the initial `.00` implementation record. No production code is changed in this revision.

---

## Reason

The `.00` record covered the code scaffold (logisticsSlice, useRealtimeLogistics, RiderDashboardPage, UserTrackingPanel, ChatPage stub, BuyerOnboardingPage stub). However, the project's AI-Native Engineering Principles require that architecture-level planning documents also be committed and tracked in history. This `.01` revision closes that gap by creating the task breakdown, sprint plan, and route documentation that future contributors need before touching logistics code.

---

## Changes (file-by-file)

### `NowProject/TASK_BREAKDOWN.md` — new file

Comprehensive task registry divided by specialist domain (Architect, Backend/Supabase, Fullstack, Frontend, UX/Design, ML, Security, Docs/i18n). Each task has a target file, priority (P0–P3), estimated time, and initial status. Total: 60 tasks across M6–M9.

### `NowProject/SPRINT_PLAN.md` — new file

4-milestone rolling sprint plan:
- M6 (current): P0 blockers (CSS tokens, migrations 013/013b/015, dashboard + settings fixes) + On-Demand Logistics foundation (slice, hooks, rider page, tracking panel, layout fixes, empty states)
- M7: UI polish, schedule calendar, SmartRouteMap, NotificationDrawer, BuyerOnboarding wizard, ScanPage ML improvements
- M8: Chat system, global search, onboarding overlay, missing design atoms, i18n completion
- M9: RLS audit, performance, Vercel deployment

### `docs/user-flow.md` — Section 10 added

New section appended to the existing user-flow document:
- New routes table: /rider, /onboarding, /chat, /chat/:roomId (role, component, status)
- Seller flow diagram: BasketPage → on-demand call → UserTrackingPanel status transitions
- Rider flow diagram: RiderDashboardPage toggle → GPS → nearbyOrders → accept → arrived → complete
- Admin flow: Heatmap tab with pickup density overlay alongside existing scan density
- Booking status state machine (7 states, transition actors, DB columns set)
- Redux slices table: logisticsSlice + chatSlice ownership map
- Page composition tables for RiderDashboardPage, BuyerOnboardingPage, ChatPage stub

---

## Validation

- All four planning documents cross-reference each other consistently (same route names, same status values, same slice names)
- Booking status values in `docs/user-flow.md` Section 10 match the CHECK constraint values added in Migration 013: `pending | accepted | rejected | completed | searching | arrived | cancelled`
- Route `/rider` marked as `requiredRole="buyer"` in both App.jsx changes (`.00`) and the new planning docs
- No existing history files modified or deleted; `.00` preserved intact

---

## Notes

- `Feature-OnDemandLogistics.00.md` covers the code implementation. This `.01` covers the planning artifacts. Both are canonical and should be read together.
- The `NowProject/MIGRATIONS_WRITTEN.md` file (created in `Feature/LogisticsOnboardingMigrations.00`) remains the authoritative reference for migration execution order and manual steps.
- `HistoryVersions/README.md` should be updated to add the `Feature/OnDemandLogistics/` scope entry in the same task that confirms these planning documents are complete.
