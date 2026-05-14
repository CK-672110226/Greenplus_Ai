import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { setLanguage } from '../store/userSlice'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { ParticleField } from '../components/ParticleField'
import { supabase } from '../lib/supabase'

const ROLE_DEST = { user: '/home', buyer: '/dashboard', admin: '/admin' }

const ROLES = [
  {
    key: 'user',
    icon: '♻',
    title: "I'm a recycler",
    desc: 'Households, baan-rao, café owners selling their daily scrap.',
    features: ['scan', 'basket', 'map', 'eco-points'],
    accent: true,
  },
  {
    key: 'buyer',
    icon: '฿',
    title: "I'm a buyer / shop",
    desc: 'Saleng, scrap shops, recycling co-ops setting daily prices.',
    features: ['bookings', 'pricing', 'marketplace'],
    accent: false,
  },
]

export function LandingPage() {
  const navigate              = useNavigate()
  const dispatch              = useDispatch()
  const { session, profile, loading, language } = useSelector(s => s.user)

  const [activeShops, setActiveShops] = useState(null)
  useEffect(() => {
    supabase.from('shops').select('id', { count: 'exact', head: true }).eq('status', 'active')
      .then(({ count }) => setActiveShops(count ?? 0))
  }, [])

  if (!loading && session && profile?.role) {
    return <Navigate to={ROLE_DEST[profile.role] ?? '/scan'} replace />
  }

  const stats = [
    { n: '—',                                      l: 'kg recycled' },
    { n: '—',                                      l: 'paid out' },
    { n: activeShops != null ? `${activeShops}` : '—', l: 'active buyers' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[var(--paper)]">

      {/* ── Top nav bar ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 bg-[var(--paper)] border-b-[1.5px] border-[var(--ink)]">
        <Logo height={32} showWordmark />
        <nav className="flex items-center gap-5">
          {['How it works', 'Pricing', 'For buyers'].map(l => (
            <span key={l} className="hidden md:block font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest cursor-pointer hover:text-[var(--ink)] transition-colors">
              {l}
            </span>
          ))}
          <button
            onClick={() => dispatch(setLanguage(language === 'th' ? 'en' : 'th'))}
            className="font-data text-[11px] border-[1.5px] border-[var(--ink-4)] px-2 py-0.5 bg-transparent cursor-pointer hover:border-[var(--ink)] transition-colors"
          >
            {language === 'th' ? 'EN' : 'TH'}
          </button>
        </nav>
      </header>

      {/* ── Hero — two-column on md+ ── */}
      <main className="relative flex-1 grid md:grid-cols-2 overflow-hidden">
        <ParticleField />

        {/* Left — copy + stats */}
        <div className="relative z-10 flex flex-col gap-6 px-6 md:px-12 py-10 md:py-16 border-b-[1.5px] md:border-b-0 md:border-r-[1.5px] border-[var(--ink)]">

          {/* Pilot chip */}
          <span className="inline-flex items-center gap-2 font-data text-[11px] text-[var(--green-ink)] border-[1.5px] border-[var(--green)] bg-[var(--green-soft)] px-3 py-1 w-fit uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] flex-shrink-0 animate-pulse" />
            live · Chiang Mai pilot
          </span>

          {/* Headline */}
          <div className="flex flex-col gap-3">
            <h1 className="font-brand text-[36px] md:text-[48px] text-[var(--ink)] leading-[1.1] m-0">
              Scan trash.<br />
              Earn cash.<br />
              <span className="text-[var(--green-ink)]">Recycle smarter.</span>
            </h1>
            <p className="font-body text-[18px] text-[var(--ink-2)] m-0 max-w-sm">
              Point your camera at any recyclable. Our AI grades it, quotes today's market price, and finds the nearest buyer in seconds.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('/login?role=user')}
              style={{ height: 48, fontSize: 18, paddingLeft: 22, paddingRight: 22 }}
            >
              I have recyclables →
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/login?role=buyer')}
              style={{ height: 48, fontSize: 18, paddingLeft: 22, paddingRight: 22 }}
            >
              I want to buy
            </Button>
          </div>

          {/* Stats bar */}
          <div className="flex border-[1.5px] border-[var(--ink)] divide-x-[1.5px] divide-[var(--ink)]">
            {stats.map(s => (
              <div key={s.l} className="flex flex-col gap-0.5 px-4 py-3 flex-1">
                <span className="font-brand text-[22px] md:text-[26px] text-[var(--ink)] leading-none">{s.n}</span>
                <span className="font-data text-[9px] text-[var(--ink-3)] uppercase tracking-widest">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — role chooser */}
        <div className="relative z-10 flex flex-col gap-5 px-6 md:px-10 py-10 md:py-16">
          <div>
            <h2 className="font-brand text-[26px] text-[var(--ink)] m-0">Pick your side</h2>
            <p className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest m-0 mt-1">
              Two roles. Two layouts. Same backend.
            </p>
          </div>

          {ROLES.map(r => (
            <button
              key={r.key}
              onClick={() => navigate(`/login?role=${r.key}`)}
              className={[
                'flex items-start gap-4 p-4 border-[1.5px] text-left cursor-pointer w-full transition-all group',
                r.accent
                  ? 'border-[var(--green)] bg-[var(--green-soft)] hover:shadow-[3px_3px_0_var(--ink)]'
                  : 'border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--ink)] hover:text-[var(--paper)] hover:shadow-[3px_3px_0_var(--ink)]',
              ].join(' ')}
            >
              {/* Icon box */}
              <span className={[
                'w-10 h-10 flex items-center justify-center text-[20px] border-[1.5px] flex-shrink-0',
                r.accent
                  ? 'border-[var(--green-ink)] bg-[var(--green)] text-[#062040]'
                  : 'border-[var(--ink)] bg-[var(--paper-2)] group-hover:border-[var(--paper-2)] group-hover:bg-[var(--paper-2)] group-hover:text-[var(--ink)]',
              ].join(' ')}>
                {r.icon}
              </span>

              {/* Text */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <h3 className={[
                  'font-body text-[17px] font-semibold m-0',
                  r.accent ? 'text-[var(--green-ink)]' : 'text-[var(--ink)] group-hover:text-[var(--paper)]',
                ].join(' ')}>
                  {r.title}
                </h3>
                <p className={[
                  'font-body text-[14px] m-0',
                  r.accent ? 'text-[var(--ink-2)]' : 'text-[var(--ink-3)] group-hover:text-[var(--ink-4)]',
                ].join(' ')}>
                  {r.desc}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {r.features.map(f => (
                    <span key={f} className={[
                      'font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border',
                      r.accent
                        ? 'border-[var(--green-ink)] text-[var(--green-ink)] bg-transparent'
                        : 'border-[var(--ink-4)] text-[var(--ink-3)] group-hover:border-[var(--ink-4)] group-hover:text-[var(--ink-4)]',
                    ].join(' ')}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <span className={[
                'font-data text-[18px] self-center flex-shrink-0',
                r.accent ? 'text-[var(--green-ink)]' : 'text-[var(--ink-3)] group-hover:text-[var(--paper)]',
              ].join(' ')}>→</span>
            </button>
          ))}

          {/* Footer */}
          <div className="flex justify-between mt-auto pt-2">
            <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">v0.4 · pre-launch</span>
            <span className="font-data text-[10px] text-[var(--ink-4)]">support@greenplus.ai</span>
          </div>
        </div>
      </main>
    </div>
  )
}
