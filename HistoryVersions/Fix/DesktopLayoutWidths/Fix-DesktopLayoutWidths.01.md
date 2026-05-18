# Fix-DesktopLayoutWidths.01 — PricingPage form unbounded width

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

Follow-up to Fix-DesktopLayoutWidths.00. Full-page desktop audit revealed PricingPage had no `max-width` on `<main>`, causing the 3-column form (material | price input | status) to stretch to the full content area (~1,097px) on wide screens.

## Reason

`PricingPage` `<main>` used only `px-4 py-8` with no max-width constraint. At 1280px the form rows became uncomfortably wide with the price input field taking ~50% of the viewport.

## Changes

### src/pages/PricingPage.jsx

- `<main className="px-4 py-8 flex flex-col gap-6">` → added `max-w-3xl mx-auto w-full`
- `max-w-3xl` (768px) is appropriate for a 3-column form — material name (~220px) + price input (~200px) + status badge — and keeps it visually proportioned at any viewport width.

## Validation

- `npm run lint` — 0 errors, 0 warnings
- `npm run build` — clean
- Screenshot at 1280px confirmed: form centered, rows correctly proportioned

## Notes

- All other buyer pages (Dashboard, Schedule, SmartRoute) are already full-width or have appropriate containers.
- BasketPage uses `max-w-5xl` throughout — no change needed; empty-state centering is intentional.
