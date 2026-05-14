import { useEffect } from 'react'
import { toast } from 'sonner'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { useDispatch, useSelector } from 'react-redux'
import { localName } from '../data/wasteItems'
import { setSlots } from '../store/scheduleSlice'
import { useSupabaseBookings } from '../hooks/useSupabaseBookings'
import { supabase } from '../lib/supabase'

const TODAY = '2026-05-14'

function slotTime(scheduledAt) {
  if (!scheduledAt) return '--:--'
  const d = new Date(scheduledAt)
  return d.toTimeString().slice(0, 5)
}

export function SchedulePage() {
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
        phone:     '',
        address:   '',
      }))
    dispatch(setSlots(todaySlots))
  }, [bookings, dispatch])

  async function confirmSlot(id) {
    try {
      await supabase.from('bookings').update({ status: 'accepted' }).eq('id', id)
    } catch {
      // fail silently
    }
    dispatch(setSlots(slots.map(s => s.id === id ? { ...s, status: 'accepted' } : s)))
    toast.success('Slot confirmed')
  }

  async function cancelSlot(id) {
    try {
      await supabase.from('bookings').update({ status: 'rejected' }).eq('id', id)
    } catch {
      // fail silently
    }
    dispatch(setSlots(slots.map(s => s.id === id ? { ...s, status: 'rejected' } : s)))
    toast.error('Slot cancelled')
  }

  async function completeSlot(id) {
    try {
      await supabase.from('bookings').update({ status: 'completed' }).eq('id', id)
    } catch {
      // fail silently
    }
    dispatch(setSlots(slots.map(s => s.id === id ? { ...s, status: 'completed' } : s)))
    toast.success('Slot completed')
  }

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">Schedule</h1>
      <p className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest m-0">{TODAY}</p>

      {loading && (
        <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest animate-pulse">
          Loading...
        </span>
      )}

      {!loading && slots.length === 0 && (
        <Card className="w-full max-w-xl flex items-center justify-center py-8">
          <p className="font-body text-[15px] text-[var(--ink-3)] m-0">No slots scheduled for today.</p>
        </Card>
      )}

      <div className="w-full max-w-xl flex flex-col gap-3">
        {slots.map(slot => (
          <Card key={slot.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-data text-[16px] text-[var(--ink)] font-bold">{slot.time}</span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-body text-[15px] text-[var(--ink)]">{slot.seller}</span>
                  <span className="font-data text-[11px] text-[var(--ink-3)]">
                    {(slot.materials ?? []).map(m => localName(m, language)).join(', ')} · {slot.totalKg}kg · ฿{slot.estValue}
                  </span>
                </div>
              </div>
              <span
                className="font-data text-[11px] uppercase tracking-widest"
                style={
                  slot.status === 'pending'   ? { color: 'var(--orange)' } :
                  slot.status === 'accepted'  ? { color: 'var(--green)' } :
                  slot.status === 'completed' ? { color: 'var(--green-ink)' } :
                  { color: '#E53E3E' }
                }
              >
                {slot.status}
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              {slot.status === 'pending' && (
                <>
                  <Button variant="primary" onClick={() => confirmSlot(slot.id)}>Confirm</Button>
                  <Button variant="secondary" onClick={() => cancelSlot(slot.id)}>Cancel</Button>
                </>
              )}
              {slot.status === 'accepted' && (
                <Button variant="primary" onClick={() => completeSlot(slot.id)}>Mark Complete</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
