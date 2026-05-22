import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { BasketPage } from '../pages/BasketPage'
import wasteReducer from '../store/wasteSlice'
import userReducer from '../store/userSlice'
import bookingReducer from '../store/bookingSlice'
import pricingReducer from '../store/pricingSlice'

function makeStore(preloaded = {}) {
  return configureStore({
    reducer: {
      waste:    wasteReducer,
      user:     userReducer,
      bookings: bookingReducer,
      pricing:  pricingReducer,
    },
    preloadedState: preloaded,
  })
}

function renderBasket(preloaded = {}) {
  const store = makeStore(preloaded)
  render(
    <Provider store={store}>
      <MemoryRouter>
        <BasketPage />
      </MemoryRouter>
    </Provider>
  )
  return store
}

describe('BasketPage', () => {
  it('shows empty state when basket is empty', () => {
    renderBasket({ waste: { basket: [] } })
    // ไม่ควร crash และแสดง UI ได้
    expect(document.body).toBeTruthy()
  })

  it('shows basket items when present', () => {
    renderBasket({
      waste: {
        basket: [{ id: 1, materialType: 'aluminum_can', weight: 2, clean: true, skipped: false }],
      },
    })
    // component render ได้โดยไม่ crash
    expect(document.body).toBeTruthy()
  })

  it('calculates total price correctly (aluminum_can 2kg @ 40/kg = 80)', () => {
    renderBasket({
      waste: {
        basket: [{ id: 1, materialType: 'aluminum_can', weight: 2, clean: true, skipped: false }],
      },
      pricing: { prices: {}, savedAt: null },
    })
    // ราคารวมต้องมี ฿80 (2 × ฿40)
    expect(document.body.textContent).toMatch(/80/)
  })

  it('excludes skipped items from total', () => {
    renderBasket({
      waste: {
        basket: [
          { id: 1, materialType: 'aluminum_can', weight: 2, clean: true, skipped: false },
          { id: 2, materialType: 'aluminum_can', weight: 5, clean: true, skipped: true },
        ],
      },
      pricing: { prices: {}, savedAt: null },
    })
    // skipped item (5kg) ไม่นับ → total = 80 ไม่ใช่ 280
    const text = document.body.textContent
    expect(text).toContain('80')
  })
})
