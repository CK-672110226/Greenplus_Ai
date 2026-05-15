import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { clearUser, setLanguage, toggleDarkMode } from '../store/userSlice'
import { useT } from '../hooks/useT'
import { Logo } from '../components/Logo'

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
  const { language, darkMode } = useSelector(s => s.user)
  const t = useT()

  async function handleLogout() {
    await supabase.auth.signOut()
    dispatch(clearUser())
    navigate('/')
  }

  function toggleLang() {
    dispatch(setLanguage(language === 'th' ? 'en' : 'th'))
  }

  function handleToggleDark() {
    dispatch(toggleDarkMode())
  }

  function IconSun() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
  }
  function IconMoon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] flex">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-[200px] min-h-screen border-r-[1.5px] border-[var(--ink)] sticky top-0 self-start h-screen">
        <div className="px-5 py-4 border-b-[1.5px] border-[var(--ink)]">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest block mb-2">
            {t.roleBuyer}
          </span>
          <Logo height={22} />
        </div>

        <nav className="flex flex-col flex-1 py-2">
          {NAV.map(n => <SideNavLink key={n.to} to={n.to} label={t[n.key]} />)}
        </nav>

        <div className="px-5 py-4 border-t-[1.5px] border-[var(--ink)] flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleDark}
              className="flex items-center justify-center w-7 h-7 border-[1.5px] border-[var(--ink-4)] hover:border-[var(--ink)] transition-colors bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)]"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <IconSun /> : <IconMoon />}
            </button>
            <button
              onClick={toggleLang}
              className="font-data text-[11px] border-[1.5px] border-[var(--ink-4)] px-2 py-1 hover:border-[var(--ink)] transition-colors bg-transparent text-left cursor-pointer"
            >
              {language === 'th' ? 'EN' : 'TH'}
            </button>
          </div>
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
          <Logo height={22} />
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleDark}
              className="flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <IconSun /> : <IconMoon />}
            </button>
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
