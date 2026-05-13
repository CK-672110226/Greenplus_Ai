import { useState } from 'react'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { useSelector } from 'react-redux'
import { localName, WASTE_ITEMS, pricePerKg } from '../data/wasteItems'

const MOCK_BOOKINGS = [
  { id: 1, seller: 'ณัฐวุฒิ ใจดี',  materialType: 'aluminum_can',     grade: 'A', weight: 12, status: 'pending'  },
  { id: 2, seller: 'สุภาพร แสนสุข', materialType: 'cardboard',         grade: 'B', weight: 30, status: 'pending'  },
  { id: 3, seller: 'ธนกร มีสุข',    materialType: 'copper',            grade: 'A', weight: 5,  status: 'accepted' },
  { id: 4, seller: 'กัญญา รักดี',   materialType: 'pet_bottle_clear',  grade: 'B', weight: 18, status: 'accepted' },
  { id: 5, seller: 'ประเสริฐ งาม',  materialType: 'mixed_plastic',     grade: 'C', weight: 40, status: 'rejected' },
]

const WEEKLY = [42, 65, 38, 90, 55, 72, 48]
const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function initPricing() {
  const p = {}
  Object.keys(WASTE_ITEMS).forEach(mat => {
    p[mat] = {
      A: pricePerKg(mat, 'A'),
      B: pricePerKg(mat, 'B'),
      C: pricePerKg(mat, 'C'),
    }
  })
  return p
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)]',
        active ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export function DashboardPage() {
  const t        = useT()
  const language = useSelector(s => s.user.language)

  const [tab, setTab]           = useState('orders')
  const [bookings, setBookings] = useState(MOCK_BOOKINGS)
  const [pricing, setPricing]   = useState(initPricing)

  function handleAccept(id) {
    setBookings(b => b.map(x => x.id === id ? { ...x, status: 'accepted' } : x))
    toast.success('Order accepted')
  }
  function handleReject(id) {
    setBookings(b => b.map(x => x.id === id ? { ...x, status: 'rejected' } : x))
    toast.error('Order rejected')
  }
  function handlePriceChange(mat, grade, val) {
    setPricing(p => ({ ...p, [mat]: { ...p[mat], [grade]: parseFloat(val) || 0 } }))
  }
  function handleSavePricing() {
    toast.success(t.savePricing)
  }

  const pending   = bookings.filter(b => b.status === 'pending').length
  const completed = bookings.filter(b => b.status === 'accepted').length
  const revenue   = bookings.filter(b => b.status === 'accepted').reduce((s, b) => s + b.weight * 10, 0)

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.dashboardTitle ?? t.dashboard}</h1>

      {/* Stats row */}
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

      {/* Weekly chart */}
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

      {/* Tabs */}
      <div className="w-full max-w-xl flex gap-2">
        <TabBtn active={tab === 'orders'}  onClick={() => setTab('orders')}>{t.recentBookings}</TabBtn>
        <TabBtn active={tab === 'pricing'} onClick={() => setTab('pricing')}>{t.myPricing}</TabBtn>
      </div>

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="w-full max-w-xl flex flex-col gap-3">
          {bookings.map(b => (
            <Card key={b.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <GradeTag grade={b.grade} />
                  <span className="font-body text-[15px] text-[var(--ink)]">{localName(b.materialType, language)}</span>
                  <span className="font-data text-[12px] text-[var(--ink-3)]">{b.weight}kg</span>
                </div>
                <span
                  className="font-data text-[11px] uppercase tracking-widest"
                  style={b.status === 'pending' ? { color: 'var(--orange)' } : b.status === 'accepted' ? { color: 'var(--green)' } : { color: '#E53E3E' }}
                >
                  {b.status}
                </span>
              </div>
              <span className="font-body text-[13px] text-[var(--ink-3)]">{b.seller}</span>
              {b.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <Button variant="primary"    onClick={() => handleAccept(b.id)}>{t.acceptOrder}</Button>
                  <Button variant="secondary"  onClick={() => handleReject(b.id)}>{t.rejectOrder}</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pricing CRUD tab (B-02) */}
      {tab === 'pricing' && (
        <div className="w-full max-w-xl flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-2 font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest px-3">
            <span>Material</span>
            <span>{t.gradeA}</span>
            <span>{t.gradeB}</span>
            <span>{t.gradeC}</span>
          </div>
          {Object.keys(WASTE_ITEMS).map(mat => (
            <Card key={mat} className="grid grid-cols-4 gap-2 items-center">
              <span className="font-body text-[13px] text-[var(--ink)]">{localName(mat, language)}</span>
              {['A', 'B', 'C'].map(grade => (
                <input
                  key={grade}
                  type="number"
                  min="0"
                  step="0.5"
                  value={pricing[mat]?.[grade] ?? 0}
                  onChange={e => handlePriceChange(mat, grade, e.target.value)}
                  className="w-full px-2 py-1 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[13px] outline-none focus:border-[var(--green)]"
                />
              ))}
            </Card>
          ))}
          <Button variant="primary" onClick={handleSavePricing}>{t.savePricing}</Button>
        </div>
      )}
    </main>
  )
}
