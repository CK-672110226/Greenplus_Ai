# Feature-AiScannerMvp.01 — Vertex AI AutoML Two-Stage Pipeline + Full Supabase Integration

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

This revision extends the AI scanner MVP with a production-grade Vertex AI AutoML prediction path alongside the existing ONNX fallback, and wires every major data layer to live Supabase tables. Seed/mock data has been removed from all Redux slices; initial state is now empty and populated at runtime by four new Supabase data hooks. A user-facing "Report Issue" flow and an admin Reports review tab close the human-in-the-loop feedback loop for training dataset improvement.

## Reason

The two-stage pipeline previously only supported ONNX or a random mock. To move toward a deployable product, a real cloud inference endpoint (Google Vertex AI AutoML) was needed. Simultaneously, all Redux slices carried hard-coded seed data which prevented real-world data from appearing in the UI. This revision removes that seed data, adds live Supabase data hooks, and provides admin tooling to upload training images to Supabase Storage and export dataset manifests for retraining.

## Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/002_vertex_ai.sql` | Created | Three new tables: `training_images`, `user_reports`, `model_deployments` with RLS policies |
| `src/services/vertexAI.js` | Created | Vertex AI AutoML prediction service with `vertexPredict`, `vertexStage1`, `vertexStage2`, `imageToBase64` |
| `src/services/twoStageAI.js` | Modified | Added Vertex AI import; updated `twoStageInfer` to accept `vertexStage1Endpoint`/`vertexStage2Endpoint`; priority: ONNX → Vertex → mock; source field marks `'vertex'` |
| `src/store/aiConfigSlice.js` | Modified | Added `vertexProjectId`, `vertexLocation`, `vertexAccessToken`, `vertexStage1Endpoint`, `vertexStage2Endpoint` to initial state with localStorage persistence |
| `src/store/bookingSlice.js` | Modified | Removed `SEED` data; `initialState` set to `{ bookings: [] }`; added `setBookings` action |
| `src/store/marketplaceSlice.js` | Modified | Removed `SEED_POSTS` data; `initialState.posts` set to `[]`; added `setPosts` action |
| `src/store/scheduleSlice.js` | Created | New slice with `{ slots: [] }` initial state and `addSlot`, `updateSlot`, `removeSlot`, `setSlots` actions |
| `src/store/notificationSlice.js` | Created | New slice with `{ items: [] }` initial state and `addNotification`, `removeNotification`, `clearNotifications` actions |
| `src/store/index.js` | Modified | Added `notificationReducer` and `scheduleReducer` to store |
| `src/hooks/useShops.js` | Created | Fetches active shops from Supabase `public.shops`; returns `{ shops, loading }` |
| `src/hooks/useSupabaseBookings.js` | Created | Fetches buyer's bookings from Supabase; returns `{ bookings, loading, acceptBooking, rejectBooking }` |
| `src/hooks/useSupabaseMarketplace.js` | Created | Fetches active marketplace posts; returns `{ posts, loading, addPost, removePost }` |
| `src/hooks/useUserReports.js` | Created | Fetches pending admin reports; returns `{ reports, loading, approveReport, rejectReport }` |
| `src/pages/MarketplacePage.jsx` | Modified | Uses `useSupabaseMarketplace` hook; dispatches `setPosts` on load; shows loading state |
| `src/pages/MapPage.jsx` | Modified | Replaced `SHOPS` import with `useShops` hook; shows loading state |
| `src/pages/BasketPage.jsx` | Modified | Replaced `SHOPS` import with `useShops` hook |
| `src/pages/DashboardPage.jsx` | Modified | Uses `useSupabaseBookings`; dispatches `setBookings`; replaces `updateStatus` dispatches with hook methods |
| `src/pages/SchedulePage.jsx` | Created | New page: today's booking slots from Supabase; confirm/cancel/complete actions update Supabase bookings |
| `src/pages/AdminPage.jsx` | Modified | Stage 1 uploads to Supabase Storage + `training_images` table; Stage 2 cleanliness dataset section; Vertex AI Config section in model tab; Export Dataset Manifest button; new Reports tab using `useUserReports` hook |
| `src/pages/ScanPage.jsx` | Modified | Passes Vertex endpoint config to `twoStageInfer`; adds Report Issue button with inline material selection form; submits to `user_reports` table |
| `src/i18n/en.js` | Modified | Added 19 new i18n keys for report, vertex config, stage2, and uploading states |
| `src/i18n/th.js` | Modified | Added matching 19 Thai translations |

## Validation

- `npm run lint` — 0 errors in `src/` (pre-existing errors in `.claude/helpers/` are out of scope and unmodified)
- `npm run build` — passes, 195 modules transformed, 0 errors

## Notes

- **Vertex AI requires env vars:** `VITE_VERTEX_PROJECT_ID`, `VITE_VERTEX_LOCATION`, `VITE_VERTEX_ACCESS_TOKEN`. The access token is short-lived and must be refreshed via `gcloud auth print-access-token`. Alternatively, configure from the Admin → AI Model Config → Vertex AI Config section.
- **Supabase Storage bucket:** `training-images` must be created manually in the Supabase dashboard with a `public` read policy. The bucket name must match exactly.
- **Graceful degradation:** All Supabase calls fail silently if Supabase is not configured (missing env vars). The UI never crashes; it simply shows empty states.
- **Redux slices** no longer contain seed data. On first load with an unconfigured Supabase, all lists will be empty.
