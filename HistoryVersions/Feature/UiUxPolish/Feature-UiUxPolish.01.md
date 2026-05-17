# Feature-UiUxPolish.01

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview

Created 8 missing UI components and wired them into the application: Chip, Avatar, ProgressBar, Tabs, MiniLabel, ErrorBoundary, NotificationDrawer, and Page404. Added a catch-all 404 route, wrapped the app in ErrorBoundary, wired the bell button + unread badge to UserLayout mobile topbar, and upgraded DashboardPage's empty orders state to use EmptyState.

## Reason

Multiple shared UI primitives were missing from the component library. The app lacked a 404 catch-all route, a global error boundary, and a notification drawer accessible from the mobile topbar.

## Changes

### `src/components/Chip.jsx` — CREATED
Inline chip/tag component with 4 variants: default, soft, green, orange. Supports optional click handler.

### `src/components/Avatar.jsx` — CREATED
Circular avatar showing name initial. Accepts `name`, `size`, and `style` props.

### `src/components/ProgressBar.jsx` — CREATED
Horizontal progress bar with `value`/`max`, optional tick marks, and ARIA attributes.

### `src/components/Tabs.jsx` — CREATED
Horizontal tab strip using design-system tokens. Supports `items`, `active`, `onChange`, and optional `trailing` slot.

### `src/components/MiniLabel.jsx` — CREATED
9px uppercase data-label used for section headers and field labels throughout the design system.

### `src/components/ErrorBoundary.jsx` — CREATED
React class component that catches render errors and shows a full-screen fallback with a reload button.

### `src/components/NotificationDrawer.jsx` — CREATED
Right-side slide-in drawer connected to `s.notifications.items`. Dispatches `markAllRead`, shows unread badge, navigates to `/notifications` from footer.

### `src/pages/Page404.jsx` — CREATED
Full-screen 404 page matching design language. Provides "Go back" and "Home" buttons.

### `src/App.jsx` — MODIFIED
- Added `import { ErrorBoundary }` and `import { Page404 }`.
- Wrapped `<BrowserRouter>` in `<ErrorBoundary>`.
- Added `<Route path="*" element={<Page404 />} />` catch-all inside `<Routes>`.

### `src/layouts/UserLayout.jsx` — MODIFIED
- Added `useState` import.
- Added `selectUnreadCount` selector import.
- Added `NotificationDrawer` import.
- Added `drawerOpen` state and bell button with unread badge to mobile topbar (before basket button).
- Mounted `<NotificationDrawer open={drawerOpen} onClose={...} />` at bottom of layout.

### `src/pages/DashboardPage.jsx` — MODIFIED
- Added `EmptyState` import.
- Replaced plain "No bookings yet." `<Card>` with `<EmptyState>` showing icon, title, body, and CTA to switch to materials tab.

## Validation

- `npm run lint` — 0 new errors introduced. Pre-existing 10 errors in `ScanPage.jsx` and `yoloInference.js` are unrelated.
- All new components follow CSS custom property tokens and design language (no raw hex values, 1.5px borders, font-data/font-brand/font-body).

## Notes

- `Page404` uses HTML entities for apostrophes and arrows to satisfy JSX/eslint JSX-no-unescaped-entities rule.
- `ErrorBoundary` uses `&#x26A0;` entity for the warning symbol to avoid emoji lint issues.
- `NotificationDrawer` handles both `created_at` (Supabase snake_case) and `createdAt` (camelCase) timestamp fields for compatibility.
