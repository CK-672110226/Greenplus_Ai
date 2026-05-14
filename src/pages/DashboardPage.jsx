import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { toast } from 'sonner'

import { useSelector, useDispatch } from 'react-redux'
import { localName } from '../data/wasteItems'
import { updateStatus } from '../store/bookingSlice'

const WEEKLY = [42, 65, 38, 90, 55, 72, 48]
const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function DashboardPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)
  const bookings = useSelector(s => s.bookings.bookings)

  function handleAccept(id) {
    dispatch(updateStatus({ id, status: 'accepted' }))
    toast.success('Order accepted')
  }
  function handleReject(id) {
    dispatch(updateStatus({ id, status: 'rejected' }))
    toast.error('Order rejected')
  }

  const pending   = bookings.filter(b => b.status === 'pending').length
  const completed = bookings.filter(b => b.status === 'accepted').length
  const revenue   = bookings.filter(b => b.status === 'accepted').reduce((s, b) => s + b.totalKg * 10, 0)

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.dashboardTitle ?? t.dashboard}</h1>

      <div className="w-full max-w-xl grid grid-cols-3 gap-3">
        <Card className="flex flex-col gap-1 items-center">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest text-center">{t.pendingOrders}</span>
          <span className="font-brand text-[28px] text-[var(--orange)]">{pending}</span>
        </Card>
        <Card className="flex flex-col gap-1 items-center">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest text-center">{t.completedOrders}</span>
          <span className="font-brand text-[28px] text-[var(--green)]">{completed}</span>
        </Card>
        <Card className="flex flex-col gap-1 items-center">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest text-center">{t.totalRevenue}</span>
          <span className="font-brand text-[22px] text-[var(--ink)]">฿{revenue}</span>
        </Card>
      </div>

      <Card className="w-full max-w-xl flex flex-col gap-3">
        <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">Weekly Volume (kg)</span>
        <div className="flex items-end gap-1 h-20">
          {WEEKLY.map((v, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
              <div style={{ height: `${(v / 100) * 64}px`, background: 'var(--green)', border: '1.5px solid var(--ink)' }} className="w-full" />
              <span className="font-data text-[9px] text-[var(--ink-3)]">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="w-full max-w-xl flex flex-col gap-3">
        <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.recentBookings}</span>
        {bookings.map(b => (
          <Card key={b.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="font-body text-[15px] text-[var(--ink)]">
                  {(b.materials ?? [b.materialType]).map(m => localName(m, language)).join(', ')}
                </span>
                <span className="font-data text-[12px] text-[var(--ink-3)]">
                  {b.totalKg ?? b.weight}kg · ฿{b.estValue ?? 0}
                </span>
              </div>
              <span
                className="font-data text-[11px] uppercase tracking-widest"
                style={b.status === 'pending' ? { color: 'var(--orange)' } : b.status === 'accepted' ? { color: 'var(--green)' } : { color: '#E53E3E' }}
              >
                {b.status}
              </span>
            </div>
            <span className="font-body text-[13px] text-[var(--ink-3)]">{b.seller ?? b.shopName}</span>
            {b.status === 'pending' && (
              <div className="flex gap-2 pt-1">
                <Button variant="primary"   onClick={() => handleAccept(b.id)}>{t.acceptOrder}</Button>
                <Button variant="secondary" onClick={() => handleReject(b.id)}>{t.rejectOrder}</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </main>
  )
}
