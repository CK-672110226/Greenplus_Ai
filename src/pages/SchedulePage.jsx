import { useEffect } from 'react'
import { toast } from 'sonner'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { useDispatch, useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { localName } from '../data/wasteItems'
import { setSlots } from '../store/scheduleSlice'
import { useSupabaseBookings } from '../hooks/useSupabaseBookings'
import { supabase } from '../lib/supabase'
import { todayBangkok } from '../utils/time'

const TODAY = todayBangkok()

function slotTime(scheduledAt) {
  if (!scheduledAt) return '--:--'
  return new Date(scheduledAt).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false })
}

function slotHour(time) {
  return parseInt(time.split(':')[0], 10)
}

function statusBadge(status) {
  const map = {
    pending:   { color: 'var(--orange)', label: 'Pending' },
    accepted:  { color: 'var(--green)',  label: 'Confirmed' },
    completed: { color: 'var(--ink-3)',  label: 'Completed' },
    rejected:  { color: '#E53E3E',       label: 'Cancelled' },
  }
  const entry = map[status] ?? { color: 'var(--ink-3)', label: status }
  return (
    <span className="font-data text-[11px] uppercase tracking-widest" style={{ color: entry.color }}>
      {entry.label}
    </span>
  )
}

function SlotCard({ slot, language, t, onConfirm, onCancel, onComplete }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <span className="font-brand text-[26px] text-[var(--ink)] leading-none">{slot.time}</span>
          <span className="font-body text-[14px] text-[var(--ink)]">{slot.seller}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          {statusBadge(slot.status)}
          <span className="font-data text-[12px] text-[var(--ink-3)]">
            {(slot.materials ?? []).map(m => localName(m, language)).join(', ')} · {slot.totalKg}kg
          </span>
          <span className="font-body text-[13px] text-[var(--ink)]">฿{(slot.estValue ?? 0).toLocaleString()}</span>
        </div>
      </div>

      {slot.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <Button variant="primary"   onClick={() => onConfirm(slot.id)}>{t.confirmPickup}</Button>
          <Button variant="secondary" onClick={() => onCancel(slot.id)}>{t.cancelPickup}</Button>
        </div>
      )}
      {slot.status === 'accepted' && (
        <div className="flex gap-2 pt-1">
          <Button variant="primary"   onClick={() => onComplete(slot.id)}>{t.completePickup}</Button>
          <Button variant="secondary" onClick={() => onCancel(slot.id)}>{t.cancelPickup}</Button>
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

  const { bookings, loading } = useSupabaseBookings()

  useEffect(() => {
    const todaySlots = bookings
      .filter(b => b.scheduledAt && b.scheduledAt.startsWith(TODAY))
      .map(b => ({
        id:        b.id,
        time:      slotTime(b.scheduledAt),
        seller:    b.seller,
        materials: b.materials,
        totalKg:   b.totalKg,
        estValue:  b.estValue,
        status:    b.status,
      }))
    dispatch(setSlots(todaySlots))
  }, [bookings, dispatch])

  async function handleConfirm(id) {
    try { await supabase.from('bookings').update({ status: 'accepted' }).eq('id', id) } catch { /* silent */ }
    dispatch(setSlots(slots.map(s => s.id === id ? { ...s, status: 'accepted' } : s)))
    toast.success(t.confirmPickup)
  }
  async function handleCancel(id) {
    try { await supabase.from('bookings').update({ status: 'rejected' }).eq('id', id) } catch { /* silent */ }
    dispatch(setSlots(slots.map(s => s.id === id ? { ...s, status: 'rejected' } : s)))
    toast.error(t.cancelPickup)
  }
  async function handleComplete(id) {
    try { await supabase.from('bookings').update({ status: 'completed' }).eq('id', id) } catch { /* silent */ }
    dispatch(setSlots(slots.map(s => s.id === id ? { ...s, status: 'completed' } : s)))
    toast.success(t.completePickup)
  }

  const confirmed = slots.filter(s => s.status === 'accepted').length
  const pending   = slots.filter(s => s.status === 'pending').length
  const completed = slots.filter(s => s.status === 'completed').length

  const morning   = slots.filter(s => slotHour(s.time) < 12)
  const afternoon = slots.filter(s => slotHour(s.time) >= 12 && slotHour(s.time) < 17)
  const evening   = slots.filter(s => slotHour(s.time) >= 17)
  const groups    = [
    { label: t.scheduleMorning,   items: morning },
    { label: t.scheduleAfternoon, items: afternoon },
    { label: t.scheduleEvening,   items: evening },
  ].filter(g => g.items.length > 0)

  return (
    <main className="px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.scheduleTitle}</h1>
        <span className="font-data text-[12px] text-[var(--ink-3)]">{TODAY}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="flex flex-col gap-1 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">{t.confirmPickup}</span>
          <span className="font-brand text-[28px]" style={{ color: 'var(--green)' }}>{confirmed}</span>
        </Card>
        <Card className="flex flex-col gap-1 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">Pending</span>
          <span className="font-brand text-[28px]" style={{ color: 'var(--orange)' }}>{pending}</span>
        </Card>
        <Card className="flex flex-col gap-1 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">{t.completePickup}</span>
          <span className="font-brand text-[28px]" style={{ color: 'var(--ink-3)' }}>{completed}</span>
        </Card>
      </div>

      {loading && (
        <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest animate-pulse self-center">
          Loading...
        </span>
      )}

      {!loading && slots.length === 0 && (
        <p className="font-body text-[14px] text-[var(--ink-3)]">{t.noSchedule}</p>
      )}

      {groups.map(group => (
        <div key={group.label} className="flex flex-col gap-3">
          <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">{group.label}</span>
          {group.items.map(slot => (
            <SlotCard
              key={slot.id}
              slot={slot}
              language={language}
              t={t}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onComplete={handleComplete}
            />
          ))}
        </div>
      ))}
    </main>
  )
}
