import { Outlet, NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
<<<<<<< Updated upstream
import { useNavigate } from 'react-router-dom'
import { setLanguage } from '../store/userSlice'
=======
import { setLanguage, toggleDarkMode } from '../store/userSlice'
>>>>>>> Stashed changes
import { useT } from '../hooks/useT'
import { Logo } from '../components/Logo'

function IconHome() {
<<<<<<< Updated upstream
=======
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
}
function IconScan() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 7 4" /><polyline points="17 4 20 4 20 7" /><polyline points="20 17 20 20 17 20" /><polyline points="7 20 4 20 4 17" /><rect x="8" y="8" width="8" height="8" rx="1" /></svg>
}
function IconBasket() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
}
function IconMap() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
}
function IconProfile() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
}
function IconMarket() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9M9 21h6" /></svg>
}
function IconSettings() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
}
function IconSun() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
}
function IconMoon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
}
function IconSignOut() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
}

/* ── Sidebar nav link (desktop) ──────────────────────────────── */
function SideLink({ to, icon, label, badge }) {
>>>>>>> Stashed changes
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconScan() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 7 4" />
      <polyline points="17 4 20 4 20 7" />
      <polyline points="20 17 20 20 17 20" />
      <polyline points="7 20 4 20 4 17" />
      <rect x="8" y="8" width="8" height="8" rx="1" />
    </svg>
  )
}

function IconBasket() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

function IconMap() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  )
}

function IconProfile() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function Tab({ to, icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition-colors ' +
        (isActive ? 'text-[var(--green)]' : 'text-[var(--ink-3)] hover:text-[var(--ink)]')
      }
    >
      <span className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1 -right-1.5 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 bg-[var(--green)] text-[var(--paper)] font-data text-[9px] rounded-full leading-none">
            {badge}
          </span>
        )}
      </span>
      <span className="font-data text-[10px] uppercase tracking-wide leading-none">{label}</span>
    </NavLink>
  )
}

export function UserLayout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
<<<<<<< Updated upstream
  const { language } = useSelector(s => s.user)
=======
  const { language, profile, darkMode } = useSelector(s => s.user)
>>>>>>> Stashed changes
  const basket = useSelector(s => s.waste?.basket ?? [])
  const t = useT()

  const activeCount = basket.filter(i => !i.skipped).length

  function toggleLang() {
    dispatch(setLanguage(language === 'th' ? 'en' : 'th'))
  }

<<<<<<< Updated upstream
=======
  function handleToggleDark() {
    dispatch(toggleDarkMode())
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const mainNav = [
    { to: '/home',         icon: <IconHome />,    label: t.home },
    { to: '/scan',         icon: <IconScan />,    label: 'AI Scanner' },
    { to: '/marketplace',  icon: <IconMarket />,  label: t.marketplace },
    { to: '/map',          icon: <IconMap />,     label: t.map },
  ]

  const mobileNav = [
    { to: '/home',    icon: <IconHome />,    label: t.home },
    { to: '/scan',    icon: <IconScan />,    label: t.scan },
    { to: '/basket',  icon: <IconBasket />,  label: t.basket, badge: activeCount },
    { to: '/map',     icon: <IconMap />,     label: t.map },
    { to: '/profile', icon: <IconProfile />, label: t.profile },
  ]

  // Avatar initial
  const initial = (profile?.display_name ?? 'U')[0].toUpperCase()

>>>>>>> Stashed changes
  return (
    <div className="flex flex-col min-h-screen bg-[var(--paper)]">
      {/* TopBar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[var(--paper)] border-b-[1.5px] border-[var(--ink)]">
        <button
          onClick={() => navigate('/home')}
          className="bg-transparent border-none cursor-pointer p-0 hover:opacity-75 transition-opacity"
          aria-label="GreenPlus.Ai home"
        >
          <Logo height={30} showWordmark />
        </button>

<<<<<<< Updated upstream
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="font-data text-[11px] border-[1.5px] border-[var(--ink-4)] px-2 py-0.5 hover:border-[var(--ink)] transition-colors bg-transparent cursor-pointer"
          >
            {language === 'th' ? 'EN' : 'TH'}
          </button>
=======
      {/* ══ Desktop Sidebar ══════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r-[1.5px] border-[var(--ink)] sticky top-0 h-screen overflow-y-auto bg-[var(--paper)]">

        {/* Logo */}
        <div className="flex items-center px-5 py-5 border-b-[1.5px] border-[var(--ink)]">
          <button
            onClick={() => navigate('/home')}
            className="bg-transparent border-none cursor-pointer p-0 hover:opacity-75 transition-opacity"
            aria-label="GreenPlus.Ai home"
          >
            <Logo height={28} showWordmark />
          </button>
        </div>

        {/* MAIN nav */}
        <div className="flex flex-col pt-4 flex-1">
          <span className="px-5 pb-1.5 font-data text-[9px] uppercase tracking-[0.15em] text-[var(--ink-4)]">
            Main
          </span>
          {mainNav.map(item => (
            <SideLink key={item.to} {...item} />
          ))}

          {/* ACCOUNT nav */}
          <span className="px-5 pt-5 pb-1.5 font-data text-[9px] uppercase tracking-[0.15em] text-[var(--ink-4)]">
            Account
          </span>
          <SideLink to="/profile"  icon={<IconProfile />}  label={t.profile} />
          <SideLink to="/settings" icon={<IconSettings />} label={t.settings} />
        </div>

        {/* Sign out + lang */}
        <div className="border-t-[1.5px] border-[var(--ink)]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-5 py-3 w-full text-left text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors font-data text-[12px] uppercase tracking-widest bg-transparent border-none cursor-pointer"
          >
            <IconSignOut />
            {t.logout}
          </button>
        </div>

        {/* User profile chip */}
        <div className="flex items-center gap-3 px-5 py-4 border-t-[1.5px] border-[var(--ink)] bg-[var(--paper-2)]">
          <div className="w-8 h-8 border-[1.5px] border-[var(--ink)] bg-[var(--green-soft)] flex items-center justify-center font-brand text-[14px] text-[var(--green-ink)] shrink-0">
            {initial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-data text-[12px] text-[var(--ink)] truncate">
              {profile?.display_name ?? '—'}
            </span>
            <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-wide">
              {profile?.role ?? 'user'}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={handleToggleDark}
              className="flex items-center justify-center w-6 h-6 border-[1.5px] border-[var(--ink-4)] hover:border-[var(--ink)] transition-colors bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] shrink-0"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <IconSun /> : <IconMoon />}
            </button>
            <button
              onClick={toggleLang}
              className="font-data text-[10px] border-[1.5px] border-[var(--ink-4)] px-1.5 py-0.5 hover:border-[var(--ink)] transition-colors bg-transparent cursor-pointer shrink-0"
            >
              {language === 'th' ? 'EN' : 'TH'}
            </button>
          </div>
        </div>
      </aside>
>>>>>>> Stashed changes

          <button
            onClick={() => navigate('/basket')}
            className="relative flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer text-[var(--ink)] hover:text-[var(--green)] transition-colors"
            aria-label={t.basket}
          >
            <IconBasket />
            {activeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 bg-[var(--green)] text-[var(--paper)] font-data text-[9px] rounded-full leading-none">
                {activeCount}
              </span>
            )}
          </button>
<<<<<<< Updated upstream
        </div>
      </header>
=======
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
              onClick={() => navigate('/basket')}
              className="relative flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer text-[var(--ink)] hover:text-[var(--green)] transition-colors"
            >
              <IconBasket />
              {activeCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 bg-[var(--green)] text-[var(--paper)] font-data text-[9px] rounded-full leading-none">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </header>
>>>>>>> Stashed changes

      {/* Page content — padded so it doesn't hide behind bottom tab bar */}
      <main className="flex-1 pb-[68px]">
        <Outlet />
      </main>

      {/* BottomTabBar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch bg-[var(--paper)] border-t-[1.5px] border-[var(--ink)]">
        <Tab to="/home"    icon={<IconHome />}    label={t.home} />
        <Tab to="/scan"    icon={<IconScan />}    label={t.scan} />
        <Tab to="/basket"  icon={<IconBasket />}  label={t.basket} badge={activeCount} />
        <Tab to="/map"     icon={<IconMap />}     label={t.map} />
        <Tab to="/profile" icon={<IconProfile />} label={t.profile} />
      </nav>
    </div>
  )
}
