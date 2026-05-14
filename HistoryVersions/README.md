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

- `Feature/GitIgnoreHygiene/` (baseline: `Feature-GitIgnoreHygiene.00.md`)
- `Feature/SupabaseConnect/` (baseline: `Feature-SupabaseConnect.00.md`)
- `Feature/ProjectSetup/` (baseline: `Feature-ProjectSetup.00.md`)
- `Feature/DesignSystem/` (baseline: `Feature-DesignSystem.00.md`)
- `Feature/AuthRoles/` (baseline: `Feature-AuthRoles.00.md`)
- `Feature/TechStack/` (baseline: `Feature-TechStack.00.md`)
- `Feature/WasteData/` (baseline: `Feature-WasteData.00.md`) — waste material data layer, pricing, localization
- `Feature/AiScannerMvp/` (baseline: `Feature-AiScannerMvp.00.md`) — M3 AI Scanner page, wasteSlice updates
- `Feature/Basket/` (baseline: `Feature-Basket.00.md`) — M3 Basket page extension
- `Feature/Marketplace/` (baseline: `Feature-Marketplace.00.md`) — M4 Marketplace listings page
- `Feature/SmartMap/` (baseline: `Feature-SmartMap.00.md`) — M5 Leaflet map with shop markers
- `Feature/BuyerDashboard/` (baseline: `Feature-BuyerDashboard.00.md`) — M6 Buyer dashboard with stats and bookings
- `Feature/AdminPanel/` (baseline: `Feature-AdminPanel.00.md`) — M7 Admin panel with Shops, Heatmap, AI Model Config tabs; `.01` AI Suite (C-06/07/10/12)
- `Feature/SecondBrain/` (baseline: `Feature-SecondBrain.00.md`) — M8 Second Brain AI service + aiConfigSlice
- `Feature/EcoPoints/` (baseline: `Feature-EcoPoints.00.md`) — M9 EcoPoints page with tiers and rewards
- `Feature/CICD/` (baseline: `Feature-CICD.00.md`) — GitHub Actions CI/CD workflows
- `Feature/Tests/` (baseline: `Feature-Tests.00.md`) — Vitest unit tests for wasteItems and secondBrain
- `Feature/ProfilePages/` (baseline: `Feature-ProfilePages.00.md`) — M3b role-aware profile pages (User/Buyer/Admin)
- `Feature/BasketRouting/` (baseline: `Feature-BasketRouting.00.md`) — U-11/U-12/U-13 Single Shop + Multi-Stop route planning
- `Feature/PilotLaunch/` (baseline: `Feature-PilotLaunch.00.md`) — M10 Supabase schema, seed data, Vercel config, dark mode, pricing CRUD
- `Feature/AuthRoles/` — now at `.03`: `.02` login overhaul; `.03` C-03 user portal — SmartLayout, UserLayout (TopBar+BottomTabBar), HomePage
- `Fix/CICD/` (baseline: `Fix-CICD.00.md`) — PR Preview 403 fix (permissions block + return await), CI artifact name dedup
- `Feature/PageDesign/` (baseline: `Feature-PageDesign.00.md`) — Wireframe design applied: HomePage hatch chart + KPIs, EcoPoints 4-tier table + timeline, ProfilePage impact grid, SettingsPage sections, LoginPage smart auth + Google moved below form
- `Feature/PageDesign/` `.01` — Font loading fix (HTML link vs CSS @import), SectionDivider label-left alignment, KpiCard 32px, PRD Section 5 expanded
- `Feature/PageDesign/` `.02` — Logo wordmark (GreenPlus + Ai superscript), LandingPage hero redesign, LoginPage wireframe order (OAuth first, eye icon, remember me), AdminLoginPage dark restricted style
- `Feature/PageDesign/` `.03` — Basket earnings bug fix (estValue→pricePerKg×weight), route-level lazy loading, Vite chunk splitting (vendor/supabase/onnx)
