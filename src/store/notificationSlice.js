import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [] },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload)
    },
    removeNotification: (state, action) => {
      state.items = state.items.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.items = []
    },
  },
})

export const { addNotification, removeNotification, clearNotifications } = notificationSlice.actions
export default notificationSlice.reducer
