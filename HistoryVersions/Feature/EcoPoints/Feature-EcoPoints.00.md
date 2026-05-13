# Feature-EcoPoints.00

**Date:** 13 May 2026 (13 พฤษภาคม 2569)

## Overview
Implemented the EcoPoints page (M9) with tier progression, a points history log, and a reward redemption section.

## Reason
Gamification drives recycling behavior. Users need to see their points, understand how to earn more, and redeem rewards — motivating continued waste scanning and selling.

## Changes

### src/pages/EcoPointsPage.jsx (NEW)
- Reads `eco_points` from Redux `user.profile` (defaults to 0)
- Tier system: Bronze (0–99), Silver (100–499), Gold (500+)
- Progress bar toward next tier with remaining points label
- "How to Earn" list: scan = +2 pts, A-grade = +5 pts, complete order = +10 pts
- 5 mock point history entries (date, description, amount)
- 3 reward cards (5% coupon / free pick-up / Gold Badge) with cost in points
- Redeem button: enabled styling when user has enough points, toast "Feature coming in M10" on click

### src/App.jsx (UPDATED)
- Added `/eco-points` route wrapped in `<ProtectedRoute>`
- Imported `EcoPointsPage`

## Validation
- `npm run lint` passes
- `npm run build` succeeds

## Notes
`Array.prototype.findLast` used for tier detection — supported in all modern browsers.
