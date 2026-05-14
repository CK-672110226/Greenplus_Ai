import { createSlice } from '@reduxjs/toolkit'

function resolveInitialDarkMode() {
  const stored = localStorage.getItem('gp_dark')
  if (stored !== null) return stored === '1'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

const userSlice = createSlice({
  name: 'user',
  initialState: {
    session: null,
    profile: null,
    language: typeof navigator !== 'undefined' && navigator.language?.startsWith('th') ? 'th' : 'en',
    loading: true,
    darkMode: resolveInitialDarkMode(),
  },
  reducers: {
    setSession:    (state, action) => { state.session = action.payload; state.loading = false },
    setProfile:    (state, action) => { state.profile = action.payload },
    setLanguage:   (state, action) => { state.language = action.payload },
    clearUser:     (state)         => { state.session = null; state.profile = null; state.loading = false },
    setDarkMode:   (state, action) => { state.darkMode = action.payload },
    toggleDarkMode:(state)         => {
      state.darkMode = !state.darkMode
      localStorage.setItem('gp_dark', state.darkMode ? '1' : '0')
    },
  },
})

export const { setSession, setProfile, setLanguage, clearUser, setDarkMode, toggleDarkMode } = userSlice.actions
export default userSlice.reducer
