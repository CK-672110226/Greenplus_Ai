import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { useT } from '../hooks/useT'

const ROLE_DEST = { user: '/scan', buyer: '/dashboard', admin: '/admin' }

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}

export function LoginPage() {
  const navigate          = useNavigate()
  const [params]          = useSearchParams()
  const role              = params.get('role') ?? 'user'
  const t                 = useT()
  const { session, profile } = useSelector(s => s.user)

  const [mode, setMode]         = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)


  // Navigate after email/password login OR after Google OAuth redirect
  useEffect(() => {
    if (session && profile) {
      navigate(ROLE_DEST[profile.role] ?? '/scan', { replace: true })
    }
  }, [session, profile, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signup') {
      const { data, error: authErr } = await supabase.auth.signUp({ email, password })
      if (authErr) { setError(authErr.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('user_profiles').insert({
          id:            data.user.id,
          role,
          display_name:  email.split('@')[0],
          language_pref: 'th',
          eco_points:    0,
        })
      }
    } else {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) { setError(authErr.message); setLoading(false); return }
    }

    setLoading(false)
    // Navigation handled by useEffect above once session+profile are set
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
    // On success the browser redirects — no further action needed
  }

  async function handleGoogle() {
    setError(null)
    const { error: authErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + (ROLE_DEST[role] ?? '/scan') },
    })
    if (authErr) setError(authErr.message)
  }

  return (
    <main className="flex flex-col items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.loginTitle}</h1>
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{role}</span>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] text-[var(--ink)] cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"/>
            <path fill="#FBBC05" d="M24 46c5.9 0 10.9-2 14.5-5.4l-6.7-5.5C29.8 36.9 27 38 24 38c-6.1 0-10.7-3.9-11.8-9.2l-7 5.4C8.1 41.1 15.5 46 24 46z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.8-2.8 5.1-5.3 6.6l6.7 5.5C41.8 37.3 45 31.5 45 24c0-1.3-.2-2.7-.5-4z"/>
          </svg>
          {t.signInWithGoogle}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--ink-3)]" />
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.orDivider}</span>
          <div className="flex-1 h-px bg-[var(--ink-3)]" />
        </div>

        {/* Email / Password form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label={t.email}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[17px] outline-none focus:border-[var(--green)]"
            />
          </Field>

          <Field label={t.password}>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[17px] outline-none focus:border-[var(--green)]"
            />
          </Field>

          {error && (
            <p className="font-body text-[14px] text-[var(--orange)] m-0">{error}</p>
          )}

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? '...' : mode === 'signin' ? t.signIn : t.signUp}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1.5px] bg-[var(--ink-4)]" />
          <span className="font-data text-[10px] text-[var(--ink-4)] uppercase">or</span>
          <div className="flex-1 h-[1.5px] bg-[var(--ink-4)]" />
        </div>

        <Button variant="secondary" fullWidth onClick={handleGoogle}>
          {t.signInWithGoogle}
        </Button>

        <button
          type="button"
          onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}
          className="font-body text-[15px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors text-left bg-transparent border-none cursor-pointer p-0"
        >
          {mode === 'signin' ? `${t.noAccount} ${t.signUp}` : `${t.hasAccount} ${t.signIn}`}
        </button>
      </Card>
    </main>
  )
}
