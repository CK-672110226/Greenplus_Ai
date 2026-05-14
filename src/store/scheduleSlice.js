import { createSlice } from '@reduxjs/toolkit'

const SEED = [
  { id: 1, time: '09:00', seller: 'ณัฐวุฒิ ใจดี',  materials: ['aluminum_can'],     totalKg: 12, estValue: 576,  status: 'confirmed', phone: '081-234-5678', address: '12 ถ.นิมมานฯ' },
  { id: 2, time: '10:30', seller: 'สุภาพร แสนสุข', materials: ['cardboard'],        totalKg: 30, estValue: 90,   status: 'confirmed', phone: '082-345-6789', address: '55 ถ.วัวลาย' },
  { id: 3, time: '13:00', seller: 'ธนกร มีสุข',    materials: ['copper'],           totalKg: 5,  estValue: 1200, status: 'pending',   phone: '083-456-7890', address: '7 ซ.หนองหอย' },
  { id: 4, time: '14:30', seller: 'กัญญา รักดี',   materials: ['pet_bottle_clear'], totalKg: 18, estValue: 173,  status: 'pending',   phone: '084-567-8901', address: '23 ถ.ช้างเผือก' },
  { id: 5, time: '16:00', seller: 'ประเสริฐ งาม',  materials: ['mixed_plastic'],    totalKg: 40, estValue: 200,  status: 'completed', phone: '085-678-9012', address: '1 ถ.สุเทพ' },
]

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: { slots: SEED },
  reducers: {
    confirmSlot: (state, action) => {
      const slot = state.slots.find(s => s.id === action.payload)
      if (slot) slot.status = 'confirmed'
    },
    cancelSlot: (state, action) => {
      const slot = state.slots.find(s => s.id === action.payload)
      if (slot) slot.status = 'cancelled'
    },
    completeSlot: (state, action) => {
      const slot = state.slots.find(s => s.id === action.payload)
      if (slot) slot.status = 'completed'
    },
    addSlot: (state, action) => {
      state.slots.push({ ...action.payload, id: Date.now() })
    },
    rescheduleSlot: (state, action) => {
      const slot = state.slots.find(s => s.id === action.payload.id)
      if (slot) slot.time = action.payload.time
    },
  },
})

export const { confirmSlot, cancelSlot, completeSlot, addSlot, rescheduleSlot } = scheduleSlice.actions
export default scheduleSlice.reducer
