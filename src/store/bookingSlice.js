import { createSlice } from '@reduxjs/toolkit'

const SEED = [
  { id: 1, shopId: 1, shopName: 'เฮียอ้วน รีไซเคิล', seller: 'ณัฐวุฒิ ใจดี',  materials: ['aluminum_can'],    totalKg: 12, estValue: 576,  status: 'pending',  createdAt: '2026-05-14T08:00:00Z' },
  { id: 2, shopId: 3, shopName: 'ร้านบุญชู',           seller: 'สุภาพร แสนสุข', materials: ['cardboard'],       totalKg: 30, estValue: 90,   status: 'pending',  createdAt: '2026-05-14T09:00:00Z' },
  { id: 3, shopId: 2, shopName: 'แม่น้อย ของเก่า',     seller: 'ธนกร มีสุข',    materials: ['copper'],          totalKg: 5,  estValue: 1200, status: 'accepted', createdAt: '2026-05-13T10:00:00Z' },
  { id: 4, shopId: 1, shopName: 'เฮียอ้วน รีไซเคิล', seller: 'กัญญา รักดี',   materials: ['pet_bottle_clear'],totalKg: 18, estValue: 173,  status: 'accepted', createdAt: '2026-05-13T11:00:00Z' },
  { id: 5, shopId: 3, shopName: 'ร้านบุญชู',           seller: 'ประเสริฐ งาม',  materials: ['mixed_plastic'],   totalKg: 40, estValue: 200,  status: 'rejected', createdAt: '2026-05-12T14:00:00Z' },
]

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: { bookings: SEED },
  reducers: {
    addBooking: (state, action) => {
      state.bookings.unshift({ ...action.payload, id: Date.now(), status: 'pending', createdAt: new Date().toISOString() })
    },
    updateStatus: (state, action) => {
      const b = state.bookings.find(b => b.id === action.payload.id)
      if (b) b.status = action.payload.status
    },
  },
})

export const { addBooking, updateStatus } = bookingSlice.actions
export default bookingSlice.reducer
