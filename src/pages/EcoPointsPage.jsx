import { useSelector } from 'react-redux'
import { useScanHistory } from '../hooks/useScanHistory'

const TIERS = [
  { name: 'Bronze',   min: 0,    max: 999,  multiplier: '×1.0' },
  { name: 'Silver',   min: 1000, max: 1999, multiplier: '×1.05' },
  { name: 'Gold',     min: 2000, max: 2999, multiplier: '×1.1' },
  { name: 'Platinum', min: 3000, max: Infinity, multiplier: '×1.15' },
]

function getTier(pts) {
  return TIERS.findLast(t => pts >= t.min) ?? TIERS[0]
}

function getProgress(pts) {
  const tier = getTier(pts)
  if (tier.max === Infinity) return 100
  return Math.round(((pts - tier.min) / (tier.max - tier.min + 1)) * 100)
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-[1px] bg-[var(--ink-4)]" />
      <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">{label}</span>
      <div className="flex-1 h-[1px] bg-[var(--ink-4)]" />
    </div>
  )
}

export function EcoPointsPage() {
  const profile  = useSelector(s => s.user.profile)
  const { scans, loading } = useScanHistory()

  const pts      = profile?.eco_points ?? 0
  const tier     = getTier(pts)
  const progress = getProgress(pts)
  const nextTier = TIERS[TIERS.indexOf(tier) + 1]

  const recentHistory = scans.slice(0, 10).map(s => ({
    id:       s.id,
    label:    s.material_type ?? 'Unknown material',
    pts:      Math.max(1, Math.round((s.weight_kg ?? 0.5) * 10)),
    date:     s.created_at ? new Date(s.created_at) : null,
  }))

  return (
    <main className="flex flex-col items-center gap-0">

      {/* Page header */}
      <div className="w-full px-4 pt-4 pb-2 border-b-[1.5px] border-[var(--ink-4)]">
        <div className="flex items-center gap-1.5 font-data text-[10px] uppercase tracking-widest text-[var(--ink-3)] mb-1">
          ♻ Impact Points
        </div>
        <h1 className="font-brand text-[28px] leading-tight m-0 text-[var(--green-ink)]">
          {pts.toLocaleString()} pts · {tier.name}
        </h1>
      </div>

      <div className="w-full max-w-2xl px-4 py-6 flex flex-col gap-6">

        {/* Tier progress card */}
        <div className="flex flex-col gap-3 border-[1.5px] border-[var(--ink)] p-4 bg-[var(--paper-2)] shadow-[2px_2px_0_var(--ink)]">
          <div className="flex items-center justify-between">
            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
              Current tier
            </span>
            <span className="font-data text-[11px] text-[var(--green-ink)] uppercase tracking-widest">
              {tier.multiplier} price bonus
            </span>
          </div>

          <div className="font-brand text-[36px] text-[var(--ink)] leading-none">{tier.name}</div>

          {nextTier ? (
            <>
              <div className="h-3 bg-[var(--paper)] border-[1.5px] border-[var(--ink)] overflow-hidden">
                <div
                  className="h-full bg-[var(--green)] transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-data text-[10px] text-[var(--ink-3)]">
                  {pts.toLocaleString()} pts
                </span>
                <span className="font-data text-[10px] text-[var(--ink-3)]">
                  {nextTier.min.toLocaleString()} pts → {nextTier.name}
                </span>
              </div>
              <span className="font-data text-[11px] text-[var(--ink-2)]">
                {(nextTier.min - pts).toLocaleString()} pts to {nextTier.name}
              </span>
            </>
          ) : (
            <span className="font-data text-[11px] text-[var(--green-ink)]">
              Max tier reached — {tier.multiplier} on all materials
            </span>
          )}
        </div>

        {/* Tier table */}
        <div className="flex flex-col border-[1.5px] border-[var(--ink)]">
          <div className="grid grid-cols-3 px-4 py-2 border-b-[1.5px] border-[var(--ink)] bg-[var(--paper-2)]">
            <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">Tier</span>
            <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">Range</span>
            <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em] text-right">Bonus</span>
          </div>
          {TIERS.map(t2 => (
            <div
              key={t2.name}
              className={`grid grid-cols-3 px-4 py-3 border-b-[1px] border-[var(--ink-4)] last:border-b-0 ${t2.name === tier.name ? 'bg-[var(--green-soft)]' : ''}`}
            >
              <span className={`font-body text-[14px] ${t2.name === tier.name ? 'text-[var(--green-ink)]' : 'text-[var(--ink)]'}`}>
                {t2.name === tier.name ? '● ' : '  '}{t2.name}
              </span>
              <span className="font-data text-[12px] text-[var(--ink-3)]">
                {t2.min.toLocaleString()}
                {t2.max !== Infinity ? `–${t2.max.toLocaleString()}` : '+'}
              </span>
              <span className="font-data text-[12px] text-[var(--ink)] text-right">{t2.multiplier}</span>
            </div>
          ))}
        </div>

        {/* How points work */}
        <div className="flex flex-col gap-2 border-[1.5px] border-[var(--ink-4)] p-4 bg-[var(--paper-2)]">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">How points work</span>
          <p className="font-body text-[14px] text-[var(--ink)] m-0 leading-relaxed">
            Every scan earns 10 pts per kg of recyclable material detected. Clean (Grade A) items earn a 10% bonus. Points unlock higher multipliers that boost your per-kg payout.
          </p>
        </div>

        <SectionDivider label="Recent history" />

        {/* Timeline */}
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-12 bg-[var(--paper-2)] border-[1.5px] border-[var(--ink-4)] animate-pulse" />
            ))}
          </div>
        ) : recentHistory.length === 0 ? (
          <p className="font-body text-[15px] text-[var(--ink-3)]">No scans yet — start scanning to earn points.</p>
        ) : (
          <div className="flex flex-col border-[1.5px] border-[var(--ink)]">
            {recentHistory.map((entry, idx) => (
              <div key={entry.id ?? idx} className="flex items-center justify-between px-4 py-3 border-b-[1px] border-[var(--ink-4)] last:border-b-0">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-body text-[14px] text-[var(--ink)] truncate capitalize">
                    {entry.label.replace(/_/g, ' ')}
                  </span>
                  {entry.date && (
                    <span className="font-data text-[10px] text-[var(--ink-4)]">
                      {entry.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <span className="font-data text-[14px] text-[var(--green-ink)] shrink-0 ml-3">
                  +{entry.pts} pts
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
