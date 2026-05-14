import { createSlice } from '@reduxjs/toolkit'

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: { bookings: [] },
  reducers: {
    addBooking: (state, action) => {
      state.bookings.unshift({ ...action.payload, id: Date.now(), status: 'pending', createdAt: new Date().toISOString() })
    },
    updateStatus: (state, action) => {
      const b = state.bookings.find(b => b.id === action.payload.id)
      if (b) b.status = action.payload.status
    },
    setBookings: (state, action) => {
      state.bookings = action.payload
    },
  },
})

export const { addBooking, updateStatus, setBookings } = bookingSlice.actions
export default bookingSlice.reducer
