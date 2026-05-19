import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export function ProtectedRoute({ children, requiredRole, allowIfDriver }) {
  const { session, profile, loading } = useSelector(s => s.user)
  const location = useLocation()

  if (loading) return null

  if (!session) return <Navigate to="/login" state={{ from: location }} replace />

  const roleOk   = !requiredRole || profile?.role === requiredRole
  const driverOk = allowIfDriver && profile?.is_driver
  if (!roleOk && !driverOk) return <Navigate to="/" replace />

  return children
}
