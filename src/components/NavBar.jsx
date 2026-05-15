import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setLanguage, clearUser, toggleDarkMode } from '../store/userSlice'
import { useT } from '../hooks/useT'

export function NavBar() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { session, profile, language, darkMode } = useSelector(s => s.user)
  const t          = useT()
  const role       = profile?.role

  async function handleLogout() {
    await supabase.auth.signOut()
    dispatch(clearUser())
    navigate('/')
  }

  function toggleLang() {
    dispatch(setLanguage(language === 'th' ? 'en' : 'th'))
  }

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b-[1.5px] border-[var(--ink)] bg-[var(--paper)]">
      <Link to="/" className="font-brand text-[22px] text-[var(--ink)] no-underline">
        GreenPlus<span className="text-[var(--green)]">.</span>Ai
      </Link>

      <div className="flex items-center gap-4 flex-wrap">
        {session && role === 'user' && (
          <>
            <NavLink to="/scan">{t.scan}</NavLink>
            <NavLink to="/basket">{t.basket}</NavLink>
            <NavLink to="/map">{t.map}</NavLink>
            <NavLink to="/marketplace">{t.marketplace}</NavLink>
          </>
        )}
        {session && role === 'buyer' && (
          <>
            <NavLink to="/dashboard">{t.dashboard}</NavLink>
            <NavLink to="/marketplace">{t.marketplace}</NavLink>
          </>
        )}
        {session && role === 'admin' && (
          <NavLink to="/admin">{t.admin}</NavLink>
        )}
        {session && <NavLink to="/profile">{t.profile}</NavLink>}
        {session && <NavLink to="/settings">{t.settings}</NavLink>}

        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="flex items-center justify-center w-7 h-7 border-[1.5px] border-[var(--ink-4)] hover:border-[var(--ink)] hover:text-[var(--ink)] text-[var(--ink-3)] transition-colors bg-transparent cursor-pointer shrink-0"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        <button
          onClick={toggleLang}
          className="font-data text-[12px] border-[1.5px] border-[var(--ink-4)] px-2 py-0.5 hover:border-[var(--ink)] transition-colors bg-transparent"
        >
          {language === 'th' ? 'EN' : 'TH'}
        </button>

        {session ? (
          <button
            onClick={handleLogout}
            className="font-body text-[15px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors bg-transparent border-none cursor-pointer"
          >
            {t.logout}
          </button>
        ) : (
          <Link to="/login" className="font-body text-[15px] text-[var(--ink)] no-underline hover:text-[var(--green)] transition-colors">
            {t.signIn}
          </Link>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="font-body text-[16px] text-[var(--ink)] no-underline hover:text-[var(--green)] transition-colors"
    >
      {children}
    </Link>
  )
}
