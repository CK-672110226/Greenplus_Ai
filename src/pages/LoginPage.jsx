import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { Button } from '../components/Button'
import { Logo, LogoWordmark } from '../components/Logo'
import { useT } from '../hooks/useT'

const ROLE_DEST = { user: '/scan', buyer: '/dashboard', admin: '/admin' }

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-data text-[11px] text-[var(--ink-2)] uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}

export function LoginPage() {
  const navigate             = useNavigate()
  const [params]             = useSearchParams()
  const role                 = params.get('role') ?? 'user'
  const t                    = useT()
  const { session, profile } = useSelector(s => s.user)
  const darkMode             = useSelector(s => s.user.darkMode)

  const [mode, setMode]           = useState('signin')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [error, setError]         = useState(null)
  const [loading, setLoading]     = useState(false)
  const [unverified, setUnverified] = useState(false)

  useEffect(() => {
    if (session && profile) {
      navigate(ROLE_DEST[profile.role] ?? '/scan', { replace: true })
    }
  }, [session, profile, navigate])

  async function insertProfile(userId) {
    await supabase.from('user_profiles').insert({
      id:            userId,
      role,
      display_name:  email.split('@')[0],
      language_pref: 'th',
      eco_points:    0,
    })
  }

  async function doSignUp() {
    const { data, error: authErr } = await supabase.auth.signUp({ email, password })
    if (authErr) {
      if (authErr.message?.toLowerCase().includes('user already registered')) {
        setMode('signin')
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
        if (signInErr) {
          if (signInErr.message?.toLowerCase().includes('email not confirmed')) setUnverified(true)
          else setError(signInErr.message)
        }
      } else {
        setError(authErr.message)
      }
      return
    }
    if (data.user && !data.user.confirmed_at) { setUnverified(true); return }
    if (data.user) await insertProfile(data.user.id)
  }

  async function doSignIn() {
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    if (authErr) {
      if (authErr.message?.toLowerCase().includes('invalid login credentials')) {
        setMode('signup')
        await doSignUp()
      } else if (authErr.message?.toLowerCase().includes('email not confirmed')) {
        setUnverified(true)
      } else {
        setError(authErr.message)
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setUnverified(false)
    setLoading(true)
    if (mode === 'signup') await doSignUp()
    else await doSignIn()
    setLoading(false)
  }

  async function handleResendVerification() {
    const { error: err } = await supabase.auth.resend({ type: 'signup', email })
    if (err) setError(err.message)
    else setError(null)
  }

  async function handleGoogleSignIn() {
    setError(null)
    setLoading(true)
    localStorage.setItem('gp_pending_role', role)
    const { error: authErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (authErr) { setError(authErr.message); setLoading(false) }
  }

  const roleColor = role === 'buyer' ? 'var(--ink)' : 'var(--green-ink)'

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 bg-[var(--paper)]">
      <div className="w-full max-w-sm flex flex-col gap-6 py-12">

        {/* Logo block */}
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2.5">
            <Logo height={36} showWordmark={false} />
            <LogoWordmark fontSize={24} inverse={darkMode} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
              sign in
            </span>
            <h1 className="font-brand text-[26px] m-0 leading-tight" style={{ color: 'var(--ink)' }}>
              Welcome back —<br />
              <span style={{ color: roleColor }}>continue as {role}</span>
            </h1>
          </div>
          {/* Role badge */}
          <span className="font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border-[1.5px]"
                style={{ borderColor: roleColor, color: roleColor }}>
            {role}
          </span>
        </div>

        {/* Email-not-verified state */}
        {unverified && (
          <div className="flex flex-col gap-3 border-[1.5px] border-[var(--orange)] p-4">
            <p className="font-body text-[14px] text-[var(--orange)] m-0">
              {t.emailNotVerified ?? 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ — เช็กกล่องจดหมายของคุณ'}
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              className="font-data text-[11px] uppercase tracking-widest text-[var(--ink)] underline bg-transparent border-none cursor-pointer text-left p-0"
            >
              {t.resendVerification ?? 'ส่งอีเมลยืนยันอีกครั้ง'}
            </button>
          </div>
        )}

        {!unverified && (
          <>
            {/* OAuth buttons — top of form per wireframe */}
            {role !== 'admin' && (
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[16px] text-[var(--ink)] cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors disabled:opacity-50"
                >
                  <span className="w-5 h-5 border-[1.5px] border-[var(--ink-4)] flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
                      <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                      <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"/>
                      <path fill="#FBBC05" d="M24 46c5.9 0 10.9-2 14.5-5.4l-6.7-5.5C29.8 36.9 27 38 24 38c-6.1 0-10.7-3.9-11.8-9.2l-7 5.4C8.1 41.1 15.5 46 24 46z"/>
                      <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.8-2.8 5.1-5.3 6.6l6.7 5.5C41.8 37.3 45 31.5 45 24c0-1.3-.2-2.7-.5-4z"/>
                    </svg>
                  </span>
                  Continue with Google
                </button>
                {role === 'user' && (
                  <button
                    type="button"
                    disabled={loading}
                    className="w-full flex items-center gap-3 px-4 py-3 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[16px] text-[var(--ink)] cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors disabled:opacity-50"
                    onClick={() => setError('LINE login coming soon')}
                  >
                    <span className="w-5 h-5 border-[1.5px] border-[var(--ink-4)] flex items-center justify-center flex-shrink-0 font-data text-[10px]">L</span>
                    Continue with LINE
                  </button>
                )}
              </div>
            )}

            {/* Divider */}
            {role !== 'admin' && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--ink-4)]" />
                <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">or with email</span>
                <div className="flex-1 h-px bg-[var(--ink-4)]" />
              </div>
            )}

            {/* Email / Password form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label={t.email ?? 'Email'}>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[17px] outline-none focus:border-[var(--green)]"
                />
              </Field>

              <Field label={t.password ?? 'Password'}>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[17px] outline-none focus:border-[var(--green)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors bg-transparent border-none cursor-pointer p-0"
                    tabIndex={-1}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>
              </Field>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between -mt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="w-3.5 h-3.5 border-[1.5px] border-[var(--ink)] bg-[var(--green-soft)] flex items-center justify-center flex-shrink-0">
                    <svg width="9" height="9" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="var(--green-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">Remember me</span>
                </label>
                <button
                  type="button"
                  className="font-data text-[11px] text-[var(--green-ink)] uppercase tracking-widest bg-transparent border-none cursor-pointer p-0 hover:opacity-75 transition-opacity"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <p className="font-body text-[14px] text-[var(--orange)] m-0">{error}</p>
              )}

              <Button type="submit" variant="primary" fullWidth disabled={loading}
                style={{ height: 48, fontSize: 18, marginTop: 2 }}>
                {loading ? '...' : mode === 'signin'
                  ? `Sign in → /${role === 'buyer' ? 'dashboard' : 'home'}`
                  : 'Create account →'}
              </Button>
            </form>

            {/* Toggle signin/signup */}
            <div className="font-data text-[12px] text-[var(--ink-3)] text-center uppercase tracking-widest">
              {mode === 'signin' ? (
                <>
                  No account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null) }}
                    className="text-[var(--green-ink)] bg-transparent border-none cursor-pointer p-0 font-data text-[12px] uppercase tracking-widest hover:opacity-75"
                  >
                    Sign up free
                  </button>
                  {' '}· takes 30s
                </>
              ) : (
                <>
                  Have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError(null) }}
                    className="text-[var(--green-ink)] bg-transparent border-none cursor-pointer p-0 font-data text-[12px] uppercase tracking-widest hover:opacity-75"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
