# Feature-MapTreeRouting.00 History

Date: 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Implemented Multi-Stop Route planning using a Tree/Graph traversal (Nearest Neighbor TSP heuristic) and added Calendar functionality for Buyer roles to declare their shop's operating days.

## Reason

1. The previous routing logic used a simple "single-shop-only" model. Users with mixed materials had no way to route to multiple shops.
2. Buyers needed a way to declare closed days so the routing engine would not direct users to closed shops.

## Changes

### `src/data/shops.js`
- Added explicit `openDays` array to all 6 shops (JS `Date.getDay()` format: 0=Sun, 1=Mon … 6=Sat).
- Shop 5 (ไบโอ ออยล์ CMU) set to `[2, 4]` (Tue/Thu only) to demonstrate meaningful calendar-based filtering.
- Shops 1–4 and 6 set to standard Mon–Sat `[1,2,3,4,5,6]`.

### `src/pages/BasketPage.jsx`
- `computeRoutes` now filters SHOPS against `currentDay` using each shop's `openDays` before building any route.
- Shops without an explicit `openDays` fall back to Mon–Sat `[1,2,3,4,5,6]`.
- Added Multi-Stop mode using Nearest Neighbor traversal:
  - Starts from user's GPS position (falls back to CMU coords).
  - At each step, picks the closest shop (by haversine) that covers at least one remaining material.
  - Advances the "current node" to the chosen shop, removes covered materials, repeats until no materials remain or no eligible shop exists.
  - Unmatched materials are surfaced separately with a warning label.
- Route panel toggle (Single / Multi-Stop) added above results.

### `src/pages/DashboardPage.jsx`
- Added "Shop Calendar" tab (3rd tab) to the Buyer Dashboard.
- Buyers toggle each of the 7 days Open/Closed via pill buttons.
- Local `openDays` state initialised to Mon–Sat by default.
- "Save Calendar" button shows a toast confirmation (wire-up to Redux/backend deferred to a future task).

## Validation

- `computeRoutes` correctly filters shops by `openDays` before routing.
- Nearest Neighbor algorithm picks the closest shop from the *current node* (not from the user's starting position) at each step, minimising cumulative travel distance.
- Multi-Stop route removes each covered material type from the remaining set before the next iteration.
- Dashboard Calendar tab renders all 7 days with correct OPEN/CLOSED toggle states in both Thai and English locale.

## Notes

- Shop Calendar save button currently writes to local state only (no Redux persist / backend call). A future task should propagate `openDays` from the buyer's saved profile back into the SHOPS dataset so routing reflects live buyer settings.
- HistoryVersions/README.md updated to register the new `MapTreeRouting` scope.
