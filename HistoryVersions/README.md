# HistoryVersions Organization

This folder stores canonical implementation history for the repository.

## Canonical Structure

- `Feature/<ScopeKey>/` contains only canonical version files for feature scope `<ScopeKey>`.
- `Fix/<ScopeKey>/` contains only canonical version files for fix scope `<ScopeKey>`.
- Canonical files follow either `Feature-<ScopeKey>.YY.md` or `Fix-<ScopeKey>.YY.md` naming.
- Version `YY` starts at `.00` for each scope and increments by `+0.01` in filename form.

## Legacy Material

- If mis-scoped or superseded records exist, preserve them in a clearly named legacy subfolder under the most relevant scope (for example `LegacyFromWrongScope/`).
- Do not mix legacy records into the scope root canonical sequence.
- Existing assignment-numbered files are considered legacy history and must be preserved.

## Update Rule

- When history structure changes (move/rename/reorganize), update this README in the same task.

## Current Canonical Scopes

- `Feature/SupabaseConnect/` — `.00` initial client setup; `.01` basket booking + buyer pricing dual-write to Supabase
- `Feature/SuthepShopsSeed/` — `.00` self-contained SQL seed for 6 Chiang Mai recycling shops with shop_pricing rows
- `Feature/SupabaseRealtime/` — `.00` Supabase Realtime booking notifications for buyers + openDays/acceptedMaterials persistence to user_profiles
- `Fix/AIStudioStage2/` — `.00` multi-object YOLO detection returning full array + concurrent stage-2 per detection
- `Fix/MapPageNavigation/` — `.00` replace directions `<a href>` with `window.open` button for iOS Leaflet popup compatibility
- `Fix/PricingCleanDirty/` — `.00` remove A/B/C grades; replace with two-level Clean/Dirty pricing system
- `Fix/LocalModelsSlugKeys/` — `.00` change YOLO + TM class label arrays from Thai strings to WASTE_ITEMS English slug keys so pricePerKg() lookups return correct prices
- `Feature/LiveAnalysisHandlingGuide/` — `.00` add "แนวทางการจัดการ" section header to Live Analysis rules panel in ScanPage
- `Feature/ExpandedWasteRules/` — `.00` expand WASTE_RULES from 1–2 to 3–4 rules per material (reject/warning/info/dispose) for all 8 materials
- `Feature/FeatureInventory/` — `.00` create NowProject/FEATURES_AND_DATAFLOW.md covering all 26 features with Mermaid dataflows; update both READMEs
- `Feature/SupabaseEmailTemplates/` — `.00` custom branded HTML email templates (confirm-signup, reset-password, change-email, magic-link) + Supabase dashboard setup guide
- `Feature/ForgotPasswordFlow/` — `.00` full forgot-password + recovery flow in LoginPage: forgot / forgot-sent / reset modes, onAuthStateChange handler, i18n keys (EN + TH)
- `Feature/SqlAggregations/` — `.00` replace hardcoded stats with real Supabase queries on LandingPage (kg/฿ totals), fix DashboardPage revenue formula, fix AdminProfile counts, remove ×0.63 payout multiplier on HomePage
- `Feature/RealtimeIsolation/` — `.00` add shop_id filter to useRealtimeNotifications Realtime subscription + migration 009 for notifications table
- `Feature/NotificationPersistence/` — `.00` persist notifications to Supabase: load on mount, INSERT on arrival, sync read/dismiss back to DB
- `Feature/AdminDataPersistence/` — `.00` shop approval and moderation persistence: live pending shops, approve/reject write shops.status; flag/remove write marketplace_posts; migration 010 adds flagged column
- `Feature/SettingsExportPrefs/` — `.00` notification prefs persist to user_profiles JSONB; Export my data downloads JSON of scan_history + bookings; migration 011 adds notification_prefs column
- `Feature/AdminHeatmap/` — `.00` live scan-density Leaflet map in admin heatmap tab; GPS capture added to useScanInsert; migration 011 adds lat/lng to scan_history
- `Feature/MarketplaceCsvExport/` — `.00` replace CSV export toast stub with real Blob download of shopPricing data
- `Feature/LogisticsOnboardingMigrations/` — `.00` five Supabase SQL migrations (013–016 + 013b) for on-demand logistics, buyer onboarding, chat, admin training-image workflow, and rider location RLS
- `Feature/OnDemandLogistics/` — `.00` code scaffold (logisticsSlice, useRealtimeLogistics, RiderDashboardPage, UserTrackingPanel, ChatPage stub, BuyerOnboardingPage stub, App.jsx routes); `.01` planning documents (TASK_BREAKDOWN, SPRINT_PLAN, user-flow Section 10)
- `Feature/ChatFeature/` — real-time 1:1 chat between sellers and buyer shops via Supabase Realtime; chatSlice, useChat hook, ChatPage, migration 014_chat
- `Feature/M7Components/` — M7 shared UI components and milestone-7 deliverables
- `Feature/ScheduleCalendarSlotPopup/` — slot popup / detail modal on the SchedulePage calendar view
- `Feature/SmartRouteMap/` — smart multi-stop route optimisation overlay on MapPage (TSP + haversine)
