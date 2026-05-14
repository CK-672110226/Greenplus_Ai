import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { KpiCard } from '../components/KpiCard'
import { SectionDivider } from '../components/SectionDivider'
import { localName, pricePerKg } from '../data/wasteItems'

const MOCK_WEEKLY = [
  { label: 'M', val: 1.2 },
  { label: 'T', val: 0.8 },
  { label: 'W', val: 2.1 },
  { label: 'T', val: 0.5 },
  { label: 'F', val: 1.8 },
  { label: 'S', val: 3.2 },
  { label: 'S', val: 0.9 },
]

function HatchBarChart({ data }) {
  const max = Math.max(...data.map(d => d.val), 1)
  const W = 280
  const barW = 28
  const gap = (W - data.length * barW) / (data.length + 1)
  return (
    <svg width="100%" height="80" viewBox={`0 0 ${W} 80`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="hatch-home" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--green)" strokeWidth="1.5" />
        </pattern>
      </defs>
      {data.map((d, i) => {
        const barH = Math.max(4, (d.val / max) * 56)
        const x = gap + i * (barW + gap)
        const y = 64 - barH
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill="url(#hatch-home)" stroke="var(--ink)" strokeWidth="1" />
            <text x={x + barW / 2} y={76} textAnchor="middle" fontSize="9" fill="var(--ink-3)" fontFamily="var(--mono)">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

function greetingKey() {
  const h = new Date().getHours()
  return h < 12 ? 'goodMorning' : h < 17 ? 'goodAfternoon' : 'goodEvening'
}

export function HomePage() {
  const navigate  = useNavigate()
  const t         = useT()
  const { language, profile } = useSelector(s => s.user)
  const basket    = useSelector(s => s.waste?.basket ?? [])
  const lastScan  = useSelector(s => s.waste?.lastScan)

  const activeItems = basket.filter(i => !i.skipped)
  const totalValue  = activeItems.reduce((sum, i) => sum + pricePerKg(i.materialType, i.grade) * (i.weight ?? 0), 0)
  const weeklyKg    = MOCK_WEEKLY.reduce((s, d) => s + d.val, 0).toFixed(1)
  const ecoPoints   = profile?.eco_points ?? 0

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      {/* Greeting */}
      <div className="flex flex-col gap-0.5">
        <h1 className="font-brand text-[26px] text-[var(--ink)] m-0 leading-tight">
          {t[greetingKey()]}, {profile?.display_name ?? '—'}
        </h1>
        <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
          {weeklyKg} kg {t.weeklyVolume ? `· ${t.weeklyVolume}` : 'this week'}
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label={t.weeklyEarnings ?? 'Weekly earnings'}
          value={`฿${totalValue.toFixed(0)}`}
          trend={totalValue > 0 ? { dir: 'up', value: `฿${totalValue.toFixed(0)}`, note: 'this week' } : undefined}
        />
        <KpiCard
          label={t.ecoPoints ?? 'Eco points'}
          value={ecoPoints}
          unit="pts"
        />
      </div>

      {/* Weekly hatch chart */}
      <div className="flex flex-col gap-1.5">
        <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.weeklyVolume ?? 'Weekly scan volume (kg)'}</span>
        <div className="border-[1.5px] border-[var(--ink)] px-3 pt-3 pb-1 bg-[var(--paper)]">
          <HatchBarChart data={MOCK_WEEKLY} />
        </div>
      </div>

      {/* Scan CTA */}
      <Card
        className="flex flex-col items-center gap-4 py-8 cursor-pointer hover:-translate-y-px hover:shadow-[3px_3px_0_var(--ink)] transition-all text-center"
        onClick={() => navigate('/scan')}
      >
        <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
          {t.scanTap}
        </span>
        <div className="w-16 h-16 border-[2px] border-[var(--ink)] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 7 4 4 7 4" />
            <polyline points="17 4 20 4 20 7" />
            <polyline points="20 17 20 20 17 20" />
            <polyline points="7 20 4 20 4 17" />
            <rect x="8" y="8" width="8" height="8" rx="1" />
          </svg>
        </div>
        <Button variant="primary" className="w-full max-w-[200px]">
          {t.scanBtn}
        </Button>
      </Card>

      {/* Active basket */}
      {activeItems.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionDivider label={t.basket} />
          <div className="flex flex-col gap-2">
            {activeItems.slice(0, 3).map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between border-[1.5px] border-[var(--ink-4)] px-3 py-2"
              >
                <span className="font-body text-[15px] text-[var(--ink)]">
                  {localName(item.materialType, language)}
                </span>
                <div className="flex items-center gap-2">
                  <GradeTag grade={item.grade} />
                  <span className="font-data text-[12px] text-[var(--ink-2)]">
                    ฿{(pricePerKg(item.materialType, item.grade) * (item.weight ?? 0)).toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
            {activeItems.length > 3 && (
              <button
                onClick={() => navigate('/basket')}
                className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest bg-transparent border-none cursor-pointer py-1 self-start"
              >
                +{activeItems.length - 3} more
              </button>
            )}
          </div>
          <Button variant="primary" fullWidth onClick={() => navigate('/basket')}>
            {t.findRoute}
          </Button>
        </div>
      )}

      {/* Last scan result */}
      {lastScan && (
        <div className="flex flex-col gap-2">
          <SectionDivider label={t.scanResult} />
          <Card className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="font-body text-[15px] text-[var(--ink)]">
                {localName(lastScan.materialType, language)}
              </span>
              <span className="font-data text-[11px] text-[var(--ink-3)]">
                {t.confidence} {lastScan.confidence}%
              </span>
            </div>
            <GradeTag grade={lastScan.grade} />
          </Card>
        </div>
      )}

      {/* Quick links */}
      <div className="flex flex-col gap-2">
        <SectionDivider label={t.quickAccess ?? 'Quick access'} />
        <div className="grid grid-cols-2 gap-3">
          {[
            { path: '/map',        sub: t.nearbyShops ?? 'Nearby shops', title: t.map },
            { path: '/eco-points', sub: t.yourPoints  ?? 'Your points',  title: t.ecoPoints },
            { path: '/marketplace',sub: t.todayRates  ?? "Today's rates", title: t.marketplace ?? 'Prices' },
            { path: '/profile',    sub: t.yourAccount ?? 'Your account',  title: t.profile ?? 'Profile' },
          ].map(({ path, sub, title }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col gap-1 border-[1.5px] border-[var(--ink)] px-4 py-4 text-left bg-transparent cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors group"
            >
              <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest group-hover:text-[var(--paper)]">
                {sub}
              </span>
              <span className="font-brand text-[16px] text-[var(--ink)] group-hover:text-[var(--paper)]">
                {title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
