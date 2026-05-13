# Feature-PilotLaunch.00

**Date:** 13 May 2026 (13 พฤษภาคม 2569)

## Overview
M10 Pilot Launch infrastructure: Supabase SQL schema, test seed data, Vercel SPA config, dark mode, DashboardPage pricing CRUD tab, SettingsPage dark mode toggle, environment template.

## Reason
Before Tambon Suthep go-live, the app needs production deploy configuration, a real database schema with RLS, and quality-of-life improvements (dark mode, buyer pricing control) that complete the "Must Have" story set.

## Changes

### `supabase/migrations/001_init.sql` (NEW)
Full schema with Row Level Security policies:
- `user_profiles` — id (auth FK), role, display_name, language_pref, eco_points
- `shops` — owner_id, name, area, lat/lng, accepts[], status (pending/active/rejected)
- `waste_items` — reference prices per material_type
- `scan_history` — per-user scan log with grade, weight, calculated_value, ai_source
- `marketplace_posts` — user listings with grade, quantity, price, status
- `bookings` — seller ↔ shop booking with status workflow
- `eco_point_ledger` — points credit/debit log
- `shop_pricing` — buyer-configurable prices per material per shop

### `supabase/seed/test_data.sql` (NEW)
- Inserts all 8 waste_items reference prices
- Commented instructions for creating 3 test accounts (user/buyer/admin) and populating linked data
- Ready-to-run patterns for scan_history, marketplace_posts, eco_point_ledger, shops

### `vercel.json` (NEW)
- SPA rewrite: all paths → `/index.html`
- Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- Asset cache: `Cache-Control: immutable` for `/assets/*`

### `.env.example` (NEW)
- Documents `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as required build-time vars

### `src/index.css`
- Added `.dark { }` block with full dark-mode token overrides (inverted paper/ink, same green/orange accents)
- Added `transition: background 0.2s, color 0.2s` on body for smooth toggle

### `src/store/userSlice.js`
- Added `darkMode: localStorage.getItem('gp_dark') === '1'` to initial state
- Added `toggleDarkMode` reducer — flips state and syncs to localStorage

### `src/App.jsx`
- `AuthInitializer` now reads `darkMode` from Redux and applies/removes `.dark` class on `document.documentElement` via `useEffect`

### `src/pages/SettingsPage.jsx`
- Added "Appearance" section with pixel-art toggle switch for dark mode
- Dispatches `toggleDarkMode` on click

### `src/pages/DashboardPage.jsx`
- Added "My Pricing" tab (B-02) — editable table of all 8 materials × 3 grades
- `initPricing()` seeds defaults from `pricePerKg()`
- `handleSavePricing` fires success toast (Supabase upsert in M10 final)
- `TabBtn` sub-component for consistent tab styling

### `src/i18n/en.js` + `src/i18n/th.js`
- Added: `profile`, `displayName`, `scanHistory`, `totalScans`, `shopInfo`, `acceptedMaterials`, `pricingTable`, `adminBadge`, `pendingActions`, `shopsToApprove`, `myPricing`, `gradeA/B/C`, `savePricing`, `darkMode`, `appearance`

## Validation
- `npm run lint` — 0 errors
- `npm run build` — 173 modules, 754 KB bundle
- `npm run test:run` — 15/15 pass
- Dark mode toggle: CSS vars switch, body background transitions

## Notes
M10 "final" items still pending (wired to real Supabase data, GPS-based shop distance, ONNX model swap):
- scan_history insert after each real scan
- Supabase upsert for shop pricing and accepted materials
- Haversine distance for route planning
- Real eco_points increment via Edge Function after verified drop-off
