import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { Button } from './Button'

function formatDisplayDate(isoDate, hour) {
  if (!isoDate) return ''
  const d = new Date(isoDate + 'T00:00:00')
  const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' })
  const dayNum = d.getDate()
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const timeStr = `${String(hour).padStart(2, '0')}:00`
  return `${dayLabel} ${dayNum} ${month} · ${timeStr}`
}

export function SlotCreatePopup({ date, hour, onClose, onCreated, shopId }) {
  const [note, setNote] = useState('')
  const [duration, setDuration] = useState(1)
  const [capacity, setCapacity] = useState(50)
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!shopId) {
      toast.error('Shop ID is required')
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        shop_id: shopId,
        scheduled_date: date,
        start_hour: hour,
        duration_hours: duration,
        cap_kg: capacity,
        status: 'pending',
        note: note.trim() || null,
      })
      .select()
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    onCreated(data[0])
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.40)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mx-4 flex flex-col gap-4"
        style={{
          background: 'var(--paper)',
          border: '1.5px solid var(--ink)',
          boxShadow: '2px 2px 0 var(--ink)',
          padding: '24px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ borderBottom: '1.5px solid var(--ink-4)', paddingBottom: '12px' }}>
          <h2
            className="font-brand"
            style={{ fontSize: '18px', color: 'var(--ink)', margin: 0, lineHeight: 1.2 }}
          >
            Create Slot
          </h2>
          <span
            className="font-data"
            style={{ fontSize: '12px', color: 'var(--green-ink)', marginTop: '4px', display: 'block' }}
          >
            {formatDisplayDate(date, hour)}
          </span>
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-1">
          <span
            className="font-data"
            style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)' }}
          >
            Duration
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(h => (
              <button
                key={h}
                onClick={() => setDuration(h)}
                className="font-data"
                style={{
                  flex: 1,
                  padding: '6px 0',
                  fontSize: '13px',
                  border: '1.5px solid var(--ink)',
                  cursor: 'pointer',
                  transition: 'all 75ms',
                  background: duration === h ? 'var(--ink)' : 'var(--paper)',
                  color: duration === h ? 'var(--paper)' : 'var(--ink)',
                  boxShadow: duration === h ? 'none' : '2px 2px 0 var(--ink)',
                }}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* Capacity */}
        <div className="flex flex-col gap-1">
          <span
            className="font-data"
            style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)' }}
          >
            Capacity (kg)
          </span>
          <input
            type="number"
            min={1}
            max={500}
            value={capacity}
            onChange={e => setCapacity(Math.min(500, Math.max(1, Number(e.target.value))))}
            className="font-data"
            style={{
              border: '1.5px solid var(--ink)',
              padding: '7px 10px',
              fontSize: '14px',
              background: 'var(--paper)',
              color: 'var(--ink)',
              outline: 'none',
              width: '100%',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--green)')}
            onBlur={e => (e.target.style.borderColor = 'var(--ink)')}
          />
        </div>

        {/* Note */}
        <div className="flex flex-col gap-1">
          <span
            className="font-data"
            style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)' }}
          >
            Note <span style={{ textTransform: 'none', color: 'var(--ink-4)' }}>(optional)</span>
          </span>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Any instructions for this slot..."
            rows={2}
            maxLength={300}
            className="font-body"
            style={{
              border: '1.5px solid var(--ink)',
              padding: '7px 10px',
              fontSize: '14px',
              background: 'var(--paper)',
              color: 'var(--ink)',
              outline: 'none',
              resize: 'vertical',
              width: '100%',
              lineHeight: 1.4,
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--green)')}
            onBlur={e => (e.target.style.borderColor = 'var(--ink)')}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <Button variant="ghost" onClick={onClose} fullWidth disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} fullWidth disabled={loading}>
            {loading ? 'Saving…' : 'Create slot'}
          </Button>
        </div>
      </div>
    </div>
  )
}
