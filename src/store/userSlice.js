import { createSlice } from '@reduxjs/toolkit'

function resolveInitialDarkMode() {
  const stored = localStorage.getItem('gp_dark')
  if (stored !== null) return stored === '1'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function resolveInitialLanguage() {
  const stored = localStorage.getItem('gp_language')
  if (stored === 'th' || stored === 'en') return stored
  return typeof navigator !== 'undefined' && navigator.language?.startsWith('th') ? 'th' : 'en'
}

const userSlice = createSlice({
  name: 'user',
  initialState: {
    session: null,
    profile: null,
    language: resolveInitialLanguage(),
    loading: true,
    darkMode: resolveInitialDarkMode(),
  },
  reducers: {
    setSession:    (state, action) => { state.session = action.payload; state.loading = false },
    setProfile:    (state, action) => { state.profile = action.payload },
    setLanguage:   (state, action) => { state.language = action.payload; localStorage.setItem('gp_language', action.payload) },
    clearUser:     (state)         => { state.session = null; state.profile = null; state.loading = false },
    setDarkMode:   (state, action) => { state.darkMode = action.payload },
    toggleDarkMode:(state)         => { state.darkMode = !state.darkMode },
  },
})

export const { setSession, setProfile, setLanguage, clearUser, setDarkMode, toggleDarkMode } = userSlice.actions
export default userSlice.reducer
