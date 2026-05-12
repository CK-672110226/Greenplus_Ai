import { createSlice } from '@reduxjs/toolkit'

const wasteSlice = createSlice({
  name: 'waste',
  initialState: {
    basket: [],    // [{ id, name, materialType, grade, weight, pricePerKg, skipped }]
    lastScan: null,
  },
  reducers: {
    addToBasket: (state, action) => {
      state.basket.push({ ...action.payload, skipped: false })
    },
    removeFromBasket: (state, action) => {
      state.basket = state.basket.filter(item => item.id !== action.payload)
    },
    updateWeight: (state, action) => {
      const { id, weight } = action.payload
      const item = state.basket.find(i => i.id === id)
      if (item) item.weight = weight
    },
    toggleSkip: (state, action) => {
      const item = state.basket.find(i => i.id === action.payload)
      if (item) item.skipped = !item.skipped
    },
    clearBasket: (state) => { state.basket = [] },
    setLastScan: (state, action) => { state.lastScan = action.payload },
  },
})

export const { addToBasket, removeFromBasket, updateWeight, toggleSkip, clearBasket, setLastScan } = wasteSlice.actions
export default wasteSlice.reducer
