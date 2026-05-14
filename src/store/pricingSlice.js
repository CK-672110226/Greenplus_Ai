import { createSlice } from '@reduxjs/toolkit'
import { WASTE_ITEMS, pricePerKg } from '../data/wasteItems'

function buildDefaultPrices() {
  const prices = {}
  Object.keys(WASTE_ITEMS).forEach(mat => {
    prices[mat] = {
      A: pricePerKg(mat, 'A'),
      B: pricePerKg(mat, 'B'),
      C: pricePerKg(mat, 'C'),
    }
  })
  return prices
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('gp_pricing')
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return null
}

const stored = loadFromStorage()

const pricingSlice = createSlice({
  name: 'pricing',
  initialState: {
    prices: stored ?? buildDefaultPrices(),
    savedAt: stored ? (localStorage.getItem('gp_pricing_savedAt') ?? null) : null,
  },
  reducers: {
    setPrice: (state, action) => {
      const { material, grade, value } = action.payload
      if (!state.prices[material]) state.prices[material] = {}
      state.prices[material][grade] = value
    },
    bulkSet: (state, action) => {
      state.prices = action.payload
      state.savedAt = new Date().toISOString()
      try {
        localStorage.setItem('gp_pricing', JSON.stringify(action.payload))
        localStorage.setItem('gp_pricing_savedAt', state.savedAt)
      } catch {
        // ignore
      }
    },
    resetToDefault: (state) => {
      state.prices = buildDefaultPrices()
      state.savedAt = null
      try {
        localStorage.setItem('gp_pricing', JSON.stringify(state.prices))
        localStorage.removeItem('gp_pricing_savedAt')
      } catch {
        // ignore
      }
    },
  },
})

export const { setPrice, bulkSet, resetToDefault } = pricingSlice.actions
export default pricingSlice.reducer
