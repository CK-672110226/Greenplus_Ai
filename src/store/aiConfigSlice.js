import { createSlice } from '@reduxjs/toolkit'

const saved = JSON.parse(localStorage.getItem('gp_ai_config') || '{}')

const aiConfigSlice = createSlice({
  name: 'aiConfig',
  initialState: {
    model:               saved.model               ?? 'mock',
    confidenceThreshold: saved.confidenceThreshold ?? 0.6,
    // YOLO ONNX — stage 1 object detection (highest priority)
    yoloStage1Url:       saved.yoloStage1Url       ?? '',
    yoloClassLabels:     saved.yoloClassLabels      ?? [],
    // TF.js / Teachable Machine — stage 1 fallback + stage 2 cleanliness
    tmStage1Url:         saved.tmStage1Url          ?? '',
    stage1ClassLabels:   saved.stage1ClassLabels    ?? [],
    tmStage2Urls:        saved.tmStage2Urls         ?? {},
    // ONNX classifier fallback
    onnxStage1Url:       saved.onnxStage1Url        ?? '',
    onnxStage2Url:       saved.onnxStage2Url        ?? '',
    // Active backend selector: 'teachable-machine' | 'onnx'
    modelType:           saved.modelType            ?? 'teachable-machine',
    modelVersion:        saved.modelVersion         ?? 'v0-mock',
  },
  reducers: {
    setAiConfig: (state, action) => {
      Object.assign(state, action.payload)
      localStorage.setItem('gp_ai_config', JSON.stringify({ ...state, ...action.payload }))
    },
  },
})

export const { setAiConfig } = aiConfigSlice.actions
export default aiConfigSlice.reducer
