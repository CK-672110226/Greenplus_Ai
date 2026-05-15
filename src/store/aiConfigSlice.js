import { createSlice } from '@reduxjs/toolkit'

const saved = JSON.parse(localStorage.getItem('gp_ai_config') || '{}')

const aiConfigSlice = createSlice({
  name: 'aiConfig',
  initialState: {
    model:                saved.model                ?? 'mock',
    apiKey:               saved.apiKey               ?? '',
    systemPrompt:         saved.systemPrompt         ?? 'You are a waste classification AI for Thai recycling shops. Analyze waste items and return JSON with: materialType, grade (A/B/C), estimatedWeight (kg), confidence (0-1), explanation.',
    confidenceThreshold:  saved.confidenceThreshold  ?? 0.6,
    // TF.js / Teachable Machine models (takes priority over ONNX)
    tmStage1Url:          saved.tmStage1Url          ?? '',   // model.json URL for material classifier
    stage1ClassLabels:    saved.stage1ClassLabels    ?? [],   // string[] matching TM output nodes
    tmStage2Urls:         saved.tmStage2Urls         ?? {},   // { [materialType]: modelJsonUrl }
    // ONNX models (fallback)
    onnxStage1Url:        saved.onnxStage1Url        ?? '',
    onnxStage2Url:        saved.onnxStage2Url        ?? '',
    modelVersion:         saved.modelVersion         ?? 'v0-mock',
    // Vertex AI (fallback)
    vertexProjectId:      saved.vertexProjectId      ?? '',
    vertexLocation:       saved.vertexLocation       ?? 'us-central1',
    vertexAccessToken:    saved.vertexAccessToken    ?? '',
    vertexStage1Endpoint: saved.vertexStage1Endpoint ?? '',
    vertexStage2Endpoint: saved.vertexStage2Endpoint ?? '',
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
