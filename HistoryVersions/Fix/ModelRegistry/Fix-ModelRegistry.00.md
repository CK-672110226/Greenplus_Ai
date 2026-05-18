# Fix-ModelRegistry.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview

Model registry & deployment pipeline audit. Three bugs found and fixed — one of which made stage-1 model re-activation completely impossible in production, and another silently dropped all but one stage-2 model from Redux state on every activation.

## Reason

A full review of `useModelRegistry`, `useActiveModels`, and the `ModelRegistrySection` in `AdminPage` uncovered two silent correctness bugs (PostgREST null comparison, Redux state mutation) and one operational gap (no live propagation of activations to connected users).

## Bugs Fixed

### Bug 1 — `activateModel` stage-1 null comparison (CRITICAL)

**File:** `src/hooks/useModelRegistry.js`

**Root cause:** PostgREST `.eq('column', null)` translates to `WHERE column = null` in SQL, which never matches any row (SQL null equality requires `IS NULL`). The deactivation step for stage-1 models — where `materialType` is `null` — silently updated zero rows. On the immediately following INSERT, the unique index `model_deployments_one_active_idx` blocked the new row because the previous active deployment was still there, throwing a constraint violation.

**Effect:** Every attempt to re-activate a stage-1 model (or activate a second one) failed after the very first stage-1 model was ever registered. Rollback to a previous stage-1 version was impossible.

**Fix:**
```js
// Before (broken for null):
.eq('material_type', materialType ?? null)

// After (correct for null and non-null):
deactivateQ = materialType != null
  ? deactivateQ.eq('material_type', materialType)
  : deactivateQ.is('material_type', null)
```

### Bug 2 — Stage-2 activation wiped all other stage-2 models from Redux (HIGH)

**File:** `src/pages/AdminPage.jsx`

**Root cause:** `setAiConfig` uses `Object.assign(state, payload)`, so dispatching `{ tmStage2Urls: { [key]: url } }` replaced the entire `tmStage2Urls` object with a single-key object, dropping every other material's stage-2 model URL from the Redux store. On the next scan, all materials except the just-activated one would fail stage-2 cleanliness classification.

**Effect:** Activating any stage-2 model silently degraded all other materials to no stage-2 classification.

**Fix:**
```js
// Before (replaces entire object):
{ tmStage2Urls: { [file.material_type]: file.model_url } }

// After (merges into existing):
{ tmStage2Urls: { ...currentStage2, [file.material_type]: file.model_url } }
```

Added `const currentStage2 = useSelector(s => s.aiConfig.tmStage2Urls)` to `ModelRegistrySection`.

### Bug 3 — No live propagation of model activations (MEDIUM)

**File:** `src/hooks/useActiveModels.js`

**Root cause:** `load()` was called only once on mount with no mechanism to re-fetch when an admin activates a new model. All users (including the admin's own browser in other tabs) would only see the new model after a page refresh.

**Fix:** Refactored `load` to a `useCallback` and added a Supabase Realtime subscription on `model_deployments` INSERT events. When any new deployment row is inserted (i.e., a model is activated), all connected clients automatically re-fetch the active config:

```js
const channel = supabase
  .channel('model-deployments-live')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'model_deployments' }, load)
  .subscribe()
```

INSERT is used (not UPDATE/DELETE) because activating a model always inserts a new `model_deployments` row. The RLS policy allows reading `is_active = true` rows, and INSERT events for such rows are visible to subscribers.

## Files Changed

- `src/hooks/useModelRegistry.js` — fixed null comparison in `activateModel`
- `src/hooks/useActiveModels.js` — extracted `load` to `useCallback`, added Realtime subscription
- `src/pages/AdminPage.jsx` — added `currentStage2` selector, spread in `handleActivate` dispatch

## Validation

`npm run lint` — 0 errors, 0 warnings after all changes.

## Notes

- The Realtime subscription only fires on INSERT, not on the preceding UPDATE that flips `is_active: false`. This is intentional — RLS prevents subscribers from receiving UPDATE events on rows that become non-readable. The INSERT of the new active row is sufficient to trigger a re-fetch that returns the correct full state.
- Stage-2 model activation rollback now works correctly: clicking "Activate" on any previously-registered stage-2 model correctly deactivates the current active one and activates the selected one, without losing other materials' stage-2 URLs.
- Stage-1 rollback now works correctly: re-activating a previous stage-1 version correctly deactivates the current active stage-1 row before inserting the new one.
