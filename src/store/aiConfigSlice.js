import { createSlice } from '@reduxjs/toolkit'

const saved = JSON.parse(localStorage.getItem('gp_ai_config') || '{}')

const aiConfigSlice = createSlice({
  name: 'aiConfig',
  initialState: {
    model:               saved.model               ?? 'mock',
    apiKey:              saved.apiKey              ?? '',
    systemPrompt:        saved.systemPrompt        ?? 'You are a waste classification AI for Thai recycling shops. Analyze waste items and return JSON with: materialType, grade (A/B/C), estimatedWeight (kg), confidence (0-1), explanation.',
    confidenceThreshold: saved.confidenceThreshold ?? 0.7,
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
