import { createSlice } from '@reduxjs/toolkit'

const SEED = [
  { id: 1, type: 'new_order',       title: 'New booking request', body: 'ณัฐวุฒิ ใจดี wants to sell 12kg aluminum cans',   read: false, createdAt: '2026-05-14T08:05:00Z' },
  { id: 2, type: 'new_order',       title: 'New booking request', body: 'สุภาพร แสนสุข wants to sell 30kg cardboard',       read: false, createdAt: '2026-05-14T09:15:00Z' },
  { id: 3, type: 'price_alert',     title: 'Copper price up +8%', body: 'Market rate for copper rose to ฿217/kg today',     read: false, createdAt: '2026-05-14T07:00:00Z' },
  { id: 4, type: 'order_completed', title: 'Pickup completed',    body: 'ประเสริฐ งาม — 40kg mixed plastic received',       read: true,  createdAt: '2026-05-13T16:10:00Z' },
  { id: 5, type: 'system',          title: 'Platform update',     body: 'Greenplus v0.5 — Schedule page now live',           read: true,  createdAt: '2026-05-13T10:00:00Z' },
]

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: SEED },
  reducers: {
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
      state.items.unshift({ ...action.payload, id: Date.now(), read: false, createdAt: new Date().toISOString() })
    },
  },
})

export const { markRead, markAllRead, dismiss, addNotification } = notificationSlice.actions
export const selectUnreadCount = s => s.notifications.items.filter(n => !n.read).length
export default notificationSlice.reducer
