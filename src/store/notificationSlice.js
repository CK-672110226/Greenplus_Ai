import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [] },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload
    },
    markRead: (state, action) => {
      const item = state.items.find(n => n.id === action.payload)
      if (item) item.read = true
    },
    markAllRead: (state) => {
      state.items.forEach(n => { n.read = true })
    },
    dismiss: (state, action) => {
      state.items = state.items.filter(n => n.id !== action.payload)
    },
    addNotification: (state, action) => {
      state.items.unshift({
        ...action.payload,
        id:        action.payload.id        ?? String(Date.now()),
        read:      action.payload.read      ?? false,
        createdAt: action.payload.createdAt ?? new Date().toISOString(),
      })
    },
  },
})

export const { setNotifications, markRead, markAllRead, dismiss, addNotification } = notificationSlice.actions
export const selectUnreadCount = s => s.notifications.items.filter(n => !n.read).length
export default notificationSlice.reducer
