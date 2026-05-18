# Fix-UXQuickWins.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview

Implemented U1 + four top-5 UX quick wins from the UX research report (docs/ux-research.md).
No new dependencies. Lint clean, 16/16 unit tests pass.

## Changes

### U1 — PricingPage: Supabase persistence hardened (`PricingPage.jsx`, `useShopPricingActions.js`)

- `useShopPricingActions.savePricing` now throws on Supabase error instead of swallowing it silently.
- `handleSave` wraps the call in try/catch: shows error toast on failure, success toast only on confirmed write.
- `isDirty` state tracks unsaved changes; resets on successful save, load, or reset.
- Header shows `● Unsaved changes` label and the Save button gains a `●` prefix when dirty.

### U4 — ScanPage: editable weight in result card (`ScanPage.jsx`)

- Added `editedWeight` state, set alongside `setResult` in both single and multi-object inference paths.
- Mobile result bottom sheet: weight is now an inline `<input type="number">` with a green underline border.
- Total price calculation and `handleSwipeRight` both use `parseFloat(editedWeight)` (clamped to ≥ 0.01 kg).
- `handleReset` clears `editedWeight`.

### U5 — DashboardPage: rejection reason modal (`DashboardPage.jsx`)

- Clicking "Reject" opens a modal instead of directly calling `rejectBooking`.
- Modal shows 4 preset reason chips (bilingual EN/TH): "Yard is full", "Material paused", "Wrong materials listed", "Time doesn't work".
- Free-text input below presets; selecting a preset populates the input.
- "Reject order" confirm button in orange. "Cancel" closes without action.
- `REJECT_PRESETS` array defined at module level for easy extension.

### U6 — DashboardPage: booking list time grouping (`DashboardPage.jsx`)

- `getTimeGroup(b, language)` categorises each booking by `scheduledAt || createdAt` in `Asia/Bangkok` timezone.
- Groups: Today AM / Today PM / Tomorrow / Later / Past (bilingual).
- `groupBookings()` returns ordered groups, filtered to non-empty.
- Each group renders a `SectionDivider`-style label before its rows.

### U10 — SettingsPage: two-step delete account confirm (`SettingsPage.jsx`)

- Replaced `window.confirm` with a proper modal.
- Step 1: warning about what gets deleted + grace period note ("Account will be deactivated within 24 hours").
- Step 2: user must type `DELETE` exactly to enable the confirm button.
- Button disabled + loading state ("Deleting…") during async call.
- Cancel closes modal and clears the input.

## Validation

- `npm run lint` — 0 errors, 0 warnings
- `npm run test:run` — 16/16 passed
