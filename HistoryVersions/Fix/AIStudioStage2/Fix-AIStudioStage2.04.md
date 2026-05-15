# Fix-AIStudioStage2.04

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Removed the entire mock training UI section from AI Studio and replaced the Model Registry with an auto-metadata-fetch workflow. Admin now pastes a Teachable Machine URL and the system auto-detects class labels by fetching `metadata.json` — no manual class entry needed.

## Reason

The folder-based training section (FolderCard, Stage2UploadRow, train/deploy buttons) was mock/prototype UI that served no real function. All actual model training happens in Teachable Machine externally. Keeping this code created confusion and dead weight. The new Model Registry is also self-sufficient — it no longer needs the `folders` prop since class detection is driven by the TM model URL.

## Changes

### `src/pages/AdminPage.jsx`

**Removed components:** `FolderCard`, `NewFolderDialog`, `Stage2UploadRow`

**Removed state:** `folders`, `showNewFolder`, `classImages`, `uploadingClass`, `stage2Counts`, `uploadingStage2`, `trainProgress`, `trainPhase`, `trainedVersion`, `trainTimer`

**Removed functions:** `handleStage1Files`, `handleStage2Files`, `handleTrain`, `handleDeploy`, `handleAddFolder`, `handleRemoveFolder`, `handleExportManifest`, `loadCounts` useEffect

**Removed imports:** `useEffect`, `useCallback`, `supabase`, `setLabel`, `removeLabel`, `session` selector

**Added `fetchTmMetadata(modelUrl)`** — async helper that replaces `model.json` → `metadata.json` in the URL, fetches it, and returns the `labels` or `classLabels` array. Returns `null` on any error (silent — admin can still register without labels).

**Rewrote `ModelRegistrySection`** as a self-contained component (no `folders` prop):
- Stage 2 material dropdown: `[...new Set(stage1Files.flatMap(f => f.class_labels ?? []))]` — derived from registered Stage 1 models, no manual folder list needed
- Auto-fetch on URL paste: 700ms debounce; shows "X classes detected" + label preview below the input; warns if metadata cannot be fetched
- `detectedLabels` state passed to `registerModelUrl` as `classLabels` on save

**Studio tab** simplified to: active model version card + `<ModelRegistrySection />` only.

## Validation

- `npm run lint` passes with 0 errors, 0 warnings
- Verified in browser: Stage 1 URL paste → metadata.json auto-fetched → labels displayed → register saves correctly

## Notes

Teachable Machine always publishes `metadata.json` at the same base URL as `model.json`. The auto-fetch pattern is reliable as long as the TM project is public (shareable link).
