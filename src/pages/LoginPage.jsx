import { useEffect, useState, useId } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button } from '../components/Button'
import { Logo, LogoWordmark } from '../components/Logo'
import { useT } from '../hooks/useT'
import { useAuthActions } from '../hooks/useAuthActions'
import { toast } from 'sonner'

const ROLE_DEST = { user: '/scan', buyer: '/dashboard', admin: '/admin' }

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

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

function Field({ label, id, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-data text-[11px] text-[var(--ink-2)] uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}

export function LoginPage() {
  const navigate             = useNavigate()
  const location             = useLocation()
  const [params]             = useSearchParams()
  const rawRole              = params.get('role')
  const role                 = ['user', 'buyer'].includes(rawRole) ? rawRole : 'user'
  const t                    = useT()
  const { signIn, signUp, signInWithGoogle, sendPasswordReset, resendVerification, updatePassword, subscribeToRecovery } = useAuthActions()
  const { session, profile } = useSelector(s => s.user)
  const darkMode             = useSelector(s => s.user.darkMode)

  const [mode, setMode]               = useState('signin')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [error, setError]             = useState(null)
  const [loading, setLoading]         = useState(false)
  const [unverified, setUnverified]   = useState(false)
  const [recoverySession, setRecoverySession] = useState(false)
  const [rememberMe, setRememberMe]   = useState(false)
  const [showForgot, setShowForgot]   = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent]   = useState(false)
  const [forgotError, setForgotError] = useState(null)
  const [forgotLoading, setForgotLoading] = useState(false)
  const emailId      = useId()
  const passwordId   = useId()
  const newPassId    = useId()
  const confirmPassId = useId()

  useEffect(() => {
    if (session && profile && !recoverySession) {
      const from = location.state?.from?.pathname
      const dest = from && from !== '/login' ? from : (ROLE_DEST[profile.role] ?? '/scan')
      navigate(dest, { replace: true })
    }
  }, [session, profile, recoverySession, navigate, location])

  useEffect(() => {
    return subscribeToRecovery(() => {
      setRecoverySession(true)
      setMode('reset')
      setError(null)
    })
  }, [subscribeToRecovery])

  async function doSignUp() {
    const { error, unverified, alreadyRegistered } = await signUp(email, password, role)
    if (alreadyRegistered) setMode('signin')
    if (unverified) setUnverified(true)
    else if (error) setError(error)
  }

  async function doSignIn() {
    const { error, unverified } = await signIn(email, password, rememberMe)
    if (unverified) setUnverified(true)
    else if (error) setError(t.invalidCredentials)
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
    const { error } = await resendVerification(email)
    setError(error)
  }

  async function handleGoogleSignIn() {
    setError(null)
    setLoading(true)
    const { error } = await signInWithGoogle(role)
    if (error) { setError(error); setLoading(false) }
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await sendPasswordReset(email)
    setLoading(false)
    if (error) setError(error)
    else setMode('forgot-sent')
  }

  async function handleInlineForgot(e) {
    e.preventDefault()
    setForgotError(null)
    setForgotLoading(true)
    const { error } = await sendPasswordReset(forgotEmail)
    setForgotLoading(false)
    if (error) setForgotError(error)
    else setForgotSent(true)
  }

  async function handleSetNewPassword(e) {
    e.preventDefault()
    if (newPassword.length < 6) { setError(t.passwordTooShort); return }
    if (newPassword !== confirmPass) { setError(t.passwordMismatch); return }
    setError(null)
    setLoading(true)
    const { error } = await updatePassword(newPassword)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      setRecoverySession(false)
      setNewPassword('')
      setConfirmPass('')
      toast.success(t.passwordUpdated)
      setMode('signin')
    }
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
              {mode === 'forgot' || mode === 'forgot-sent' ? 'password recovery'
               : mode === 'reset' ? 'set new password'
               : 'sign in'}
            </span>
            <h1 className="font-brand text-[26px] m-0 leading-tight" style={{ color: 'var(--ink)' }}>
              {mode === 'forgot' || mode === 'forgot-sent'
                ? <>{t.resetPassword}</>
                : mode === 'reset'
                ? <>{t.setNewPassword}</>
                : <>Welcome back —<br /><span style={{ color: roleColor }}>continue as {role}</span></>
              }
            </h1>
          </div>
          {/* Role badge */}
          {role && (
            <span className="inline-block font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border-[1.5px] border-[var(--ink)] text-[var(--ink)] self-start">
              {role}
            </span>
          )}
        </div>

        {/* Email-not-verified state */}
        {unverified && (mode === 'signin' || mode === 'signup') && (
          <div className="flex flex-col gap-3 border-[1.5px] border-[var(--orange)] p-4">
            <p className="font-body text-[14px] text-[var(--orange)] m-0">
              {t.emailNotVerified}
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              className="font-data text-[11px] uppercase tracking-widest text-[var(--ink)] underline bg-transparent border-none cursor-pointer text-left p-0"
            >
              {t.resendVerification}
            </button>
          </div>
        )}

        {/* ── Forgot password form ── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
                {t.resetPassword}
              </span>
              <p className="font-body text-[14px] text-[var(--ink-2)] m-0">
                {t.resetPasswordSub}
              </p>
            </div>

            <Field label={t.email} id={emailId}>
              <input
                id={emailId}
                type="email"
                required
                autoComplete="username"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border-[1.5px] border-[var(--ink-4)] focus:border-[var(--ink)] bg-[var(--paper)] font-body text-[17px] outline-none"
              />
            </Field>

            {error && (
              <p className="font-data text-[12px] text-[var(--orange)] uppercase tracking-widest border-[1.5px] border-[var(--orange)] px-3 py-2 m-0">{error}</p>
            )}

            <Button type="submit" variant="primary" fullWidth disabled={loading}
              style={{ height: 48, fontSize: 18 }}>
              {loading ? '...' : t.sendResetLink}
            </Button>

            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null) }}
              className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest bg-transparent border-none cursor-pointer p-0 hover:opacity-75 text-center"
            >
              ← {t.backToSignIn}
            </button>
          </form>
        )}

        {/* ── Reset link sent ── */}
        {mode === 'forgot-sent' && (
          <div className="flex flex-col gap-5">
            <div className="border-[1.5px] border-[var(--green)] bg-[var(--green-soft)] p-4 flex flex-col gap-2">
              <p className="font-data text-[12px] text-[var(--green-ink)] uppercase tracking-widest m-0">
                {t.checkInbox}
              </p>
              <p className="font-body text-[14px] text-[var(--ink)] m-0">
                {t.resetLinkSent}{' '}
                <strong>{email}</strong>.
              </p>
              <p className="font-body text-[13px] text-[var(--ink-3)] m-0">
                ลิงก์จะหมดอายุใน 1 ชั่วโมง · Link expires in 1 hour.
              </p>
            </div>

            <div className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest text-center">
              {t.didntReceive}{' '}
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-[var(--green-ink)] bg-transparent border-none cursor-pointer p-0 font-data text-[11px] uppercase tracking-widest hover:opacity-75"
              >
                {t.resendLink}
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null) }}
              className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest bg-transparent border-none cursor-pointer p-0 hover:opacity-75 text-center"
            >
              ← {t.backToSignIn}
            </button>
          </div>
        )}

        {/* ── Set new password (recovery session) ── */}
        {mode === 'reset' && (
          <form onSubmit={handleSetNewPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
                {t.setNewPassword}
              </span>
              <p className="font-body text-[14px] text-[var(--ink-2)] m-0">
                {t.setNewPasswordSub}
              </p>
            </div>

            <Field label={t.newPassword} id={newPassId}>
              <div className="relative">
                <input
                  id={newPassId}
                  type={showNewPass ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 border-[1.5px] border-[var(--ink-4)] focus:border-[var(--ink)] bg-[var(--paper)] font-body text-[17px] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(v => !v)}
                  tabIndex={-1}
                  aria-label={showNewPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  <EyeIcon open={showNewPass} />
                </button>
              </div>
            </Field>

            <Field label={t.confirmNewPassword} id={confirmPassId}>
              <div className="relative">
                <input
                  id={confirmPassId}
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 border-[1.5px] border-[var(--ink-4)] focus:border-[var(--ink)] bg-[var(--paper)] font-body text-[17px] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(v => !v)}
                  tabIndex={-1}
                  aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  <EyeIcon open={showConfirmPass} />
                </button>
              </div>
            </Field>

            {/* Strength hint */}
            {newPassword.length > 0 && (
              <div className="flex gap-1 -mt-2">
                {[1,2,3,4].map(n => (
                  <div key={n} className="flex-1 h-1 border-[1px] border-[var(--ink-4)]"
                    style={{
                      backgroundColor: newPassword.length >= n * 3
                        ? (newPassword.length >= 10 ? 'var(--green)' : 'var(--orange)')
                        : 'transparent'
                    }}
                  />
                ))}
              </div>
            )}

            {error && (
              <p className="font-data text-[12px] text-[var(--orange)] uppercase tracking-widest border-[1.5px] border-[var(--orange)] px-3 py-2 m-0">{error}</p>
            )}

            <Button type="submit" variant="primary" fullWidth disabled={loading}
              style={{ height: 48, fontSize: 18 }}>
              {loading ? '...' : t.setNewPassword + ' →'}
            </Button>
          </form>
        )}

        {!unverified && (mode === 'signin' || mode === 'signup') && (
          <>
            {/* Email / Password form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label={t.email} id={emailId}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] pointer-events-none">
                    <MailIcon />
                  </span>
                  <input
                    id={emailId}
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border-[1.5px] border-[var(--ink-4)] focus:border-[var(--ink)] bg-[var(--paper)] font-body text-[17px] outline-none"
                  />
                </div>
              </Field>

              <Field label={t.password} id={passwordId}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] pointer-events-none">
                    <LockIcon />
                  </span>
                  <input
                    id={passwordId}
                    type={showPass ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border-[1.5px] border-[var(--ink-4)] focus:border-[var(--ink)] bg-[var(--paper)] font-body text-[17px] outline-none"
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
                  <span className="w-3.5 h-3.5 border-[1.5px] border-[var(--ink)] flex items-center justify-center flex-shrink-0 relative"
                    style={{ backgroundColor: rememberMe ? 'var(--green-soft)' : 'var(--paper)' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer m-0"
                      aria-label="Remember me"
                    />
                    {rememberMe && (
                      <svg width="9" height="9" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                        <path d="M1 4l3 3 5-6" stroke="var(--green-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(v => !v)
                    setForgotSent(false)
                    setForgotError(null)
                    setForgotEmail('')
                  }}
                  className="font-data text-[11px] text-[var(--green-ink)] uppercase tracking-widest bg-transparent border-none cursor-pointer p-0 hover:opacity-75 transition-opacity"
                >
                  {t.forgotPassword}
                </button>
              </div>

              {/* Inline forgot password panel */}
              {showForgot && (
                <div className="flex flex-col gap-2 -mt-1">
                  {forgotSent ? (
                    <p className="font-data text-[11px] text-[var(--green-ink)] uppercase tracking-widest m-0">
                      Check your email for a reset link
                    </p>
                  ) : (
                    <form onSubmit={handleInlineForgot} className="flex flex-col gap-2">
                      <input
                        type="email"
                        required
                        autoComplete="username"
                        placeholder="your@email.com"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        className="border-[1.5px] border-[var(--ink-4)] focus:border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] w-full px-3 py-2 outline-none"
                      />
                      {forgotError && (
                        <p className="border-[1.5px] border-[var(--orange)] font-data text-[12px] uppercase tracking-widest px-3 py-2 m-0 text-[var(--orange)]">
                          {forgotError}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] px-3 py-2 bg-transparent hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {forgotLoading ? '...' : 'Send reset link'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {error && (
                <p className="font-data text-[12px] text-[var(--orange)] uppercase tracking-widest border-[1.5px] border-[var(--orange)] px-3 py-2 m-0">{error}</p>
              )}

              <Button type="submit" variant="primary" fullWidth disabled={loading}
                style={{ height: 48, fontSize: 18, marginTop: 2 }}>
                {loading ? '...' : mode === 'signin'
                  ? `Sign in → /${role === 'buyer' ? 'dashboard' : 'home'}`
                  : 'Create account →'}
              </Button>
              {mode === 'signin' && (
                <p className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest text-center m-0">
                  press &amp; hold to sign in
                </p>
              )}
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--ink-4)]" />
              <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-[var(--ink-4)]" />
            </div>

            {/* Google OAuth */}
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
