import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

const TIERS = [
  { name: 'Bronze', min: 0,   max: 99,  color: '#CD7F32' },
  { name: 'Silver', min: 100, max: 499, color: '#A0A0A0' },
  { name: 'Gold',   min: 500, max: Infinity, color: '#D4AF37' },
]

const MOCK_HISTORY = [
  { id: 1, description: 'Scanned aluminum_can',    points: +5,  date: '13 May 2026' },
  { id: 2, description: 'Completed order #1023',   points: +10, date: '12 May 2026' },
  { id: 3, description: 'Scanned pet_bottle_clear',points: +2,  date: '12 May 2026' },
  { id: 4, description: 'A-grade scan bonus',       points: +5,  date: '11 May 2026' },
  { id: 5, description: 'Scanned cardboard',        points: +2,  date: '11 May 2026' },
]

const REWARDS = [
  { id: 1, title: '5% Discount Coupon',    cost: 50,  desc: 'Valid at partner junk shops in CM' },
  { id: 2, title: 'Free Pick-up 1x',       cost: 100, desc: 'Schedule a free pick-up booking'   },
  { id: 3, title: 'Gold Tier Badge',       cost: 500, desc: 'Exclusive profile badge for top recyclers' },
]

function currentTier(points) {
  return TIERS.findLast(t => points >= t.min) ?? TIERS[0]
}

function nextTier(points) {
  return TIERS.find(t => points < t.max && t.max !== Infinity) ?? null
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
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.ecoPointsTitle ?? t.ecoPoints}</h1>

      {/* Points summary */}
      <Card className="w-full max-w-sm flex flex-col gap-4">
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

        {/* Progress bar to next tier */}
        <div className="flex flex-col gap-1">
          <div className="w-full h-2 bg-[var(--paper)] border-[1.5px] border-[var(--ink)]">
            <div style={{ width: `${progress}%`, background: tier.color, height: '100%', transition: 'width 0.4s' }} />
          </div>
          {next ? (
            <span className="font-data text-[10px] text-[var(--ink-3)]">
              {next.min - points} pts to {next.name}
            </span>
          ) : (
            <span className="font-data text-[10px] text-[var(--green)]">Max tier reached</span>
          )}
        </div>

        <p className="font-body text-[13px] text-[var(--ink-3)] m-0">{t.pointsExplain}</p>

        <div className="flex flex-col gap-1 pt-1 border-t-[1.5px] border-[var(--ink-4)]">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">How to Earn</span>
          {[
            'Scan any item: +2 pts',
            'Scan A-grade item: +5 pts',
            'Complete order: +10 pts',
          ].map(s => (
            <span key={s} className="font-body text-[13px] text-[var(--ink)]">• {s}</span>
          ))}
        </div>
      </Card>

      {/* Rewards */}
      <div className="w-full max-w-sm flex flex-col gap-3">
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

      {/* Points history */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.pointsHistory}</span>
        <Card className="flex flex-col gap-2">
          {MOCK_HISTORY.map(h => (
            <div key={h.id} className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-body text-[13px] text-[var(--ink)]">{h.description}</span>
                <span className="font-data text-[10px] text-[var(--ink-3)]">{h.date}</span>
              </div>
              <span className={`font-data text-[13px] font-bold ${h.points > 0 ? 'text-[var(--green)]' : 'text-[var(--orange)]'}`}>
                {h.points > 0 ? '+' : ''}{h.points}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </main>
  )
}
