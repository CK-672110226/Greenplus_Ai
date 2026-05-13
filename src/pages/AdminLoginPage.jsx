import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'

export function AdminLoginPage() {
  const navigate             = useNavigate()
  const { session, profile } = useSelector(s => s.user)

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState(null)
  const [loading, setLoading]   = useState(false)

  const wrongRole = session && profile && profile.role !== 'admin'

  useEffect(() => {
    if (session && profile?.role === 'admin') {
      navigate('/admin', { replace: true })
    }
    if (wrongRole) {
      supabase.auth.signOut()
    }
  }, [session, profile, navigate, wrongRole])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    setLoading(true)
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    if (authErr) setFormError(authErr.message)
    setLoading(false)
  }

  const displayError = wrongRole ? 'This account does not have admin access.' : formError

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 bg-[var(--ink)]">
      <Card className="w-full max-w-xs flex flex-col gap-5 bg-[var(--paper)]">
        <div className="flex flex-col gap-2">
          <Logo height={32} />
          <h1 className="font-brand text-[24px] text-[var(--ink)] m-0">Admin Access</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-data text-[11px] text-[var(--ink-2)] uppercase tracking-widest">Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[17px] outline-none focus:border-[var(--green)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-data text-[11px] text-[var(--ink-2)] uppercase tracking-widest">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[17px] outline-none focus:border-[var(--green)]"
            />
          </div>

          {displayError && <p className="font-body text-[13px] text-[var(--orange)] m-0">{displayError}</p>}

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? '...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </main>
  )
}
