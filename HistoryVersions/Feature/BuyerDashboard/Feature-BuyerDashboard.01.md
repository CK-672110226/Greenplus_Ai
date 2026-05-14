# Feature-BuyerDashboard.01 — Buyer Portal Full Backend (Schedule, Pricing, Notifications)

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Full buyer portal buildout — 3 new Redux slices, 3 new pages, updated routing, updated BuyerLayout nav with section grouping, and full i18n coverage in both EN and TH.

## Reason

The buyer role was missing Schedule, standalone Pricing, and Notifications pages. BuyerLayout nav only had 4 items and no section grouping. The Pricing tab inside DashboardPage was split out to its own page, and the Dashboard was simplified to orders-only.

## Changes

| File | Action | Description |
|------|--------|-------------|
| `src/store/scheduleSlice.js` | CREATE | Redux slice for today's pickup schedule. 5 seed entries. Actions: confirmSlot, cancelSlot, completeSlot, addSlot, rescheduleSlot |
| `src/store/notificationSlice.js` | CREATE | Redux slice for buyer notifications. 5 seed entries. Actions: markRead, markAllRead, dismiss, addNotification. Exports selectUnreadCount selector |
| `src/store/pricingSlice.js` | CREATE | Redux slice for custom material pricing. Persists to localStorage key `gp_pricing`. Actions: setPrice, bulkSet, resetToDefault |
| `src/store/index.js` | MODIFY | Added schedule, notifications, and pricing reducers to configureStore |
| `src/pages/SchedulePage.jsx` | CREATE | Today's schedule page. Stats row, MORNING/AFTERNOON/EVENING groups, slot cards with confirm/complete/cancel actions |
| `src/pages/PricingPage.jsx` | CREATE | Pricing management page. Grid of materials × grades, market rate reference, above/below indicators, save/reset actions |
| `src/pages/NotificationsPage.jsx` | CREATE | Notification center. Today/Earlier sections, unread indicator border, dismiss button, mark-all-read |
| `src/layouts/BuyerLayout.jsx` | MODIFY | NAV expanded to 7 items in two groups (MAIN, ACCOUNT). Sidebar shows group labels. Notifications item shows unread badge. Mobile strip shows all 7 with red dot |
| `src/pages/DashboardPage.jsx` | MODIFY | Removed pricing tab, TabBtn, pricing local state, initPricing. Now shows orders list directly under stats + chart |
| `src/App.jsx` | MODIFY | Added lazy imports and routes for /schedule, /pricing, /notifications under ProtectedRoute requiredRole="buyer" |
| `src/i18n/en.js` | MODIFY | Added schedule, pricing, notifications, and nav section label keys |
| `src/i18n/th.js` | MODIFY | Added same keys in Thai |

## Validation

- `npm run lint` — run after all edits; zero errors expected
- `npm run build` — production build should succeed with no TypeScript/module errors

## Notes

- All state is mock/in-memory. Pricing persists to localStorage keys `gp_pricing` and `gp_pricing_savedAt`.
- Notifications unread count badge is wired into sidebar via `useSelector` — no prop drilling.
- The `selectUnreadCount` selector is exported from `notificationSlice.js` and reused in both BuyerLayout and NotificationsPage.
- History `.00` covered the initial DashboardPage build (13 May 2026).
