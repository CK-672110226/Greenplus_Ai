import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { clearUser, setLanguage } from '../store/userSlice'
import { useT } from '../hooks/useT'
import { Logo } from '../components/Logo'

const NAV_MAIN = [
  { to: '/dashboard',   key: 'dashboard' },
  { to: '/schedule',    key: 'schedule' },
  { to: '/marketplace', key: 'marketplace' },
  { to: '/pricing',     key: 'pricing' },
]

const NAV_ACCOUNT = [
  { to: '/notifications', key: 'notifications', badge: true },
  { to: '/profile',       key: 'profile' },
  { to: '/settings',      key: 'settings' },
]

function SideNavLink({ to, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'flex items-center justify-between px-5 py-3 font-body text-[15px] no-underline border-l-[3px] transition-colors ' +
        (isActive
          ? 'border-[var(--green)] bg-[var(--ink)] text-[var(--paper)]'
          : 'border-transparent text-[var(--ink)] hover:border-[var(--ink-4)] hover:text-[var(--green)]')
      }
    >
      <span>{label}</span>
      {badge}
    </NavLink>
  )
}

function TopNavLink({ to, label, dot }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'relative shrink-0 px-4 py-2.5 font-data text-[11px] uppercase tracking-widest no-underline whitespace-nowrap border-r-[1.5px] border-[var(--ink)] transition-colors ' +
        (isActive
          ? 'bg-[var(--ink)] text-[var(--paper)]'
          : 'text-[var(--ink-3)] hover:text-[var(--ink)]')
      }
    >
      {label}
      {dot && (
        <span
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ background: '#E53E3E' }}
        />
      )}
    </NavLink>
  )
}

export function BuyerLayout() {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const { language } = useSelector(s => s.user)
  const t         = useT()
  const unread    = useSelector(s => s.notifications.items.filter(n => !n.read).length)

  async function handleLogout() {
    await supabase.auth.signOut()
    dispatch(clearUser())
    navigate('/')
  }

  function toggleLang() {
    dispatch(setLanguage(language === 'th' ? 'en' : 'th'))
  }

  const unreadBadge = unread > 0
    ? (
      <span
        className="font-data text-[10px] px-1.5 py-0.5 rounded-full leading-none"
        style={{ background: 'var(--orange)', color: '#fff' }}
      >
        {unread}
      </span>
    )
    : null

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

        <nav className="flex flex-col flex-1 py-2 overflow-y-auto">
          <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-widest px-5 pt-4 pb-1">
            {t.navMain}
          </span>
          {NAV_MAIN.map(n => (
            <SideNavLink key={n.to} to={n.to} label={t[n.key]} />
          ))}

          <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-widest px-5 pt-4 pb-1">
            {t.navAccount}
          </span>
          {NAV_ACCOUNT.map(n => (
            <SideNavLink
              key={n.to}
              to={n.to}
              label={t[n.key]}
              badge={n.badge ? unreadBadge : null}
            />
          ))}
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
          <Logo height={22} />
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
          {NAV_MAIN.map(n => (
            <TopNavLink key={n.to} to={n.to} label={t[n.key]} />
          ))}
          {NAV_ACCOUNT.map(n => (
            <TopNavLink
              key={n.to}
              to={n.to}
              label={t[n.key]}
              dot={n.badge && unread > 0}
            />
          ))}
        </div>

        <main className="flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
