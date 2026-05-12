import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../../store/userSlice'
import { useT } from '../../hooks/useT'

function makeStore(language) {
  return configureStore({
    reducer: { user: userReducer },
    preloadedState: { user: { session: null, profile: null, loading: false, language } },
  })
}

const wrapper = (language) => ({ children }) => (
  <Provider store={makeStore(language)}>{children}</Provider>
)

describe('useT', () => {
  it('returns English strings when language is en', () => {
    const { result } = renderHook(() => useT(), { wrapper: wrapper('en') })
    expect(result.current.signIn).toBe('Sign In')
    expect(result.current.scan).toBe('Scan')
  })

  it('returns Thai strings when language is th', () => {
    const { result } = renderHook(() => useT(), { wrapper: wrapper('th') })
    expect(result.current.signIn).toBe('เข้าสู่ระบบ')
    expect(result.current.scan).toBe('สแกน')
  })

  it('falls back to English for unknown language', () => {
    const { result } = renderHook(() => useT(), { wrapper: wrapper('jp') })
    expect(result.current.signIn).toBe('Sign In')
  })
})
