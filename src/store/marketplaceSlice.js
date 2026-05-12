import { createSlice } from '@reduxjs/toolkit'

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState: {
    posts: [],
    gradeFilter: null,
    bookingQueue: [],
  },
  reducers: {
    setPosts:       (state, action) => { state.posts = action.payload },
    setGradeFilter: (state, action) => { state.gradeFilter = action.payload },
    setBookingQueue:(state, action) => { state.bookingQueue = action.payload },
  },
})

export const { setPosts, setGradeFilter, setBookingQueue } = marketplaceSlice.actions
export default marketplaceSlice.reducer
