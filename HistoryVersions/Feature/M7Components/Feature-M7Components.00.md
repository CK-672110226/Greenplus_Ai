---
# Feature-M7Components.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview
M7 component build: ScheduleCalendar (week-view buyer calendar), SlotCreatePopup, SmartRouteMap (AI-optimized route with Leaflet), useSmartRoute (TSP hook), LocationPicker (Leaflet drag-pin), and wiring these to DashboardPage + BuyerOnboardingPage.

## Reason
DESIGN_MIGRATION_PLAN.md sections 4.1 and 4.2 identified ScheduleCalendar and SmartRouteMap as the two most visually differentiated features absent from the SPA compared to the wireframes. LocationPicker was needed to complete the BuyerOnboardingPage wizard.

## Changes

### New files
- `src/components/ScheduleCalendar.jsx` — 7-day week-view grid (08–18h), booking blocks colored by status, click-to-create via SlotCreatePopup
- `src/components/SlotCreatePopup.jsx` — modal for creating pickup slots (date, hour, duration, capacity)
- `src/components/SmartRouteMap.jsx` — Leaflet map + stop list, nearest-neighbor TSP route from buyer's shop
- `src/hooks/useSmartRoute.js` — fetches today's accepted bookings, runs TSP, returns ordered stops + stats
- `src/components/LocationPicker.jsx` — react-leaflet MapContainer with draggable pin, onClick to move

### Modified files
- `src/pages/BuyerOnboardingPage.jsx` — Step 3 now includes LocationPicker; formData.lat/lng stored and sent to shops upsert
- `src/pages/DashboardPage.jsx` — Added "Schedule" and "Smart Route" tabs; ScheduleCalendar and SmartRouteMap wired in
- `docs/architecture.mermaid` — Added On-Demand Logistics state machine diagram; removed Google Maps external dependency

## Validation
- `npm run lint` — no new errors
- ScheduleCalendar renders current week, navigates prev/next
- SlotCreatePopup opens on cell click, inserts to Supabase bookings
- SmartRouteMap shows CARTO tile map + polyline route + numbered stop list
- LocationPicker drag pin updates lat/lng correctly in BuyerOnboardingPage

## Notes
- TSP uses nearest-neighbor heuristic (O(n²)), adequate for ≤20 stops/day
- SmartRouteMap falls back to Chiang Mai center (18.7883, 98.9853) if shop has no lat/lng
- Drag-to-reorder stop list deferred to M9 (requires @dnd-kit/core)
