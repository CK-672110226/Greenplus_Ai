# Feature-ProfileRealData.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Connected ProfilePage to real Supabase data, replacing hardcoded-zero lifetime stats and always-empty scan history. Wired BuyerProfile "Save materials" to persist to Supabase.

## Reason

User rule: ห้ามมี mock data. ProfilePage showed totalKg/totalValue/totalCo2 as 0 and always rendered the empty-basket message for scan history.

## Changes

### New: src/hooks/useScanHistory.js
Two parallel Supabase queries: aggregate (all rows) for lifetime totals; display (10 recent) for list.
Returns { scans, loading, totalKg, totalValue, totalCo2 }. Falls back to zeroed values on error.

### Updated: src/pages/ProfilePage.jsx
- UserProfile: real totals from useScanHistory(); skeleton rows while loading; bilingual empty state.
- BuyerProfile.handleSave: saves accepted_materials to user_profiles via Supabase update.

## Validation

npm run lint — clean. npm run build — built in 375ms.
