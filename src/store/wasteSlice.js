import { createSlice } from '@reduxjs/toolkit'

const wasteSlice = createSlice({
  name: 'waste',
  initialState: {
    basket: [],
    lastScan: null,
  },
  reducers: {
    addToBasket:      (state, action) => { state.basket.push({ ...action.payload, skipped: false, scannedAt: new Date().toISOString() }) },
    removeFromBasket: (state, action) => { state.basket = state.basket.filter(i => i.id !== action.payload) },
    clearBasket:      (state)         => { state.basket = [] },
    setLastScan:      (state, action) => { state.lastScan = action.payload },
    updateWeight:     (state, action) => {
      const { id, weight } = action.payload
      const item = state.basket.find(i => i.id === id)
      if (item) item.weight = weight
    },
    toggleSkip:       (state, action) => {
      const item = state.basket.find(i => i.id === action.payload)
      if (item) item.skipped = !item.skipped
    },
  },
})

export const { addToBasket, removeFromBasket, clearBasket, setLastScan, updateWeight, toggleSkip } = wasteSlice.actions
export default wasteSlice.reducer
