# Feature-BuyerDashboard.00

**Date:** 13 May 2026 (13 พฤษภาคม 2569)

## Overview
Implemented the Buyer Dashboard page (M6) with stats cards, a weekly volume chart, and booking management.

## Reason
Shop/buyer role users need a dashboard to track pending orders, see revenue, and accept or reject incoming waste sale requests.

## Changes

### src/pages/DashboardPage.jsx (UPDATED)
- Stats row: 3 cards — Pending Orders (orange), Completed Today (green), Today's Revenue (฿)
- Weekly volume bar chart: simple div bars normalized to 64px height, Mon–Sun labels
- Recent bookings list (5 mock entries): each shows GradeTag, localized material, weight, status badge, seller name
- Accept/Reject buttons for pending bookings, dispatch sonner toasts on action
- Status computed dynamically from local state (useState over MOCK_BOOKINGS)
- Revenue computed from accepted bookings × weight × 10 estimate

## Validation
- `npm run lint` passes
- `npm run build` succeeds

## Notes
All stats are derived from mock data state. No Redux writes in this page — dashboard is read/display-focused.
