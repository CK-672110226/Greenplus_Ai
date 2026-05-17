# Fix-DesignAudit.07 — AdminPage AI Studio ONNX Upload

18 May 2026 (18 พฤษภาคม 2569)

## Overview

Added ONNX model upload option to the AI Studio tab in AdminPage. The tab now renders
a two-button toggle (Teachable Machine / ONNX Model) that gates which upload UI is shown.

## Reason

`aiConfigSlice` already carries `onnxStage1Url` and `onnxStage2Url` fields and the
inference pipeline consults them, but AdminPage had no UI to populate them. Admins could
only load Teachable Machine models from the browser; ONNX models required manual Redux
state manipulation.

A `modelType` field ('teachable-machine' | 'onnx') was also missing from the slice,
so the pipeline had no persisted signal for which backend was intended.

## Changes

### src/store/aiConfigSlice.js
- Added `modelType` field to `initialState` (default: `'teachable-machine'`), hydrated
  from `localStorage` alongside all other aiConfig fields via `saved.modelType`.
- `setAiConfig` (the existing generic action) handles writes — no new actions required.

### src/pages/AdminPage.jsx
- Extracted new `AiStudioTab` component (previously inline JSX inside `AdminPage`).
  Accepts `aiConfig` prop; calls `useT()`, `useDispatch()`, and `useRef()` internally.
- `AiStudioTab` renders:
  - Active version banner (unchanged from before)
  - **Backend Format toggle**: two adjacent buttons styled with ink borders;
    selected option gets `bg-[var(--green-soft)]` background per design spec.
  - **ONNX upload section** (visible when `modelType === 'onnx'`):
    - Hidden `<input type="file" accept=".onnx">` triggered by a styled button.
    - `<label>` describing the input.
    - Loaded-state feedback showing model name once `onnxStage1Url` is set.
    - Read-only display of `onnxStage2Url` if already present.
  - **ModelRegistrySection** (visible when `modelType === 'teachable-machine'`) — no
    changes to that component.
- `handleOnnxUpload` dispatches `setAiConfig({ modelType: 'onnx', onnxStage1Url: url,
  modelVersion: file.name })` using `URL.createObjectURL` to create an in-session URL.
- `handleSelectModelType` updates both local `useState` and Redux/localStorage via
  `setAiConfig({ modelType: type })`.

## Validation

- Lint: pass (0 errors / 0 warnings)
- Model type toggle shows TM section (ModelRegistrySection) vs ONNX file-upload section
  based on selection.
- ONNX upload dispatches `setAiConfig` with `modelType: 'onnx'`, `onnxStage1Url`, and
  `modelVersion` derived from filename.
- Selecting TM after ONNX dispatches `setAiConfig({ modelType: 'teachable-machine' })`
  and shows the full registry UI.

## Notes

- Only `setAiConfig` (the single generic action from `aiConfigSlice`) was used —
  no new slice actions were needed.
- `URL.createObjectURL` produces a session-scoped blob URL. A future task could upload
  the file to Supabase Storage and store a persistent URL in `onnxStage1Url` instead.
- `onnxStage2Url` display is read-only for now; a dedicated upload row can be added in
  a follow-up fix if a stage-2 ONNX cleanliness model is needed.
