import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { renderWithProviders } from '../../test/helpers/renderWithProviders'

const protectedContent = <div>Protected content</div>

describe('ProtectedRoute', () => {
  it('redirects to /login when no session', () => {
    renderWithProviders(
      <ProtectedRoute>{protectedContent}</ProtectedRoute>,
      { preloadedState: { user: { session: null, profile: null, loading: false, language: 'en' } } }
    )
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('shows children when session and no role requirement', () => {
    renderWithProviders(
      <ProtectedRoute>{protectedContent}</ProtectedRoute>,
      { preloadedState: { user: { session: { user: { id: '1' } }, profile: { role: 'user' }, loading: false, language: 'en' } } }
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('shows children when role matches', () => {
    renderWithProviders(
      <ProtectedRoute requiredRole="buyer">{protectedContent}</ProtectedRoute>,
      { preloadedState: { user: { session: { user: { id: '1' } }, profile: { role: 'buyer' }, loading: false, language: 'en' } } }
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('redirects when role does not match', () => {
    renderWithProviders(
      <ProtectedRoute requiredRole="admin">{protectedContent}</ProtectedRoute>,
      { preloadedState: { user: { session: { user: { id: '1' } }, profile: { role: 'user' }, loading: false, language: 'en' } } }
    )
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders nothing while loading', () => {
    const { container } = renderWithProviders(
      <ProtectedRoute>{protectedContent}</ProtectedRoute>,
      { preloadedState: { user: { session: null, profile: null, loading: true, language: 'en' } } }
    )
    expect(container).toBeEmptyDOMElement()
  })
})
