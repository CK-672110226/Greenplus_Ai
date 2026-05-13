import { useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { useT } from '../hooks/useT'
import { Logo } from '../components/Logo'

const ROLE_DEST = { user: '/home', buyer: '/dashboard', admin: '/admin' }

export function LandingPage() {
  const navigate          = useNavigate()
  const { session, profile, loading } = useSelector(s => s.user)
  const t                 = useT()

  if (!loading && session && profile?.role) {
    return <Navigate to={ROLE_DEST[profile.role] ?? '/scan'} replace />
  }

  const roles = [
    { key: 'user',  label: t.roleUser,  desc: t.roleUserDesc,  marker: 'U' },
    { key: 'buyer', label: t.roleBuyer, desc: t.roleBuyerDesc, marker: 'B' },
  ]

  return (
    <main className="flex flex-col items-center gap-10 px-6 py-16">
      <div className="text-center max-w-xl flex flex-col items-center gap-4">
        <Logo height={72} />
        <h1 className="font-brand text-[34px] text-[var(--ink)] leading-tight m-0">
          GreenPlus<span className="text-[var(--green)]">.</span>Ai
        </h1>
        <p className="font-body text-[18px] text-[var(--ink-2)] m-0">{t.tagline}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
        {roles.map(r => (
          <Card
            key={r.key}
            className="flex flex-col gap-3 cursor-pointer hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--ink)] transition-all"
            onClick={() => navigate(`/login?role=${r.key}`)}
          >
            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{r.marker}</span>
            <h2 className="font-brand text-[20px] text-[var(--ink)] m-0">{r.label}</h2>
            <p className="font-body text-[15px] text-[var(--ink-2)] m-0 flex-1">{r.desc}</p>
            <Button variant="primary" fullWidth>{t.signIn}</Button>
          </Card>
        ))}
      </div>
    </main>
  )
}
