import { createSlice } from '@reduxjs/toolkit'
import { WASTE_ITEMS, pricePerKg } from '../data/wasteItems'

function buildDefaultPrices() {
  const prices = {}
  Object.keys(WASTE_ITEMS).forEach(mat => {
    prices[mat] = pricePerKg(mat)
  })
  return prices
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('gp_pricing')
    if (raw) {
      const parsed = JSON.parse(raw)
      // Discard stale A/B/C or clean/dirty format — expect flat number per key
      const firstMat = Object.values(parsed)[0]
      if (firstMat?.A !== undefined || firstMat?.clean !== undefined) {
        localStorage.removeItem('gp_pricing')
        localStorage.removeItem('gp_pricing_savedAt')
        return null
      }
      return parsed
    }
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

export const { bulkSet, resetToDefault } = pricingSlice.actions
export default pricingSlice.reducer
