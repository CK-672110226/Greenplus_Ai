import { createSlice } from '@reduxjs/toolkit'

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: { slots: [] },
  reducers: {
    addSlot: (state, action) => {
      state.slots.push(action.payload)
    },
    updateSlot: (state, action) => {
      const s = state.slots.find(s => s.id === action.payload.id)
      if (s) Object.assign(s, action.payload)
    },
    removeSlot: (state, action) => {
      state.slots = state.slots.filter(s => s.id !== action.payload)
    },
    setSlots: (state, action) => {
      state.slots = action.payload
    },
  },
})

export const { addSlot, updateSlot, removeSlot, setSlots } = scheduleSlice.actions
export default scheduleSlice.reducer
