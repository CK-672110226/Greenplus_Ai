import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  const navigate   = useNavigate()
  const [params]   = useSearchParams()
  const role       = params.get('role') ?? 'user'
  const t          = useT()

  const [mode, setMode]         = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

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
    navigate(ROLE_DEST[role] ?? '/scan')
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
