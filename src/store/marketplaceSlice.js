import { createSlice } from '@reduxjs/toolkit'

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState: {
    posts:       [],
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
    setPosts: (state, action) => {
      state.posts = action.payload
    },
  },
})

export const { addPost, removePost, flagPost, setGradeFilter, setPosts } = marketplaceSlice.actions
export default marketplaceSlice.reducer
