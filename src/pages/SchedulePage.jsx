import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { localName } from '../data/wasteItems'
import { confirmSlot, cancelSlot, completeSlot } from '../store/scheduleSlice'

function statusBadge(status) {
  const map = {
    pending:   { color: 'var(--orange)',  label: 'Pending' },
    confirmed: { color: 'var(--green)',   label: 'Confirmed' },
    completed: { color: 'var(--ink-3)',   label: 'Completed' },
    cancelled: { color: 'var(--ink-4)',   label: 'Cancelled' },
  }
  const entry = map[status] ?? { color: 'var(--ink-3)', label: status }
  return (
    <span
      className="font-data text-[11px] uppercase tracking-widest"
      style={{
        color: entry.color,
        textDecoration: status === 'cancelled' ? 'line-through' : 'none',
      }}
    >
      {entry.label}
    </span>
  )
}

function slotHour(time) {
  return parseInt(time.split(':')[0], 10)
}

function SlotCard({ slot, language, t, dispatch }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <span className="font-brand text-[26px] text-[var(--ink)] leading-none">{slot.time}</span>
          <span className="font-body text-[14px] text-[var(--ink)]">{slot.seller}</span>
          <span className="font-body text-[12px] text-[var(--ink-3)]">{t.sellerAddress}: {slot.address}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          {statusBadge(slot.status)}
          <span className="font-data text-[12px] text-[var(--ink-3)]">
            {slot.materials.map(m => localName(m, language)).join(', ')} · {slot.totalKg}kg
          </span>
          <span className="font-body text-[13px] text-[var(--ink)]">
            {t.estValueLabel}: ฿{slot.estValue.toLocaleString()}
          </span>
        </div>
      </div>

      {slot.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <Button
            variant="primary"
            onClick={() => {
              dispatch(confirmSlot(slot.id))
              toast.success(t.confirmPickup)
            }}
          >
            {t.confirmPickup}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              dispatch(cancelSlot(slot.id))
              toast.error(t.cancelPickup)
            }}
          >
            {t.cancelPickup}
          </Button>
        </div>
      )}

      {slot.status === 'confirmed' && (
        <div className="flex gap-2 pt-1">
          <Button
            variant="primary"
            onClick={() => {
              dispatch(completeSlot(slot.id))
              toast.success(t.completePickup)
            }}
          >
            {t.completePickup}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              dispatch(cancelSlot(slot.id))
              toast.error(t.cancelPickup)
            }}
          >
            {t.cancelPickup}
          </Button>
        </div>
      )}
    </Card>
  )
}

export function SchedulePage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)
  const slots    = useSelector(s => s.schedule.slots)

  const confirmed = slots.filter(s => s.status === 'confirmed').length
  const pending   = slots.filter(s => s.status === 'pending').length
  const completed = slots.filter(s => s.status === 'completed').length

  const morning   = slots.filter(s => slotHour(s.time) < 12)
  const afternoon = slots.filter(s => slotHour(s.time) >= 12 && slotHour(s.time) < 17)
  const evening   = slots.filter(s => slotHour(s.time) >= 17)

  const groups = [
    { label: t.scheduleMorning,   items: morning },
    { label: t.scheduleAfternoon, items: afternoon },
    { label: t.scheduleEvening,   items: evening },
  ].filter(g => g.items.length > 0)

  return (
    <main className="px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.scheduleTitle}</h1>
        <span className="font-data text-[12px] text-[var(--ink-3)]">14 May 2026</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="flex flex-col gap-1 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">
            {t.confirmPickup}
          </span>
          <span className="font-brand text-[28px]" style={{ color: 'var(--green)' }}>{confirmed}</span>
        </Card>
        <Card className="flex flex-col gap-1 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">
            Pending
          </span>
          <span className="font-brand text-[28px]" style={{ color: 'var(--orange)' }}>{pending}</span>
        </Card>
        <Card className="flex flex-col gap-1 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">
            {t.completePickup}
          </span>
          <span className="font-brand text-[28px]" style={{ color: 'var(--ink-3)' }}>{completed}</span>
        </Card>
      </div>

      {slots.length === 0 && (
        <p className="font-body text-[14px] text-[var(--ink-3)]">{t.noSchedule}</p>
      )}

      {groups.map(group => (
        <div key={group.label} className="flex flex-col gap-3">
          <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">
            {group.label}
          </span>
          {group.items.map(slot => (
            <SlotCard
              key={slot.id}
              slot={slot}
              language={language}
              t={t}
              dispatch={dispatch}
            />
          ))}
        </div>
      ))}
    </main>
  )
}
