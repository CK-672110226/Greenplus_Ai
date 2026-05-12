import { render } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import userReducer from '../../store/userSlice'
import wasteReducer from '../../store/wasteSlice'
import marketplaceReducer from '../../store/marketplaceSlice'

export function renderWithProviders(ui, {
  route = '/',
  preloadedState = {},
} = {}) {
  const store = configureStore({
    reducer: { user: userReducer, waste: wasteReducer, marketplace: marketplaceReducer },
    preloadedState,
  })

  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {ui}
        </MemoryRouter>
      </Provider>
    ),
    store,
  }
}
