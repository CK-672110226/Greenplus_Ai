import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setLanguage, clearUser } from '../store/userSlice'
import { useT } from '../hooks/useT'

export function NavBar() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { session, profile, language } = useSelector(s => s.user)
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
            <NavLink to="/eco-points">{t.ecoPoints}</NavLink>
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
