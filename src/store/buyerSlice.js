import { createSlice } from '@reduxjs/toolkit'
import { WASTE_ITEMS } from '../data/wasteItems'

const ALL_MATERIALS = Object.keys(WASTE_ITEMS)

const STORAGE_KEY = 'buyer_settings'

const defaults = {
  openDays: [1, 2, 3, 4, 5, 6],
  acceptedMaterials: ALL_MATERIALS,
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw)
    return {
      openDays: Array.isArray(parsed.openDays) ? parsed.openDays : defaults.openDays,
      acceptedMaterials: Array.isArray(parsed.acceptedMaterials)
        ? parsed.acceptedMaterials
        : defaults.acceptedMaterials,
    }
  } catch {
    return defaults
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      openDays: state.openDays,
      acceptedMaterials: state.acceptedMaterials,
    }))
  } catch {
    // Storage unavailable (private mode / quota exceeded) — silently ignore
  }
}

const buyerSlice = createSlice({
  name: 'buyer',
  initialState: loadFromStorage(),
  reducers: {
    setOpenDays(state, action) {
      state.openDays = action.payload
      persist(state)
    },

    toggleMaterial(state, action) {
      const material = action.payload
      const idx = state.acceptedMaterials.indexOf(material)
      if (idx === -1) {
        state.acceptedMaterials.push(material)
      } else {
        state.acceptedMaterials.splice(idx, 1)
      }
      persist(state)
    },

    setAcceptedMaterials(state, action) {
      state.acceptedMaterials = action.payload
      persist(state)
    },
  },
})

export const { setOpenDays, toggleMaterial, setAcceptedMaterials } = buyerSlice.actions
export default buyerSlice.reducer
