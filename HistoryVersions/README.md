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
- `Fix/AIStudioStage2/` — `.00` multi-object YOLO detection returning full array + concurrent stage-2 per detection
- `Fix/MapPageNavigation/` — `.00` replace directions `<a href>` with `window.open` button for iOS Leaflet popup compatibility
- `Fix/PricingCleanDirty/` — `.00` remove A/B/C grades; replace with two-level Clean/Dirty pricing system
- `Fix/LocalModelsSlugKeys/` — `.00` change YOLO + TM class label arrays from Thai strings to WASTE_ITEMS English slug keys so pricePerKg() lookups return correct prices
