import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { clearUser, setLanguage } from '../store/userSlice'
import { useT } from '../hooks/useT'

const NAV = [
  { to: '/dashboard',   key: 'dashboard' },
  { to: '/marketplace', key: 'marketplace' },
  { to: '/profile',     key: 'profile' },
  { to: '/settings',    key: 'settings' },
]

function SideNavLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'block px-5 py-3 font-body text-[15px] no-underline border-l-[3px] transition-colors ' +
        (isActive
          ? 'border-[var(--green)] bg-[var(--ink)] text-[var(--paper)]'
          : 'border-transparent text-[var(--ink)] hover:border-[var(--ink-4)] hover:text-[var(--green)]')
      }
    >
      {label}
    </NavLink>
  )
}

function TopNavLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'shrink-0 px-4 py-2.5 font-data text-[11px] uppercase tracking-widest no-underline whitespace-nowrap border-r-[1.5px] border-[var(--ink)] transition-colors ' +
        (isActive
          ? 'bg-[var(--ink)] text-[var(--paper)]'
          : 'text-[var(--ink-3)] hover:text-[var(--ink)]')
      }
    >
      {label}
    </NavLink>
  )
}

export function BuyerLayout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { language } = useSelector(s => s.user)
  const t = useT()

  async function handleLogout() {
    await supabase.auth.signOut()
    dispatch(clearUser())
    navigate('/')
  }

  function toggleLang() {
    dispatch(setLanguage(language === 'th' ? 'en' : 'th'))
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] flex">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-[200px] min-h-screen border-r-[1.5px] border-[var(--ink)] sticky top-0 self-start h-screen">
        <div className="px-5 py-4 border-b-[1.5px] border-[var(--ink)]">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest block mb-1">
            {t.roleBuyer}
          </span>
          <span className="font-brand text-[18px] text-[var(--ink)]">
            GreenPlus<span className="text-[var(--green)]">.</span>Ai
          </span>
        </div>

        <nav className="flex flex-col flex-1 py-2">
          {NAV.map(n => <SideNavLink key={n.to} to={n.to} label={t[n.key]} />)}
        </nav>

        <div className="px-5 py-4 border-t-[1.5px] border-[var(--ink)] flex flex-col gap-2">
          <button
            onClick={toggleLang}
            className="font-data text-[11px] border-[1.5px] border-[var(--ink-4)] px-2 py-1 hover:border-[var(--ink)] transition-colors bg-transparent text-left cursor-pointer"
          >
            {language === 'th' ? 'EN' : 'TH'}
          </button>
          <button
            onClick={handleLogout}
            className="font-body text-[14px] text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none text-left cursor-pointer p-0 transition-colors"
          >
            {t.logout}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 md:hidden flex items-center justify-between px-4 py-3 bg-[var(--paper)] border-b-[1.5px] border-[var(--ink)]">
          <span className="font-brand text-[18px] text-[var(--ink)]">
            GreenPlus<span className="text-[var(--green)]">.</span>Ai
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="font-data text-[11px] border-[1.5px] border-[var(--ink-4)] px-2 py-0.5 hover:border-[var(--ink)] transition-colors bg-transparent cursor-pointer"
            >
              {language === 'th' ? 'EN' : 'TH'}
            </button>
            <button
              onClick={handleLogout}
              className="font-body text-[14px] text-[var(--ink-3)] bg-transparent border-none cursor-pointer"
            >
              {t.logout}
            </button>
          </div>
        </header>

        {/* Mobile horizontal nav strip */}
        <div className="md:hidden flex overflow-x-auto border-b-[1.5px] border-[var(--ink)]">
          {NAV.map(n => <TopNavLink key={n.to} to={n.to} label={t[n.key]} />)}
        </div>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
