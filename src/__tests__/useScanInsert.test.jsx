import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { server } from '../test/server'
import { useScanInsert } from '../hooks/useScanInsert'
import userReducer from '../store/userSlice'

function makeStore(session = null) {
  return configureStore({
    reducer: { user: userReducer },
    preloadedState: { user: { session, profile: null, language: 'th', darkMode: false } },
  })
}

function wrap(store) {
  return ({ children }) => <Provider store={store}>{children}</Provider>
}

const fakeSession = { user: { id: 'u1' } }

describe('useScanInsert', () => {
  it('returns ok:true on successful insert', async () => {
    const store = makeStore(fakeSession)
    const { result } = renderHook(() => useScanInsert(), { wrapper: wrap(store) })

    let res
    await act(async () => {
      res = await result.current({ materialType: 'aluminum_can', weight: 1, confidence: 0.9, source: 'onnx' })
    })
    expect(res.ok).toBe(true)
  })

  it('returns ok:false when Supabase fails', async () => {
    server.use(
      http.post('*/rest/v1/scan_history*', () => HttpResponse.error())
    )
    const store = makeStore(fakeSession)
    const { result } = renderHook(() => useScanInsert(), { wrapper: wrap(store) })

    let res
    await act(async () => {
      res = await result.current({ materialType: 'aluminum_can', weight: 1 })
    })
    expect(res.ok).toBe(false)
    expect(res.error).toBeDefined()
  })

  it('returns undefined early when no session', async () => {
    const store = makeStore(null)
    const { result } = renderHook(() => useScanInsert(), { wrapper: wrap(store) })

    let res
    await act(async () => {
      res = await result.current({ materialType: 'aluminum_can', weight: 1 })
    })
    expect(res).toBeUndefined()
  })
})
