import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'gp_custom_labels'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  catch { return {} }
}

const customLabelsSlice = createSlice({
  name: 'customLabels',
  initialState: load(),
  reducers: {
    setLabel(state, { payload: { key, th, en } }) {
      state[key] = { th: th || key, en: en || key }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state }))
    },
    removeLabel(state, { payload: key }) {
      delete state[key]
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state }))
    },
  },
})

export const { setLabel, removeLabel } = customLabelsSlice.actions
export default customLabelsSlice.reducer
