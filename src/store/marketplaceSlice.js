import { createSlice } from '@reduxjs/toolkit'

const SEED_POSTS = [
  { id: 1, materialType: 'aluminum_can',     grade: 'A', qty: 50,  pricePerKg: 48,   shop: 'เฮียอ้วน รีไซเคิล',  distanceKm: 1.2, contact: '', flagged: false },
  { id: 2, materialType: 'copper',           grade: 'A', qty: 10,  pricePerKg: 240,  shop: 'แม่น้อย ของเก่า',     distanceKm: 2.5, contact: '', flagged: false },
  { id: 3, materialType: 'cardboard',        grade: 'B', qty: 200, pricePerKg: 3,    shop: 'ร้านบุญชู',            distanceKm: 0.8, contact: '', flagged: false },
  { id: 4, materialType: 'pet_bottle_clear', grade: 'A', qty: 80,  pricePerKg: 9.6,  shop: 'กรีน พอยท์ CM',       distanceKm: 3.1, contact: '', flagged: false },
  { id: 5, materialType: 'newspaper',        grade: 'B', qty: 100, pricePerKg: 2,    shop: 'ร้านลุงแดง',           distanceKm: 1.5, contact: '', flagged: false },
  { id: 6, materialType: 'mixed_plastic',    grade: 'C', qty: 300, pricePerKg: 3.5,  shop: 'นิรันดร์ รีไซเคิล',   distanceKm: 4.2, contact: '', flagged: false },
  { id: 7, materialType: 'glass',            grade: 'B', qty: 60,  pricePerKg: 1,    shop: 'ป้าแอน ของเก่า',       distanceKm: 2.0, contact: '', flagged: false },
  { id: 8, materialType: 'cooking_oil',      grade: 'A', qty: 25,  pricePerKg: 14.4, shop: 'ไบโอ ออยล์ CMU',      distanceKm: 5.6, contact: '', flagged: false },
]

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState: {
    posts:       SEED_POSTS,
    gradeFilter: 'all',
  },
  reducers: {
    addPost: (state, action) => {
      state.posts.unshift({ ...action.payload, id: Date.now(), flagged: false })
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter(p => p.id !== action.payload)
    },
    flagPost: (state, action) => {
      const p = state.posts.find(p => p.id === action.payload)
      if (p) p.flagged = !p.flagged
    },
    setGradeFilter: (state, action) => { state.gradeFilter = action.payload },
  },
})

export const { addPost, removePost, flagPost, setGradeFilter } = marketplaceSlice.actions
export default marketplaceSlice.reducer
