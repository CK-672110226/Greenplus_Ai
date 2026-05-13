import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

const TIERS = [
  { name: 'Bronze',   min: 0,    max: 999,      mult: 1.00, color: '#CD7F32' },
  { name: 'Silver',   min: 1000, max: 1999,     mult: 1.05, color: '#A0A0A0' },
  { name: 'Gold',     min: 2000, max: 2999,     mult: 1.10, color: '#D4AF37' },
  { name: 'Platinum', min: 3000, max: Infinity, mult: 1.15, color: '#9BA5B7' },
]

const MOCK_HISTORY = [
  { id: 1, description: 'Scanned aluminum can',    points: +5,  date: '13 May, 09:41' },
  { id: 2, description: 'Completed order #1023',   points: +10, date: '12 May, 16:22' },
  { id: 3, description: 'Scanned PET bottle',      points: +2,  date: '12 May, 10:05' },
  { id: 4, description: 'A-grade scan bonus',       points: +5,  date: '11 May, 14:33' },
  { id: 5, description: 'Scanned cardboard',        points: +2,  date: '11 May, 08:17' },
]

const REWARDS = [
  { id: 1, title: '5% Discount Coupon', cost: 50,  desc: 'Valid at partner junk shops in CM' },
  { id: 2, title: 'Free Pick-up 1×',   cost: 100, desc: 'Schedule a free pick-up booking'   },
  { id: 3, title: 'Gold Tier Badge',   cost: 500, desc: 'Exclusive profile badge for top recyclers' },
]

function currentTier(points) {
  return [...TIERS].reverse().find(item => points >= item.min) ?? TIERS[0]
}

function nextTier(points) {
  return TIERS.find(item => points < item.max && item.max !== Infinity) ?? null
}

export function EcoPointsPage() {
  const t      = useT()
  const points = useSelector(s => s.user.profile?.eco_points ?? 0)
  const tier   = currentTier(points)
  const next   = nextTier(points)
  const progress = next
    ? Math.min(100, ((points - tier.min) / (next.min - tier.min)) * 100)
    : 100

  return (
    <main className="flex flex-col px-4 py-6 gap-6">
      {/* Header */}
      <div>
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.ecoPointsTitle ?? t.ecoPoints}</h1>
        <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">loyalty & rewards</span>
      </div>

      {/* Points + progress */}
      <div className="flex flex-col gap-3 p-4 border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] bg-[var(--paper)]">
        <div className="flex items-center justify-between">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.yourPoints}</span>
          <span
            className="font-data text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 border-[1.5px] border-[var(--ink)]"
            style={{ color: tier.color }}
          >
            {tier.name}
          </span>
        </div>
        <span className="font-brand text-[48px] text-[var(--green)] leading-none">{points}</span>
        <div className="flex flex-col gap-1">
          <div className="w-full h-2 bg-[var(--paper-2)] border-[1.5px] border-[var(--ink)]">
            <div style={{ width: `${progress}%`, background: tier.color, height: '100%', transition: 'width 0.4s' }} />
          </div>
          {next ? (
            <span className="font-data text-[10px] text-[var(--ink-3)]">{next.min - points} pts to {next.name}</span>
          ) : (
            <span className="font-data text-[10px] text-[var(--green)]">Max tier reached ✓</span>
          )}
        </div>
      </div>

      {/* Tier table */}
      <div className="flex flex-col border-[1.5px] border-[var(--ink)]">
        <div className="grid grid-cols-3 px-3 py-1.5 bg-[var(--paper-2)] border-b-[1.5px] border-[var(--ink)]">
          <span className="font-data text-[9px] text-[var(--ink-3)] uppercase tracking-widest">Tier</span>
          <span className="font-data text-[9px] text-[var(--ink-3)] uppercase tracking-widest text-center">Range</span>
          <span className="font-data text-[9px] text-[var(--ink-3)] uppercase tracking-widest text-right">Multiplier</span>
        </div>
        {TIERS.map((row, i) => {
          const active = tier.name === row.name
          return (
            <div
              key={row.name}
              className={[
                'grid grid-cols-3 items-center px-3 py-2.5',
                i < TIERS.length - 1 ? 'border-b-[1px] border-[var(--ink-4)]' : '',
                active ? 'bg-[var(--green-soft)]' : '',
              ].join(' ')}
            >
              <div className="flex items-center gap-2">
                {active
                  ? <span className="w-2 h-2 rounded-full bg-[var(--green)] flex-shrink-0" />
                  : <span className="w-2 h-2 flex-shrink-0" />
                }
                <span className="font-data text-[12px]" style={{ color: row.color, fontWeight: active ? 700 : 400 }}>
                  {row.name}
                </span>
              </div>
              <span className="font-data text-[11px] text-[var(--ink-3)] text-center">
                {row.max === Infinity
                  ? `${row.min.toLocaleString()}+`
                  : `${row.min.toLocaleString()}–${row.max.toLocaleString()}`}
              </span>
              <span className="font-data text-[12px] text-[var(--ink)] text-right font-bold">
                ×{row.mult.toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Rewards */}
      <div className="flex flex-col gap-3">
        <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.redeemPoints}</span>
        {REWARDS.map(r => (
          <Card key={r.id} className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-body text-[15px] text-[var(--ink)] font-semibold">{r.title}</span>
              <span className="font-body text-[12px] text-[var(--ink-3)]">{r.desc}</span>
              <span className="font-data text-[12px] text-[var(--green)]">{r.cost} pts</span>
            </div>
            <Button
              variant={points >= r.cost ? 'primary' : 'secondary'}
              onClick={() => toast.info('Feature coming in M10')}
            >
              {t.redeemPoints}
            </Button>
          </Card>
        ))}
      </div>

      {/* Timeline history */}
      <div className="flex flex-col gap-3">
        <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.pointsHistory}</span>
        <div className="flex flex-col">
          {MOCK_HISTORY.map((h, i) => (
            <div
              key={h.id}
              className={`flex items-start justify-between px-1 py-3 ${i < MOCK_HISTORY.length - 1 ? 'border-b-[1px] border-[var(--ink-4)]' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center pt-1">
                  <span className="w-2 h-2 rounded-full border-[1.5px] border-[var(--green)] bg-[var(--green-soft)]" />
                  {i < MOCK_HISTORY.length - 1 && <span className="w-px h-6 bg-[var(--ink-4)] mt-1" />}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-body text-[14px] text-[var(--ink)]">{h.description}</span>
                  <span className="font-data text-[10px] text-[var(--ink-3)]">{h.date}</span>
                </div>
              </div>
              <span className={`font-data text-[13px] font-bold flex-shrink-0 ml-3 ${h.points > 0 ? 'text-[var(--green)]' : 'text-[var(--orange)]'}`}>
                {h.points > 0 ? '+' : ''}{h.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
