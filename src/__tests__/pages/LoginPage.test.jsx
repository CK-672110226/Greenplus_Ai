import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/helpers/renderWithProviders'
import { LoginPage } from '../../pages/LoginPage'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

import { supabase } from '../../lib/supabase'

const loggedOutState = {
  user: { session: null, profile: null, loading: false, language: 'en' },
}

beforeEach(() => vi.clearAllMocks())

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    const { container } = renderWithProviders(<LoginPage />, { route: '/login', preloadedState: loggedOutState })
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('renders Google sign-in button', () => {
    renderWithProviders(<LoginPage />, { route: '/login', preloadedState: loggedOutState })
    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument()
  })

  it('shows error message on failed sign-in', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    })
    renderWithProviders(<LoginPage />, { route: '/login', preloadedState: loggedOutState })

    const { container } = renderWithProviders(<LoginPage />, { route: '/login', preloadedState: loggedOutState })
    const scope = within(container)
    await userEvent.type(container.querySelector('input[type="email"]'), 'test@test.com')
    await userEvent.type(container.querySelector('input[type="password"]'), 'wrongpass')
    await userEvent.click(scope.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(scope.getByText('Invalid login credentials')).toBeInTheDocument()
    })
  })

  it('calls signInWithPassword with email and password', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({ error: null })
    const { container } = renderWithProviders(<LoginPage />, { route: '/login', preloadedState: loggedOutState })
    const scope = within(container)
    await userEvent.type(container.querySelector('input[type="email"]'), 'user@test.com')
    await userEvent.type(container.querySelector('input[type="password"]'), 'password123')
    await userEvent.click(scope.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'password123',
      })
    })
  })

  it('calls signInWithOAuth with google provider', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({ error: null })
    renderWithProviders(<LoginPage />, { route: '/login?role=user', preloadedState: loggedOutState })

    await userEvent.click(screen.getByText(/sign in with google/i))

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' })
      )
    })
  })

  it('switches to sign-up mode', async () => {
    renderWithProviders(<LoginPage />, { route: '/login', preloadedState: loggedOutState })
    await userEvent.click(screen.getByText(/no account/i))
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })
})
