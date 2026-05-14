import { createSlice } from '@reduxjs/toolkit'

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: { slots: [] },
  reducers: {
    setSlots: (state, action) => {
      state.slots = action.payload
    },
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
    confirmSlot: (state, action) => {
      const slot = state.slots.find(s => s.id === action.payload)
      if (slot) slot.status = 'confirmed'
    },
    cancelSlot: (state, action) => {
      const slot = state.slots.find(s => s.id === action.payload)
      if (slot) slot.status = 'cancelled'
    },
    completeSlot: (state, action) => {
      const slot = state.slots.find(s => s.id === action.payload)
      if (slot) slot.status = 'completed'
    },
  },
})

export const { setSlots, addSlot, updateSlot, removeSlot, confirmSlot, cancelSlot, completeSlot } = scheduleSlice.actions
export default scheduleSlice.reducer
