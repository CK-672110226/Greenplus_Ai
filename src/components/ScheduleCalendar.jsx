import { useState } from 'react'

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

function getWeekDays(offset = 0) {
  const now = new Date()
  const day = now.getDay()
  const mondayMs = now.getTime() - (day === 0 ? 6 : day - 1) * 86400000 + offset * 7 * 86400000
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayMs + i * 86400000)
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + d.getDate(),
      iso: d.toISOString().slice(0, 10),
      isToday: d.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10),
    }
  })
}

function statusColor(status) {
  if (status === 'pending') return 'var(--orange)'
  if (status === 'accepted') return 'var(--green)'
  if (status === 'rejected') return 'var(--ink-4)'
  return 'var(--blue)'
}

function formatWeekLabel(days) {
  const first = days[0]
  const last = days[6]
  const opts = { month: 'short', year: 'numeric' }
  const a = new Date(first.iso).toLocaleDateString('en-US', opts)
  const b = new Date(last.iso).toLocaleDateString('en-US', opts)
  return a === b ? `${first.iso.slice(8, 10)}–${last.iso.slice(8, 10)} ${a}` : `${first.label} – ${last.label}`
}

export function ScheduleCalendar({ bookings = [], onSlotCreate }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const days = getWeekDays(weekOffset)

  return (
    <div
      style={{
        border: '1.5px solid var(--ink)',
        boxShadow: '2px 2px 0 var(--ink)',
        background: 'var(--paper)',
        overflowX: 'auto',
      }}
    >
      {/* Nav row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          borderBottom: '1.5px solid var(--ink-4)',
        }}
      >
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          style={{
            fontFamily: 'inherit',
            fontSize: '13px',
            border: '1.5px solid var(--ink)',
            background: 'var(--paper)',
            boxShadow: '2px 2px 0 var(--ink)',
            padding: '2px 10px',
            cursor: 'pointer',
            transition: 'all 75ms',
            color: 'var(--ink)',
          }}
          className="active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          ‹
        </button>
        <span
          className="font-data"
          style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', flex: 1, textAlign: 'center' }}
        >
          {weekOffset === 0 ? 'This week' : weekOffset === -1 ? 'Last week' : weekOffset === 1 ? 'Next week' : formatWeekLabel(days)}
          {' · '}
          {formatWeekLabel(days)}
        </span>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          style={{
            fontFamily: 'inherit',
            fontSize: '13px',
            border: '1.5px solid var(--ink)',
            background: 'var(--paper)',
            boxShadow: '2px 2px 0 var(--ink)',
            padding: '2px 10px',
            cursor: 'pointer',
            transition: 'all 75ms',
            color: 'var(--ink)',
          }}
          className="active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          ›
        </button>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '46px repeat(7, 1fr)',
          minWidth: '520px',
        }}
      >
        {/* Header row */}
        <div style={{ height: '32px', borderBottom: '1.5px solid var(--ink-4)' }} />
        {days.map(day => (
          <div
            key={day.iso}
            className="font-data"
            style={{
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: day.isToday ? 'var(--green-ink)' : 'var(--ink-2)',
              borderBottom: day.isToday ? '2px solid var(--green)' : '1.5px solid var(--ink-4)',
              borderLeft: '1px solid var(--ink-4)',
              background: day.isToday ? 'var(--green-soft)' : 'transparent',
              fontWeight: day.isToday ? 700 : 400,
            }}
          >
            {day.label}
          </div>
        ))}

        {/* Hour rows */}
        {HOURS.map(hour => (
          <div key={hour} style={{ display: 'contents' }}>
            {/* Time label */}
            <div
              className="font-data"
              style={{
                height: '38px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                paddingRight: '6px',
                paddingTop: '3px',
                fontSize: '10px',
                color: 'var(--ink-3)',
                borderBottom: '1px solid var(--ink-4)',
                borderRight: '1px solid var(--ink-4)',
              }}
            >
              {String(hour).padStart(2, '0')}:00
            </div>

            {/* Day cells */}
            {days.map(day => {
              const cellBookings = bookings.filter(
                b => b.scheduled_date === day.iso && b.start_hour === hour
              )
              return (
                <div
                  key={day.iso}
                  onClick={() => onSlotCreate && onSlotCreate(day.iso, hour)}
                  className="cursor-pointer"
                  style={{
                    height: '38px',
                    position: 'relative',
                    borderBottom: '1px solid var(--ink-4)',
                    borderLeft: '1px solid var(--ink-4)',
                    background: day.isToday ? 'var(--green-soft)' : 'transparent',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => {
                    if (cellBookings.length === 0) {
                      e.currentTarget.style.background = day.isToday
                        ? 'rgba(34,197,94,0.22)'
                        : 'var(--paper-2)'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = day.isToday ? 'var(--green-soft)' : 'transparent'
                  }}
                >
                  {cellBookings.map(b => (
                    <div
                      key={b.id}
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        inset: '2px 3px',
                        background: statusColor(b.status),
                        opacity: b.status === 'rejected' ? 0.55 : 0.85,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 4px',
                        overflow: 'hidden',
                        cursor: 'default',
                      }}
                    >
                      <span
                        className="font-data"
                        style={{
                          fontSize: '10px',
                          color: b.status === 'rejected' ? 'var(--ink-3)' : '#062040',
                          textDecoration: b.status === 'rejected' ? 'line-through' : 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                      >
                        {b.materials
                          ? String(b.materials).slice(0, 12)
                          : b.totalKg != null
                          ? `${b.totalKg} kg`
                          : b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
