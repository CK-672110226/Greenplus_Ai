import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { Button } from '../components/Button'

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export function AdminLoginPage() {
  const navigate             = useNavigate()
  const { session, profile } = useSelector(s => s.user)

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
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
    <main className="flex flex-col items-center justify-center min-h-screen px-6" style={{ background: '#0e1013' }}>
      <div className="w-full max-w-xs flex flex-col gap-6">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="font-data text-[11px] px-2 py-0.5 border rounded-full"
                style={{ color: '#ff7a7a', borderColor: '#ff7a7a' }}>
            ● RESTRICTED
          </span>
          <span className="font-data text-[11px]" style={{ color: '#8a8880' }}>/x/admin</span>
          <span className="font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border"
                style={{ background: '#1f2226', color: '#fafaf7', borderColor: '#3a3d42' }}>
            internal only
          </span>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-1">
          <span className="font-data text-[11px] uppercase tracking-widest" style={{ color: '#8a8880' }}>
            STAFF SIGN-IN
          </span>
          <h1 className="font-brand text-[26px] m-0" style={{ color: '#fafaf7' }}>
            GreenPlus Admin Console
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-data text-[11px] uppercase tracking-widest" style={{ color: '#8a8880' }}>Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              placeholder="staff@greenplus.ai"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 font-body text-[17px] outline-none"
              style={{ background: '#1f2226', border: '1.5px solid #3a3d42', color: '#fafaf7' }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-data text-[11px] uppercase tracking-widest" style={{ color: '#8a8880' }}>Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 font-body text-[17px] outline-none"
                style={{ background: '#1f2226', border: '1.5px solid #3a3d42', color: '#fafaf7' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 transition-opacity hover:opacity-75"
                style={{ color: '#8a8880' }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          {displayError && (
            <p className="font-body text-[13px] m-0" style={{ color: '#ff7a7a' }}>{displayError}</p>
          )}

          <div className="font-data text-[11px]" style={{ color: '#8a8880' }}>
            Auto sign-out if role ≠ admin. All sessions logged for 90 days.
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={loading}
            style={{ height: 48, fontSize: 18, marginTop: 2 }}>
            {loading ? '...' : 'Authenticate →'}
          </Button>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="font-data text-[10px]" style={{ color: '#8a8880' }}>build #428 · 14 May</span>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-data text-[11px] bg-transparent border-none cursor-pointer p-0 hover:opacity-75 transition-opacity"
            style={{ color: '#8a8880' }}
          >
            ← back to public site
          </button>
        </div>
      </div>
    </main>
  )
}
