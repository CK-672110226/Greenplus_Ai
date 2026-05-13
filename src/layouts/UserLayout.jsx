import { Outlet, NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setLanguage } from '../store/userSlice'
import { useT } from '../hooks/useT'

function IconHome() {
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
  const { language } = useSelector(s => s.user)
  const basket = useSelector(s => s.waste?.basket ?? [])
  const t = useT()

  const activeCount = basket.filter(i => !i.skipped).length

  function toggleLang() {
    dispatch(setLanguage(language === 'th' ? 'en' : 'th'))
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--paper)]">
      {/* TopBar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[var(--paper)] border-b-[1.5px] border-[var(--ink)]">
        <button
          onClick={() => navigate('/home')}
          className="font-brand text-[20px] text-[var(--ink)] bg-transparent border-none cursor-pointer hover:text-[var(--green)] transition-colors p-0"
        >
          GreenPlus<span className="text-[var(--green)]">.</span>Ai
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="font-data text-[11px] border-[1.5px] border-[var(--ink-4)] px-2 py-0.5 hover:border-[var(--ink)] transition-colors bg-transparent cursor-pointer"
          >
            {language === 'th' ? 'EN' : 'TH'}
          </button>

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
        </div>
      </header>

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
