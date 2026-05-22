# Fix-AdminBuyerAuditFixes.00

Date: 19 May 2026 (19 พฤษภาคม 2569)

## Overview

Full audit of AdminPage and DashboardPage (Buyer). Eight issues found; all resolved in this version.

## Reason

Issues were identified during a senior-fullstack audit pass. Ranged from a DB constraint that silently blocked rider assignment writes to hardcoded UI strings showing wrong dates.

## Changes

### supabase/migrations/017_booking_status_in_transit.sql (new)
- Expands `bookings.status` CHECK constraint to include `in_transit`
- Migration 013 covered: pending, accepted, rejected, completed, searching, arrived, cancelled
- Without this, every rider assignment in AdminPage silently failed at the DB layer

### src/pages/AdminPage.jsx
- **Fix #1** — Reports tab reject button used `t.rejectShop` (wrong key); changed to `t.rejectOrder`
- **Fix #2** — Moderation tab query now joins `seller:user_id(display_name)` so the seller column shows the actual display name instead of a raw UUID slice

### src/pages/DashboardPage.jsx
- **Fix #4** — `StatusChip` now handles `in_transit` status (rendered as a green bordered chip "IN TRANSIT"); previously returned null, leaving assigned bookings with no status indicator
- **Fix #5** — Scheduled time display removed hardcoded `today` suffix; now renders full `DD Mon HH:MM` via `toLocaleString('en-GB', ...)`
- **Fix #6** — Revenue KPI now includes both `accepted` and `completed` bookings; previously dropped completed orders from the total
- **Fix #7** — Pricing tab now loads live `price_per_kg` from `shop_pricing` table via a `useEffect` on `shop.id`; falls back to `pricePerKg()` base price if no DB row exists. Column header updated from "Base price" to "Your price"
- Added `pricePerKg` to import from `wasteItems`
- Added `shopPricing` state and corresponding `useEffect`

### src/layouts/BuyerLayout.jsx
- **Fix #8** — Mobile bottom nav swapped "Prices" (`/pricing`) for "Market" (`/marketplace`); Marketplace had no mobile entry point. Prices remain accessible via the Dashboard's Pricing tab

## Validation

- `npm run lint` — clean
- `npm run build` — clean (726ms, no new warnings)

## Notes

- Migration 017 must be applied to production Supabase before rider assignment will succeed
- The `bookings.status` constraint name `bookings_status_check` is dropped and re-created idempotently
