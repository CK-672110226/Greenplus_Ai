import { createSlice } from '@reduxjs/toolkit'

const logisticsSlice = createSlice({
  name: 'logistics',
  initialState: {
    activeBooking: null,   // seller's active on-demand booking
    nearbyOrders:  [],     // rider's visible searching orders (within 5km)
    riderLocation: null,   // { lat, lng } of rider tracking seller's booking
    isOnline:      false,  // rider's online toggle state
  },
  reducers: {
    setActiveBooking: (state, action) => {
      state.activeBooking = action.payload
    },
    setNearbyOrders: (state, action) => {
      state.nearbyOrders = typeof action.payload === 'function'
        ? action.payload(state.nearbyOrders)
        : action.payload
    },
    setRiderLocation: (state, action) => {
      state.riderLocation = action.payload
    },
    setIsOnline: (state, action) => {
      state.isOnline = action.payload
    },
    clearActiveBooking: (state) => {
      state.activeBooking = null
      state.riderLocation = null
    },
  },
})

export const {
  setActiveBooking,
  setNearbyOrders,
  setRiderLocation,
  setIsOnline,
  clearActiveBooking,
} = logisticsSlice.actions

export default logisticsSlice.reducer
