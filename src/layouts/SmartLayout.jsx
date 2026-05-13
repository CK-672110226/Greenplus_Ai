import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { NavBar } from '../components/NavBar'
import { UserLayout } from './UserLayout'

export function SmartLayout() {
  const { profile, session, loading } = useSelector(s => s.user)

  if (loading) return null

  if (session && profile?.role === 'user') {
    return <UserLayout />
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col">
      <NavBar />
      <Outlet />
    </div>
  )
}
