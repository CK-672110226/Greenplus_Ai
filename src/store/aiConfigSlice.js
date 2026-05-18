import { createSlice } from '@reduxjs/toolkit'

const saved = JSON.parse(localStorage.getItem('gp_ai_config') || '{}')

// Fields excluded from localStorage persistence (sensitive / session-only)
const TRANSIENT_FIELDS = ['vertexAccessToken']

const aiConfigSlice = createSlice({
  name: 'aiConfig',
  initialState: {
    model:                saved.model                ?? 'mock',
    confidenceThreshold:  saved.confidenceThreshold  ?? 0.6,
    // YOLO ONNX — stage 1 object detection (highest priority)
    yoloStage1Url:        saved.yoloStage1Url        ?? '',
    yoloClassLabels:      saved.yoloClassLabels      ?? [],
    // TF.js / Teachable Machine — stage 1 fallback + stage 2 cleanliness
    tmStage1Url:          saved.tmStage1Url          ?? '',
    stage1ClassLabels:    saved.stage1ClassLabels    ?? [],
    tmStage2Urls:         saved.tmStage2Urls         ?? {},
    // ONNX classifier fallback
    onnxStage1Url:        saved.onnxStage1Url        ?? '',
    onnxStage2Url:        saved.onnxStage2Url        ?? '',
    // Active backend selector: 'teachable-machine' | 'onnx'
    modelType:            saved.modelType            ?? 'teachable-machine',
    modelVersion:         saved.modelVersion         ?? 'v0-mock',
    // Vertex AI (fallback) — vertexAccessToken is session-only, never persisted
    vertexProjectId:      saved.vertexProjectId      ?? '',
    vertexLocation:       saved.vertexLocation       ?? 'us-central1',
    vertexAccessToken:    '',
    vertexStage1Endpoint: saved.vertexStage1Endpoint ?? '',
    vertexStage2Endpoint: saved.vertexStage2Endpoint ?? '',
  },
  reducers: {
    setAiConfig: (state, action) => {
      Object.assign(state, action.payload)
      const persisted = Object.fromEntries(
        Object.entries({ ...state, ...action.payload })
          .filter(([k]) => !TRANSIENT_FIELDS.includes(k))
      )
      localStorage.setItem('gp_ai_config', JSON.stringify(persisted))
    },
  },
})

export const { setAiConfig } = aiConfigSlice.actions
export default aiConfigSlice.reducer
