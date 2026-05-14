import { useState } from 'react'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

import { useSelector, useDispatch } from 'react-redux'
import { localName, WASTE_ITEMS, pricePerKg } from '../data/wasteItems'
import { updateStatus } from '../store/bookingSlice'
import { toggleMaterial, setOpenDays } from '../store/buyerSlice'

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
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)
  const bookings = useSelector(s => s.bookings.bookings)

  const savedOpenDays      = useSelector(s => s.buyer?.openDays ?? [1, 2, 3, 4, 5, 6])
  const acceptedMaterials  = useSelector(s => s.buyer?.acceptedMaterials ?? Object.keys(WASTE_ITEMS))

  const [tab, setTab]            = useState('orders')
  const [pricing, setPricing]    = useState(initPricing)
  const [openDays, setOpenDays_local] = useState(savedOpenDays)

  function handleToggleDay(dayIndex) {
    setOpenDays_local(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    )
  }

  function handleSaveCalendar() {
    dispatch(setOpenDays(openDays))
    toast.success(language === 'th' ? 'บันทึกวันเปิดทำการแล้ว' : 'Calendar saved successfully')
  }

  function handleAccept(id) {
    dispatch(updateStatus({ id, status: 'accepted' }))
    toast.success('Order accepted')
  }
  function handleReject(id) {
    dispatch(updateStatus({ id, status: 'rejected' }))
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
      <div className="w-full max-w-xl flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <TabBtn active={tab === 'orders'}  onClick={() => setTab('orders')}>{t.recentBookings}</TabBtn>
        <TabBtn active={tab === 'pricing'} onClick={() => setTab('pricing')}>{t.myPricing}</TabBtn>
        <TabBtn active={tab === 'calendar'} onClick={() => setTab('calendar')}>{language === 'th' ? 'ปฏิทินร้าน' : 'Shop Calendar'}</TabBtn>
        <TabBtn active={tab === 'materials'} onClick={() => setTab('materials')}>{language === 'th' ? 'วัสดุที่รับ' : 'Materials'}</TabBtn>
      </div>

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="w-full max-w-xl flex flex-col gap-3">
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
      )}

      {/* Pricing CRUD tab (B-02) */}
      {tab === 'pricing' && (
        <div className="w-full max-w-xl flex flex-col gap-3 overflow-x-auto">
          <div className="grid grid-cols-4 gap-2 font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest px-3 min-w-[400px]">
            <span>Material</span>
            <span>{t.gradeA}</span>
            <span>{t.gradeB}</span>
            <span>{t.gradeC}</span>
          </div>
          {Object.keys(WASTE_ITEMS).map(mat => (
            <Card key={mat} className="grid grid-cols-4 gap-2 items-center min-w-[400px]">
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

      {/* Calendar Tab (B-04) */}
      {tab === 'calendar' && (
        <div className="w-full max-w-xl flex flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <h2 className="font-brand text-[18px] text-[var(--ink)] m-0">
              {language === 'th' ? 'วันเปิด-ปิดทำการ (Operating Days)' : 'Operating Days'}
            </h2>
            <p className="font-body text-[14px] text-[var(--ink-3)] m-0">
              {language === 'th' 
                ? 'เลือกวันที่ร้านเปิดรับซื้อ เพื่อให้ลูกค้าไม่ถูกนำทางมาในวันที่ร้านหยุด' 
                : 'Select the days your shop is open so users do not route to you when closed.'}
            </p>
            <div className="flex flex-col gap-2 mt-2">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName, index) => {
                const isOpen = openDays.includes(index)
                return (
                  <div key={index} className="flex items-center justify-between border-[1.5px] border-[var(--ink-4)] p-3">
                    <span className="font-body text-[15px] text-[var(--ink)]">{dayName}</span>
                    <button
                      onClick={() => handleToggleDay(index)}
                      className={`font-data text-[11px] uppercase tracking-widest px-3 py-1.5 border-[1.5px] transition-colors ${
                        isOpen 
                          ? 'bg-[var(--green)] border-[var(--green-ink)] text-[var(--ink)]' 
                          : 'bg-[var(--paper-2)] border-[var(--ink-4)] text-[var(--ink-3)]'
                      }`}
                    >
                      {isOpen ? (language === 'th' ? 'เปิด' : 'OPEN') : (language === 'th' ? 'ปิด' : 'CLOSED')}
                    </button>
                  </div>
                )
              })}
            </div>
            <Button variant="primary" onClick={handleSaveCalendar} className="mt-2">
              {language === 'th' ? 'บันทึกการตั้งค่า' : 'Save Calendar'}
            </Button>
          </Card>
        </div>
      )}
      {/* Materials tab (B-06) */}
      {tab === 'materials' && (
        <div className="w-full max-w-xl flex flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <h2 className="font-brand text-[18px] text-[var(--ink)] m-0">
              {language === 'th' ? 'วัสดุที่รับซื้อ' : 'Accepted Materials'}
            </h2>
            <p className="font-body text-[14px] text-[var(--ink-3)] m-0">
              {language === 'th'
                ? 'เลือกประเภทวัสดุที่ร้านของคุณรับซื้อ ระบบจะแสดงเฉพาะร้านที่รับวัสดุที่ผู้ใช้ต้องการขาย'
                : 'Select the material types your shop accepts. Only shops that accept the user\'s materials will be shown in routing.'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(WASTE_ITEMS).map(key => {
                const isOn = acceptedMaterials.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() => dispatch(toggleMaterial(key))}
                    className={`py-3 px-4 font-body text-[14px] border-[1.5px] text-left transition-colors ${
                      isOn
                        ? 'bg-[var(--green)] border-[var(--ink)] text-[var(--ink)]'
                        : 'bg-[var(--paper-2)] border-[var(--ink-4)] text-[var(--ink-3)]'
                    }`}
                  >
                    {localName(key, language)}
                  </button>
                )
              })}
            </div>
            <Button
              variant="primary"
              onClick={() => toast.success(language === 'th' ? 'บันทึกแล้ว' : 'Saved')}
            >
              {language === 'th' ? 'บันทึก' : 'Save'}
            </Button>
          </Card>
        </div>
      )}
    </main>
  )
}
