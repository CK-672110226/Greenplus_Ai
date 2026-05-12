import { createSlice } from '@reduxjs/toolkit'

const wasteSlice = createSlice({
  name: 'waste',
  initialState: {
    basket: [],
    lastScan: null,
  },
  reducers: {
    addToBasket:    (state, action) => { state.basket.push(action.payload) },
    removeFromBasket: (state, action) => { state.basket.splice(action.payload, 1) },
    clearBasket:    (state)         => { state.basket = [] },
    setLastScan:    (state, action) => { state.lastScan = action.payload },
  },
})

export const { addToBasket, removeFromBasket, clearBasket, setLastScan } = wasteSlice.actions
export default wasteSlice.reducer
