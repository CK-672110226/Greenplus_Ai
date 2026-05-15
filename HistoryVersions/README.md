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
- `Fix/AIStudioStage2/` — `.00` multi-object YOLO detection returning full array + concurrent stage-2 per detection
