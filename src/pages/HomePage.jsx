import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { GradeTag } from '../components/GradeTag'
import { SectionDivider } from '../components/SectionDivider'
import { localName, pricePerKg, WASTE_ITEMS } from '../data/wasteItems'
import { useShops } from '../hooks/useShops'
import { hourBangkok, weeklyBuckets } from '../utils/time'

/* ── Hatch bar chart ───────────────────────────────────────── */
function HatchBarChart({ data }) {
  const max = Math.max(...data.map(d => d.val), 0.1)
  const W = 420
  const barW = 40
  const gap = (W - data.length * barW) / (data.length + 1)

  return (
    <svg width="100%" height="110" viewBox={`0 0 ${W} 110`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="4" height="4">
          <line x1="0" y1="4" x2="4" y2="0" stroke="var(--green-ink)" strokeWidth="1"/>
        </pattern>
        <pattern id="hatch-dim" patternUnits="userSpaceOnUse" width="4" height="4">
          <line x1="0" y1="4" x2="4" y2="0" stroke="var(--ink-4)" strokeWidth="1"/>
        </pattern>
      </defs>
      {data.map((d, i) => {
        const isMax = d.val === max && d.val > 0
        const barH = Math.max(6, (d.val / max) * 70)
        const x = gap + i * (barW + gap)
        const y = 80 - barH
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={barW} height={barH}
              fill={isMax ? 'url(#hatch)' : 'url(#hatch-dim)'}
              stroke={isMax ? 'var(--ink)' : 'var(--ink-4)'}
              strokeWidth={isMax ? '1.5' : '1'}
            />
            <text x={x + barW / 2} y={95} textAnchor="middle" fontSize="9" fill="var(--ink-3)" fontFamily="var(--font-data)">
              {d.label}
            </text>
            {d.val > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="8" fill={isMax ? 'var(--green-ink)' : 'var(--ink-4)'} fontFamily="var(--font-data)">
                {d.val.toFixed(1)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ── Greeting ──────────────────────────────────────────────── */
function greeting(name) {
  const h = hourBangkok()
  const salute = h < 12 ? 'MORNING' : h < 17 ? 'AFTERNOON' : 'EVENING'
  return { salute, name: name ?? 'there' }
}

/* ── Tier helpers ──────────────────────────────────────────── */
function getTierName(pts) {
  if (pts >= 3000) return 'Platinum'
  if (pts >= 2000) return 'Gold'
  if (pts >= 1000) return 'Silver'
  return 'Bronze'
}

function getTierPct(pts) {
  if (pts >= 3000) return 100
  if (pts >= 2000) return ((pts - 2000) / 1000) * 100
  if (pts >= 1000) return ((pts - 1000) / 1000) * 100
  return (pts / 1000) * 100
}

/* ── HomePage ──────────────────────────────────────────────── */
export function HomePage() {
  const navigate  = useNavigate()
  const { language, profile } = useSelector(s => s.user)
  const basket    = useSelector(s => s.waste?.basket ?? [])
  const lastScan  = useSelector(s => s.waste?.lastScan)

  const { shops, loading } = useShops()

  const [lastRefresh] = useState(() => new Date())

  const activeItems  = basket.filter(i => !i.skipped)
  const totalValue   = activeItems.reduce((sum, i) => sum + pricePerKg(i.materialType, i.clean ?? true) * (i.weight ?? 0), 0)
  const weeklyData   = weeklyBuckets(basket, 'weight')
  const weeklyKg     = weeklyData.reduce((s, d) => s + d.val, 0).toFixed(1)
  const { salute, name: displayName } = greeting(profile?.display_name)
  const ecoPoints    = profile?.eco_points ?? 0
  const tierName     = getTierName(ecoPoints)
  const tierPct      = getTierPct(ecoPoints)

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
            {/* Eyebrow — mono uppercase greeting period */}
            <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest block mb-1">
              {salute}, {displayName}
            </span>
            <h1 className="font-brand text-[28px] lg:text-[34px] text-[var(--ink)] m-0 leading-tight">
              Good haul this week — {weeklyKg} kg
            </h1>
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

      {/* ── 2-col stats grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 border-b-[1.5px] border-[var(--ink)]">
        {/* Earnings card */}
        <div className="flex flex-col gap-2 px-6 lg:px-10 py-5 sm:border-r-[1.5px] border-[var(--ink)]">
          <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">
            Earnings
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-brand text-[32px] text-[var(--ink)] leading-none">฿{totalValue.toFixed(0)}</span>
            <span className="font-data text-[11px] text-[var(--ink-3)]">thb</span>
          </div>
          {totalValue > 0 && (
            <span className="font-data text-[11px] text-[var(--green-ink)]">▲ ฿{totalValue.toFixed(0)} this week</span>
          )}
        </div>

        {/* Impact pts card */}
        <div className="flex flex-col gap-2 px-6 lg:px-10 py-5 border-t-[1.5px] sm:border-t-0 border-[var(--ink)]">
          <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">
            Impact pts
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-brand text-[28px] text-[var(--green-ink)] leading-none">{ecoPoints.toLocaleString()} pts</span>
          </div>
          {/* Tier progress bar */}
          <div className="w-full h-2 bg-[var(--paper-2)] border-[1.5px] border-[var(--ink)]">
            <div style={{ width: `${tierPct}%` }} className="h-full bg-[var(--green)] transition-all" />
          </div>
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{tierName} tier</span>
        </div>
      </div>

      {/* ── Buyer alert banner ─────────────────────────────────── */}
      {shops?.length > 0 && (
        <div className="border-b-[1.5px] border-[var(--green)] bg-[var(--green-soft)] px-6 lg:px-10 py-3 flex items-center gap-3 justify-between">
          <div className="flex items-start gap-3">
            <span className="font-data text-[13px] text-[var(--green-ink)] shrink-0 leading-none mt-0.5">!</span>
            <div>
              <span className="font-data text-[10px] text-[var(--green-ink)] uppercase tracking-widest block">
                {shops.length} buyers near you
              </span>
              <span className="font-body text-[15px] text-[var(--ink)]">
                Best deal · {shops[0]?.name} · 1.2 km
              </span>
            </div>
          </div>
          <span className="font-data text-[12px] text-[var(--green-ink)] shrink-0">→</span>
        </div>
      )}

      {/* ── Main body (2-col on desktop) ───────────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1">

        {/* Left column */}
        <div className="flex flex-col flex-1 min-w-0 lg:border-r-[1.5px] lg:border-[var(--ink)]">

          {/* Weekly chart */}
          <div className="px-6 lg:px-10 py-6 border-b-[1.5px] border-[var(--ink)]">
            <div className="flex items-center justify-between mb-3">
              <SectionDivider label="Weekly impact [7d]" />
              <span className="font-data text-[10px] text-[var(--ink-4)]">refreshed {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
            {/* Section header row with "view all →" */}
            <div className="flex items-center justify-between mb-2">
              <SectionDivider label="Recent scans" />
              <button
                onClick={() => navigate('/basket')}
                className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest bg-transparent border-none cursor-pointer hover:text-[var(--ink)] transition-colors shrink-0 ml-3"
              >
                view all →
              </button>
            </div>

            {recentItems.length > 0 ? (
              <div className="flex flex-col">
                {recentItems.slice(0, 3).map((item, idx) => {
                  const value = pricePerKg(item.materialType, item.clean ?? true) * (item.weight ?? 0)
                  const timeLabels = ['2m ago', '1h ago', 'Yest.', '2d ago', '3d ago']
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b-[1px] border-[var(--ink-4)]"
                    >
                      <span className="font-body text-[15px] text-[var(--ink)] truncate flex-1 min-w-0">
                        {localName(item.materialType, language)} · {(item.weight ?? 0).toFixed(1)}kg
                      </span>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <GradeTag clean={item.clean} />
                        <span className="font-data text-[13px] text-[var(--ink)]">฿{value.toFixed(0)}</span>
                        <span className="font-data text-[11px] text-[var(--ink-3)]">{timeLabels[idx] ?? 'Recent'}</span>
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
              <div className="flex items-center justify-between py-2 border-b-[1px] border-[var(--ink-4)]">
                <span className="font-body text-[15px] text-[var(--ink)] flex-1 min-w-0 truncate">
                  {localName(lastScan.materialType, language)}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <GradeTag clean={lastScan.stage2Pass} />
                  <span className="font-data text-[11px] text-[var(--ink-3)]">Just now</span>
                </div>
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
              {loading && (
                <div className="flex flex-col gap-2 w-full">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 border-[1.5px] border-[var(--ink-4)] animate-pulse bg-[var(--paper-2)]" />
                  ))}
                </div>
              )}
              {!loading && nearbyShops.length > 0 && nearbyShops.map(shop => {
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
