# Refactor-RealDataOnly.00

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Remove all hardcoded / mock data constants from page components. Pages now show `0` or empty state when no real data is available. Admin AI config panel removed entirely.

## Reason

ทุกอย่างปรับไปใช้ data จริงทั้งหมดไม่มีก็ให้เป็น null ไม่ก็ 0 (All data must come from real sources; show 0 or null when unavailable).

## Changes

### `src/pages/AdminPage.jsx`
- Removed import `classifyWaste` from secondBrain service
- Removed import `setAiConfig` (re-added — still used by AI Studio deploy handler)
- Removed `MODEL_OPTIONS`, 12 state variables, 3 handlers (`handleSaveConfig`, `handleSaveVertexConfig`, `handleTest`), and entire `{tab === 'model' && ...}` JSX block (~125 lines)
- Removed tab button for `model` tab
- Removed `PENDING_SHOPS` and `ACTIVE_SHOPS` mock arrays
- Added `import { useShops }` — active shops now sourced from Supabase via `useShops()` hook
- `pending` state initialised to `[]` (real pending shops to be wired in A-04)

### `src/pages/DashboardPage.jsx`
- Removed `WEEKLY` and `DAYS` mock arrays
- Removed the "Weekly Volume" hatch bar chart Card that used them

### `src/pages/HomePage.jsx`
- Removed `MOCK_WEEKLY` constant and comment block
- Replaced `import { SHOPS }` with `import { useShops }` — nearby shops section now reads from Supabase
- `weeklyKg` set to `0` (no real historical data source yet)
- `HatchBarChart` receives `data={[]}` (renders empty chart)
- Null-safe `(shop.accepts ?? [])[0]` and `shop.distanceKm ?? '—'`; removed `shop.area` field (not in Supabase schema)

### `src/pages/EcoPointsPage.jsx`
- Removed `MOCK_HISTORY` array (5 hardcoded point events)
- Points history section now shows `t.noNotifications` empty-state text

### `src/pages/ProfilePage.jsx`
- Removed `MOCK_SCAN_HISTORY`, `BUYER_ACCEPTED`, `ADMIN_STATS` constants
- `UserProfile`: totals (`totalValue`, `totalKg`, `totalCo2`) set to `0`; scan history shows empty-state text
- `BuyerProfile`: accepted materials initialised from `profile?.accepted_materials ?? []` (real Supabase profile field)
- `AdminProfile`: stats counters replaced with `0`
- Removed unused `GradeTag` import; removed unused `language` prop on `UserProfile`

## Validation

- `npm run lint` passes with 0 errors in `src/`
- All pages render without crashes when real data arrays are empty

## Notes

- Heatmap in AdminPage still uses `HEATMAP_DATA` mock (10×10 matrix) — this is visualisation scaffolding pending A-05 (real scan density from Supabase)
- `DISTRICTS` array remains (static Chiang Mai district labels, not data)
- A-04 task: wire `pending` shops state to Supabase `shops` table filtered by `status = 'pending'`
