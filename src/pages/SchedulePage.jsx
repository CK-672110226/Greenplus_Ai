import { useEffect, useState } from 'react'
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

function IconClock() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

const TODAY = todayBangkok()

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDays() {
  const now    = new Date()
  const day    = now.getDay() // 0=Sun
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

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
    rejected:  { color: 'var(--orange)', label: 'Cancelled' },
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
          <span className="font-data text-[26px] text-[var(--ink)] leading-none">{slot.time}</span>
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

  const [viewMode, setViewMode]   = useState('week')
  const [slotPopup, setSlotPopup] = useState(null)

  const weekDays = getWeekDays()

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
        <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-[0.15em]">Schedule</span>
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

      {/* View toggle */}
      <div className="flex gap-0 border-[1.5px] border-[var(--ink)] w-fit">
        {['week', 'list'].map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={[
              'px-3 py-1.5 font-data text-[10px] uppercase tracking-widest cursor-pointer border-none',
              viewMode === mode
                ? 'bg-[var(--ink)] text-[var(--paper)]'
                : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]'
            ].join(' ')}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Week grid view */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 border-[1.5px] border-[var(--ink)] divide-x divide-[var(--ink-4)] min-h-[320px]">
          {weekDays.map((day, idx) => {
            const isToday = day.toDateString() === new Date().toDateString()
            const daySlots = (slots ?? []).filter(s => {
              const d = new Date(s.start_at)
              return d.toDateString() === day.toDateString()
            })
            const dayBookings = (bookings ?? []).filter(b => {
              const d = new Date(b.pickup_date ?? b.scheduledAt ?? b.created_at)
              return d.toDateString() === day.toDateString()
            })
            return (
              <div
                key={idx}
                className={[
                  'flex flex-col gap-1 p-1.5 cursor-pointer hover:bg-[var(--paper-2)] transition-colors',
                  isToday ? 'bg-[var(--green-soft)]' : '',
                ].join(' ')}
                onClick={() => setSlotPopup({ open: true, date: day })}
              >
                {/* Day header */}
                <div className="text-center">
                  <span className={[
                    'font-data text-[9px] uppercase tracking-widest block',
                    isToday ? 'text-[var(--green-ink)]' : 'text-[var(--ink-3)]',
                  ].join(' ')}>
                    {DAY_LABELS[idx]}
                  </span>
                  <span className={[
                    'font-data text-[13px] leading-none',
                    isToday ? 'text-[var(--green-ink)] font-bold' : 'text-[var(--ink)]',
                  ].join(' ')}>
                    {day.getDate()}
                  </span>
                </div>
                {/* Slots from scheduleSlice */}
                {daySlots.map(s => (
                  <div
                    key={s.id}
                    className="border-[1px] border-[var(--green)] bg-[var(--green-soft)] px-1 py-0.5 rounded-none"
                    onClick={e => e.stopPropagation()}
                  >
                    <span className="font-data text-[9px] text-[var(--green-ink)] uppercase block truncate">
                      {s.time ?? new Date(s.start_at).toLocaleTimeString('th', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                {/* Bookings for this day */}
                {dayBookings.map(b => (
                  <div
                    key={b.id}
                    className="border-[1px] border-[var(--ink-4)] bg-[var(--paper-2)] px-1 py-0.5"
                    onClick={e => e.stopPropagation()}
                  >
                    <span className="font-data text-[9px] text-[var(--ink-3)] uppercase block truncate">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <>
          {loading && (
            <div className="flex flex-col gap-3">
              <div className="h-24 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
              <div className="h-24 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
            </div>
          )}

          {!loading && slots.length === 0 && (
            <p className="font-body text-[14px] text-[var(--ink-3)]">{t.noSchedule}</p>
          )}

          {groups.map(group => (
            <div key={group.label} className="flex flex-col gap-3">
              <span className="flex items-center gap-1.5 font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">
                <IconClock />
                {group.label}
              </span>
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
        </>
      )}

      {slotPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[var(--paper)] border-[1.5px] border-[var(--ink)] p-6 flex flex-col gap-4 min-w-[280px]">
            <span className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)]">New slot</span>
            <span className="font-brand text-[20px] text-[var(--ink)]">
              {slotPopup.date?.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <Button variant="secondary" onClick={() => setSlotPopup(null)}>Close</Button>
          </div>
        </div>
      )}
    </main>
  )
}
