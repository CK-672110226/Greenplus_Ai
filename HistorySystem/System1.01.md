# System1.01 History

Date: 12 May 2026 (12 พฤษภาคม 2569)

## Overview

Updated repository AI workflow rules to use `Feature/Fix` history scopes instead of `Lab/Assignment` scope terminology.

## Reason

The project required change tracking language and structure to align with feature-driven and bugfix-driven work, rather than assignment-based naming.

## Changes

1. Updated `PROJECT_AI_WORKING_RULES.md`
   - Replaced assignment/lab-oriented rules with feature/fix-oriented rules.
   - Updated naming, planning, initialization, and scope correction sections.
   - Clarified practical convention to treat existing assignment files as legacy references.

2. Updated `HistoryVersions/README.md`
   - Switched canonical structure documentation to `Feature/<ScopeKey>/` and `Fix/<ScopeKey>/`.
   - Added note preserving existing assignment-numbered records as legacy history.

3. Added `HistorySystem/System1.01.md`
   - Recorded this system-level workflow update.

## Validation

- Reviewed updated markdown files for consistency with requested wording change.
- Confirmed no source-code/runtime behavior changes were introduced.

## Notes

- Existing `HistoryVersions/Assignment1/Assignment1.00.md` remains intact for audit preservation.
- Future implementation updates should use `Feature` or `Fix` scope folders.