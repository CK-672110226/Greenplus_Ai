import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: {
    session: null,
    profile: null,
    language: typeof navigator !== 'undefined' && navigator.language?.startsWith('th') ? 'th' : 'en',
    loading: true,
    darkMode: localStorage.getItem('gp_dark') === '1',
  },
  reducers: {
    setSession:    (state, action) => { state.session = action.payload; state.loading = false },
    setProfile:    (state, action) => { state.profile = action.payload },
    setLanguage:   (state, action) => { state.language = action.payload },
    clearUser:     (state)         => { state.session = null; state.profile = null; state.loading = false },
    toggleDarkMode:(state)         => {
      state.darkMode = !state.darkMode
      localStorage.setItem('gp_dark', state.darkMode ? '1' : '0')
    },
  },
})

export const { setSession, setProfile, setLanguage, clearUser, toggleDarkMode } = userSlice.actions
export default userSlice.reducer
