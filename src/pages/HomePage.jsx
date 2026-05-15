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

function greetingMsg(name) {
  const h = new Date().getHours()
  const part = h < 12 ? 'MORNING' : h < 17 ? 'AFTERNOON' : 'EVENING'
  return `GOOD ${part}, ${(name ?? 'YOU').toUpperCase()}`
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
<<<<<<< Updated upstream
  const ecoPoints   = profile?.eco_points ?? 0
=======
  const { salute, name: displayName } = greeting(profile?.display_name)

  // Recent items: show basket items (up to 5) as "recent scans"
  const recentItems = activeItems.length > 0 ? activeItems.slice(-5).reverse() : []

  // Nearby shops (first 3)
  const nearbyShops = SHOPS.slice(0, 3)
>>>>>>> Stashed changes

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      {/* Greeting */}
      <div className="flex flex-col gap-0.5">
        <h1 className="font-brand text-[26px] text-[var(--ink)] m-0 leading-tight">
          {greetingMsg(profile?.display_name)}
        </h1>
        <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
          {weeklyKg} kg this week
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="Weekly earnings"
          value={`฿${totalValue.toFixed(0)}`}
          trend={totalValue > 0 ? { dir: 'up', value: `฿${totalValue.toFixed(0)}`, note: 'this week' } : undefined}
        />
        <KpiCard
          label="Eco points"
          value={ecoPoints}
          unit="pts"
        />
      </div>

      {/* Weekly hatch chart */}
      <div className="flex flex-col gap-1.5">
        <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">Weekly scan volume (kg)</span>
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

<<<<<<< Updated upstream
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
                  {localName(item.material, language)}
                </span>
                <div className="flex items-center gap-2">
                  <GradeTag grade={item.grade} />
                  <span className="font-data text-[12px] text-[var(--ink-2)]">
                    ฿{(pricePerKg(item.materialType, item.grade) * (item.weight ?? 0)).toFixed(0)}
=======
        {/* Earnings */}
        <div className="flex flex-col gap-1.5 px-6 lg:px-10 py-5 sm:border-r-[1.5px] border-[var(--ink)] border-t-[1.5px] sm:border-t-0 border-[var(--ink)]">
          <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">
            Earnings
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-brand text-[40px] text-[var(--ink)] leading-none">฿{totalValue.toFixed(0)}</span>
            <span className="font-data text-[12px] text-[var(--ink-3)]">thb</span>
          </div>
          {totalValue > 0 && (
            <span className="font-data text-[11px] text-[var(--green-ink)]">▲ ฿{totalValue.toFixed(0)} this week</span>
          )}
          <span className="font-data text-[10px] text-[var(--ink-4)]">pending payout ฿{(totalValue * 0.63).toFixed(0)}</span>
        </div>

      </div>

      {/* ── Main body (2-col on desktop) ───────────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1">

        {/* Left column */}
        <div className="flex flex-col flex-1 min-w-0 lg:border-r-[1.5px] lg:border-[var(--ink)]">

          {/* Weekly chart */}
          <div className="px-6 lg:px-10 py-6 border-b-[1.5px] border-[var(--ink)]">
            <div className="flex items-center justify-between mb-3">
              <SectionDivider label="Weekly impact · 7 days" />
              <span className="font-data text-[10px] text-[var(--ink-4)]">last refresh 4m</span>
            </div>
            <div className="border-[1.5px] border-[var(--ink)] px-4 pt-4 pb-2 bg-[var(--paper-2)]">
              <HatchBarChart data={MOCK_WEEKLY} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="px-6 lg:px-10 py-6">
            <SectionDivider label="Quick actions" />
            <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { action: () => navigate('/scan'),        sub: 'use AI camera',   title: 'Scan an item' },
                { action: () => navigate('/marketplace'), sub: 'buy & sell',      title: 'Marketplace' },
                { action: () => navigate('/map'),         sub: 'live rates',      title: "Today's prices" },
                { action: () => navigate('/map'),         sub: 'find shops',      title: 'Nearby buyer' },
              ].map(({ action, sub, title }) => (
                <button
                  key={title}
                  onClick={action}
                  className="flex flex-col gap-2 border-[1.5px] border-[var(--ink)] px-4 py-5 text-left bg-[var(--paper-2)] cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors group shadow-[3px_3px_0_var(--ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                >
                  <span className="font-data text-[9px] text-[var(--ink-3)] uppercase tracking-widest group-hover:text-[var(--ink-4)]">
                    {sub}
                  </span>
                  <span className="font-brand text-[17px] text-[var(--ink)] group-hover:text-[var(--paper)] leading-tight">
                    {title}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/map')}
              className="mt-3 font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest bg-transparent border-none cursor-pointer hover:text-[var(--ink)] transition-colors"
            >
              see all shortcuts →
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col w-full lg:w-[320px] shrink-0">

          {/* Recent scans */}
          <div className="px-6 py-6 border-t-[1.5px] lg:border-t-0 border-[var(--ink)] border-b-[1.5px]">
            <SectionDivider label="Recent scans" />

            {recentItems.length > 0 ? (
              <div className="flex flex-col mt-3">
                {recentItems.map((item, idx) => {
                  const value = pricePerKg(item.materialType, item.grade) * (item.weight ?? 0)
                  const timeLabels = ['2m ago', '1h ago', 'Yest.', '2d ago', '3d ago']
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 border-b-[1px] border-[var(--ink-4)] last:border-b-0"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-body text-[14px] text-[var(--ink)]">
                          {localName(item.materialType, language)} · {(item.weight ?? 0).toFixed(1)}kg
                        </span>
                        <span className="font-data text-[10px] text-[var(--ink-4)]">
                          {timeLabels[idx] ?? 'Recent'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GradeTag grade={item.grade} />
                        <span className="font-data text-[13px] text-[var(--ink)]">฿{value.toFixed(0)}</span>
                      </div>
                    </div>
                  )
                })}
                <button
                  onClick={() => navigate('/basket')}
                  className="mt-3 w-full font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] py-2.5 text-center bg-transparent cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
                >
                  View basket · {activeItems.length} items
                </button>
              </div>
            ) : lastScan ? (
              <div className="flex items-center justify-between py-3 mt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-body text-[14px] text-[var(--ink)]">
                    {localName(lastScan.material, language)}
                  </span>
                  <span className="font-data text-[10px] text-[var(--ink-4)]">
                    {t.confidence} {lastScan.confidence}%
>>>>>>> Stashed changes
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
                {localName(lastScan.material, language)}
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
        <SectionDivider label="quick access" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { path: '/map',        sub: t.nearbyShops, title: t.map },
            { path: '/eco-points', sub: t.yourPoints,  title: t.ecoPoints },
            { path: '/prices',     sub: "today's rates", title: 'Prices' },
            { path: '/profile',    sub: 'your account',  title: 'Profile' },
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
