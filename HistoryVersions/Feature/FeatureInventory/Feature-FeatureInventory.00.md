# Feature-FeatureInventory.00

16 May 2026 (16 พฤษภาคม 2569)

## Overview

Create `NowProject/FEATURES_AND_DATAFLOW.md` — a single comprehensive reference file
listing every feature in the project with status, description, and Mermaid dataflow
diagrams. Also update both README files for accuracy.

## Reason

The project had no central document mapping all features in one place. The
HistoryVersions README was missing the Feature/SupabaseRealtime scope. The main README
still referenced Grade A/B/C pricing (replaced by Clean/Dirty in PR #36) and omitted
features added in PRs #38–#40.

## Changes

### `NowProject/FEATURES_AND_DATAFLOW.md` (new file)

Single MD file covering:
- System architecture Mermaid diagram
- 19 detailed feature entries each with status, description, and Mermaid dataflow
- 6 missing/not-started features listed
- Complete feature status table (25 rows)
- Redux slice summary table
- Supabase table access map

### `HistoryVersions/README.md`

- Added `Feature/SupabaseRealtime/` scope entry
- Updated `Feature/ExpandedWasteRules/` note to include `dispose` severity level

### `README.md`

- Key Features: updated "Grade A / B / C" → "Clean / Dirty" in scanner description
- Key Features: added Live Booking Notifications and Waste Handling Rules bullets
- Database Schema: updated `waste_items` columns
- Pricing Reference: replaced Grade A/B/C table with Clean/Dirty two-level system

## Validation

- All files lint-clean (no JSX or JS modified)
- Mermaid syntax follows standard flowchart/sequenceDiagram spec
- All features cross-referenced against actual page files and Redux slices

## Notes

- `NowProject/` folder at repo root — documentation, not source code
