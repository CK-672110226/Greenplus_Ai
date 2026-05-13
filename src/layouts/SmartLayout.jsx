import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { NavBar } from '../components/NavBar'
import { UserLayout } from './UserLayout'
import { BuyerLayout } from './BuyerLayout'

export function SmartLayout() {
  const { profile, session, loading } = useSelector(s => s.user)

  if (loading) return null

  const role = session ? profile?.role : null

  if (role === 'user')  return <UserLayout />
  if (role === 'buyer') return <BuyerLayout />

  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col">
      <NavBar />
      <Outlet />
    </div>
  )
}
