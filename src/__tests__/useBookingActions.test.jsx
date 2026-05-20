import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { server } from '../test/server'
import { useBookingActions } from '../hooks/useBookingActions'
import bookingReducer from '../store/bookingSlice'
import userReducer from '../store/userSlice'

function makeStore(preloaded = {}) {
  return configureStore({
    reducer: { bookings: bookingReducer, user: userReducer },
    preloadedState: preloaded,
  })
}

function wrapper(store) {
  return function Wrap({ children }) {
    return <Provider store={store}>{children}</Provider>
  }
}

describe('useBookingActions', () => {
  it('returns ok:true when Supabase succeeds', async () => {
    const store = makeStore({ bookings: { bookings: [{ id: 'b1', status: 'pending' }] } })
    const { result } = renderHook(() => useBookingActions(), { wrapper: wrapper(store) })

    let res
    await act(async () => {
      res = await result.current.updateStatus('b1', 'accepted')
    })
    expect(res.ok).toBe(true)
  })

  it('rolls back Redux state when Supabase fails', async () => {
    server.use(
      http.patch('*/rest/v1/bookings*', () => HttpResponse.error())
    )
    const store = makeStore({ bookings: { bookings: [{ id: 'b1', status: 'pending' }] } })
    const { result } = renderHook(() => useBookingActions(), { wrapper: wrapper(store) })

    let res
    await act(async () => {
      res = await result.current.updateStatus('b1', 'accepted')
    })

    expect(res.ok).toBe(false)
    expect(res.error).toBeDefined()
    // status ต้องกลับเป็น pending (rollback)
    expect(store.getState().bookings.bookings[0].status).toBe('pending')
  })

  it('updates status to accepted after successful call', async () => {
    const store = makeStore({ bookings: { bookings: [{ id: 'b1', status: 'pending' }] } })
    const { result } = renderHook(() => useBookingActions(), { wrapper: wrapper(store) })

    await act(async () => {
      await result.current.updateStatus('b1', 'accepted')
    })
    expect(store.getState().bookings.bookings[0].status).toBe('accepted')
  })
})
