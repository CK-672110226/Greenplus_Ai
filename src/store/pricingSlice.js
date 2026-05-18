import { createSlice } from '@reduxjs/toolkit'
import { WASTE_ITEMS, pricePerKg } from '../data/wasteItems'

function buildDefaultPrices() {
  const prices = {}
  Object.keys(WASTE_ITEMS).forEach(mat => {
    prices[mat] = pricePerKg(mat)
  })
  return prices
}

const pricingSlice = createSlice({
  name: 'pricing',
  initialState: {
    prices: buildDefaultPrices(),
    savedAt: null,
  },
  reducers: {
    bulkSet: (state, action) => {
      state.prices = action.payload
      state.savedAt = new Date().toISOString()
    },
    resetToDefault: (state) => {
      state.prices = buildDefaultPrices()
      state.savedAt = null
    },
  },
})

export const { bulkSet, resetToDefault } = pricingSlice.actions
export default pricingSlice.reducer
