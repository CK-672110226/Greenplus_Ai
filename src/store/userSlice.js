import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: {
    session: null,
    profile: null,
    language: typeof navigator !== 'undefined' && navigator.language?.startsWith('th') ? 'th' : 'en',
    loading: true,
  },
  reducers: {
    setSession:  (state, action) => { state.session = action.payload; state.loading = false },
    setProfile:  (state, action) => { state.profile = action.payload },
    setLanguage: (state, action) => { state.language = action.payload },
    clearUser:   (state)         => { state.session = null; state.profile = null; state.loading = false },
  },
})

export const { setSession, setProfile, setLanguage, clearUser } = userSlice.actions
export default userSlice.reducer
