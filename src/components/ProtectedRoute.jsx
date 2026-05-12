import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export function ProtectedRoute({ children, requiredRole }) {
  const { session, profile, loading } = useSelector(s => s.user)

  if (loading) return null

  if (!session) return <Navigate to="/login" replace />

  if (requiredRole && profile?.role !== requiredRole) return <Navigate to="/" replace />

  return children
}
