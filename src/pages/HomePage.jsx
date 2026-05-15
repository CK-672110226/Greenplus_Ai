import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { GradeTag } from '../components/GradeTag'
import { SectionDivider } from '../components/SectionDivider'
import { localName, pricePerKg, WASTE_ITEMS } from '../data/wasteItems'
import { useShops } from '../hooks/useShops'
import { hourBangkok, weeklyBuckets } from '../utils/time'

/* ── Hatch bar chart ───────────────────────────────────────── */
function HatchBarChart({ data }) {
  const max = Math.max(...data.map(d => d.val), 1)
  const W = 420
  const barW = 42
  const gap = (W - data.length * barW) / (data.length + 1)

  return (
    <svg width="100%" height="110" viewBox={`0 0 ${W} 110`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="hatch-green" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--green)" strokeWidth="2" />
        </pattern>
        <pattern id="hatch-dim" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ink-4)" strokeWidth="1" />
        </pattern>
      </defs>
      {data.map((d, i) => {
        const isMax = d.val === max
        const barH = Math.max(8, (d.val / max) * 72)
        const x = gap + i * (barW + gap)
        const y = 82 - barH
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={barW} height={barH}
              fill={isMax ? 'url(#hatch-green)' : 'url(#hatch-dim)'}
              stroke={isMax ? 'var(--ink)' : 'var(--ink-4)'}
              strokeWidth={isMax ? '1.5' : '1'}
            />
            <text x={x + barW / 2} y={96} textAnchor="middle" fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-data)">
              {d.label}
            </text>
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="9" fill={isMax ? 'var(--green-ink)' : 'var(--ink-4)'} fontFamily="var(--font-data)">
              {d.val}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ── Greeting ──────────────────────────────────────────────── */
function greeting(name) {
  const h = hourBangkok()
  const salute = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return { salute, name: name ?? 'there' }
}

/* ── HomePage ──────────────────────────────────────────────── */
export function HomePage() {
  const navigate  = useNavigate()
  const t         = useT()
  const { language, profile } = useSelector(s => s.user)
  const basket    = useSelector(s => s.waste?.basket ?? [])
  const lastScan  = useSelector(s => s.waste?.lastScan)

  const { shops } = useShops()

  const activeItems  = basket.filter(i => !i.skipped)
  const totalValue   = activeItems.reduce((sum, i) => sum + pricePerKg(i.materialType, i.grade) * (i.weight ?? 0), 0)
  const weeklyData   = weeklyBuckets(basket, 'weight')
  const weeklyKg     = weeklyData.reduce((s, d) => s + d.val, 0).toFixed(1)
const { salute, name: displayName } = greeting(profile?.display_name)

  const recentItems = activeItems.length > 0 ? activeItems.slice(-5).reverse() : []
  const nearbyShops = shops.slice(0, 3)

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Page header ────────────────────────────────────────── */}
      <div className="px-6 lg:px-10 pt-7 pb-5 border-b-[1.5px] border-[var(--ink)]">
        {/* Breadcrumb */}
        <div className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-[0.15em] mb-3">
          Home / Dashboard
        </div>

        {/* Greeting row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="font-brand text-[30px] lg:text-[38px] text-[var(--ink)] m-0 leading-tight">
              {salute}, {displayName} —
            </h1>
            <p className="font-body text-[16px] text-[var(--ink-3)] m-0 mt-0.5">
              {weeklyKg} kg collected · good haul this week.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* "+ New Scan" CTA */}
            <button
              onClick={() => navigate('/scan')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--green)] text-[var(--paper)] border-[1.5px] border-[var(--ink)] shadow-[3px_3px_0_var(--ink)] hover:shadow-[1px_1px_0_var(--ink)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer font-data text-[12px] uppercase tracking-widest"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Scan
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI strip (3 cards) ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-b-[1.5px] border-[var(--ink)]">
        {/* kg recycled */}
        <div className="flex flex-col gap-1.5 px-6 lg:px-10 py-5 sm:border-r-[1.5px] border-[var(--ink)]">
          <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">
            This week · kg recycled
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-brand text-[40px] text-[var(--ink)] leading-none">{weeklyKg}</span>
            <span className="font-data text-[12px] text-[var(--ink-3)]">kg</span>
          </div>
          <span className="font-data text-[11px] text-[var(--ink-3)]">vs last week</span>
        </div>

        {/* Earnings */}
        <div className="flex flex-col gap-1.5 px-6 lg:px-10 py-5 sm:border-r-[1.5px] border-[var(--ink)] border-t-[1.5px] sm:border-t-0 border-[var(--ink)]">
          <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">
            Earnings
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-data text-[40px] text-[var(--ink)] leading-none">฿{totalValue.toFixed(0)}</span>
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
              <HatchBarChart data={weeklyData} />
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
                  </span>
                </div>
                <GradeTag grade={lastScan.grade} />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 7 4 4 7 4" /><polyline points="17 4 20 4 20 7" />
                  <polyline points="20 17 20 20 17 20" /><polyline points="7 20 4 20 4 17" />
                  <rect x="8" y="8" width="8" height="8" rx="1" />
                </svg>
                <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">
                  No scans yet — tap New Scan
                </span>
              </div>
            )}
          </div>

          {/* Nearby buying requests */}
          <div className="px-6 py-6">
            <SectionDivider label="Nearby buying requests" />
            <div className="flex flex-col mt-3">
              {nearbyShops.map(shop => {
                const topMaterial = (shop.accepts ?? [])[0]
                const price = topMaterial ? pricePerKg(topMaterial, 'A') : 0
                return (
                  <div
                    key={shop.id}
                    className="flex items-start justify-between py-3 border-b-[1px] border-[var(--ink-4)] last:border-b-0"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-body text-[14px] text-[var(--ink)]">{shop.name}</span>
                      <span className="font-data text-[10px] text-[var(--ink-3)]">
                        {shop.distanceKm ?? '—'} km
                      </span>
                      {topMaterial && (
                        <span className="font-data text-[10px] text-[var(--ink-4)] mt-0.5">
                          {language === 'th'
                            ? (WASTE_ITEMS[topMaterial]?.nameTh ?? topMaterial)
                            : (WASTE_ITEMS[topMaterial]?.nameEn ?? topMaterial)}
                        </span>
                      )}
                    </div>
                    {topMaterial && (
                      <span className="font-data text-[13px] text-[var(--green-ink)] mt-0.5 shrink-0">
                        ฿{price.toFixed(0)}/kg
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="font-data text-[10px] text-[var(--ink-4)]">
                {nearbyShops.length} active · within 4km
              </span>
              <button
                onClick={() => navigate('/map')}
                className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest bg-transparent border-none cursor-pointer hover:text-[var(--ink)] transition-colors"
              >
                view all →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
