import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { NavBar } from '../components/NavBar'
import { UserLayout } from './UserLayout'
import { BuyerLayout } from './BuyerLayout'
import { useT } from '../hooks/useT'

function AppSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--paper)]">
      {/* Topbar ghost */}
      <div className="h-[57px] border-b-[1.5px] border-[var(--ink-4)] px-4 flex items-center gap-3">
        <div className="h-7 w-8 bg-[var(--paper-2)] animate-pulse" />
        <div className="h-5 w-28 bg-[var(--paper-2)] animate-pulse" />
      </div>
      {/* Content shimmer */}
      <div className="flex flex-col gap-4 px-6 py-8 flex-1">
        <div className="h-3 w-20 bg-[var(--paper-2)] animate-pulse" />
        <div className="h-7 w-56 bg-[var(--paper-2)] animate-pulse" />
        <div className="h-px bg-[var(--ink-4)] my-1" />
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="h-20 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
          <div className="h-20 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
        </div>
        <div className="h-3 w-32 bg-[var(--paper-2)] animate-pulse mt-2" />
        <div className="h-28 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
        <div className="h-10 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
        <div className="h-10 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
      </div>
      {/* Mobile bottom nav ghost */}
      <div className="lg:hidden h-[60px] border-t-[1.5px] border-[var(--ink-4)] bg-[var(--paper)]" />
    </div>
  )
}

function SuspendedScreen() {
  const t = useT()
  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="font-brand text-[48px] text-[var(--orange)]">&#x26D4;</div>
      <h1 className="font-brand text-[24px] text-[var(--ink)] m-0">{t.accountSuspended}</h1>
      <p className="font-body text-[14px] text-[var(--ink-3)] max-w-[300px] m-0">{t.accountSuspendedHint}</p>
    </div>
  )
}

export function SmartLayout() {
  const { profile, session, loading } = useSelector(s => s.user)

  if (loading || (session && !profile)) return <AppSkeleton />

  if (profile?.is_banned) return <SuspendedScreen />

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
