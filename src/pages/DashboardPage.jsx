import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { ScheduleCalendar } from '../components/ScheduleCalendar'
import { SlotCreatePopup } from '../components/SlotCreatePopup'
import SmartRouteMap from '../components/SmartRouteMap'

import { useSelector, useDispatch } from 'react-redux'
import { localName, WASTE_ITEMS } from '../data/wasteItems'
import { setBookings } from '../store/bookingSlice'
import { toggleMaterial, setOpenDays, setAcceptedMaterials } from '../store/buyerSlice'
import { useSupabaseBookings } from '../hooks/useSupabaseBookings'
import { useMyShop } from '../hooks/useMyShop'
import { supabase } from '../lib/supabase'

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-1.5 font-data text-[10px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] cursor-pointer whitespace-nowrap transition-colors',
        active
          ? 'bg-[var(--ink)] text-[var(--paper)]'
          : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function AvatarInitial({ name }) {
  const initial = (name ?? '?').trim().charAt(0).toUpperCase()
  return (
    <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center border-[1.5px] border-[var(--ink)] bg-[var(--paper-2)]">
      <span className="font-data text-[13px] text-[var(--ink)]">{initial}</span>
    </div>
  )
}

function StatusChip({ status }) {
  if (status === 'pending')
    return <span className="font-data text-[9px] uppercase tracking-widest px-2 py-0.5 border-[1.5px] border-[var(--ink)] text-[var(--ink)]">pending</span>
  if (status === 'accepted')
    return <span className="font-data text-[9px] uppercase tracking-widest px-2 py-0.5 border-[1.5px] border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-ink)]">accepted</span>
  if (status === 'completed')
    return <span className="font-data text-[9px] uppercase tracking-widest px-2 py-0.5 border-[1.5px] border-[var(--ink-4)] bg-[var(--paper-2)] text-[var(--ink-3)]">completed</span>
  if (status === 'rejected')
    return <span className="font-data text-[9px] uppercase tracking-widest px-2 py-0.5 border-[1.5px] border-[var(--orange)] text-[var(--orange)]">rejected</span>
  return null
}

function BookingRow({ b, language, t, onAccept, onReject }) {
  const sellerName = b.seller ?? b.shopName ?? '—'
  const materials  = (b.materials ?? (b.materialType ? [b.materialType] : [])).map(m => localName(m, language)).join(', ')
  const kg         = b.totalKg ?? b.weight ?? 0
  const value      = b.estValue ?? 0

  return (
    <div className="flex flex-col gap-2 py-3 border-b-[1px] border-[var(--ink-4)] last:border-0">
      <div className="flex items-start gap-3">
        <AvatarInitial name={sellerName} />
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-body text-[15px] text-[var(--ink)] truncate">{sellerName}</span>
            <StatusChip status={b.status} />
          </div>
          <span className="font-data text-[11px] text-[var(--ink-3)]">
            {materials} · {kg}kg · ฿{value.toLocaleString()}
          </span>
          {b.scheduledAt && (
            <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">
              {new Date(b.scheduledAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' })} today
            </span>
          )}
        </div>
      </div>
      {b.status === 'pending' && (
        <div className="flex gap-2 pl-12">
          <Button variant="primary"   onClick={() => onAccept(b.id)}>{t.acceptOrder} ▶</Button>
          <Button variant="secondary" onClick={() => onReject(b.id)}>{t.rejectOrder}</Button>
        </div>
      )}
    </div>
  )
}

export function DashboardPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)
  const session  = useSelector(s => s.user.session)

  const savedOpenDays     = useSelector(s => s.buyer?.openDays ?? [1, 2, 3, 4, 5, 6])
  const acceptedMaterials = useSelector(s => s.buyer?.acceptedMaterials ?? Object.keys(WASTE_ITEMS))

  const [tab, setTab]                       = useState('orders')
  const [openDays, setOpenDays_local]       = useState(savedOpenDays)
  const [materialsSaved, setMaterialsSaved] = useState(false)
  const [slotPopup, setSlotPopup]           = useState(null)

  const { shop } = useMyShop()
  const { bookings, loading, acceptBooking, rejectBooking } = useSupabaseBookings()

  useEffect(() => {
    dispatch(setBookings(bookings))
  }, [bookings, dispatch])

  useEffect(() => {
    if (!session?.user?.id) return
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('open_days, accepted_materials')
          .eq('id', session.user.id)
          .single()
        if (data) {
          if (Array.isArray(data.open_days) && data.open_days.length > 0) {
            setOpenDays_local(data.open_days)
            dispatch(setOpenDays(data.open_days))
          }
          if (Array.isArray(data.accepted_materials) && data.accepted_materials.length > 0) {
            dispatch(setAcceptedMaterials(data.accepted_materials))
          }
        }
      } catch { /* fail silently */ }
    }
    loadSettings()
  }, [session?.user?.id, dispatch])

  function handleToggleDay(dayIndex) {
    setOpenDays_local(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    )
  }

  async function handleSaveCalendar() {
    dispatch(setOpenDays(openDays))
    try {
      if (session?.user?.id) {
        await supabase.from('user_profiles').update({ open_days: openDays }).eq('id', session.user.id)
      }
    } catch { /* fail silently */ }
    toast.success(language === 'th' ? 'บันทึกวันเปิดทำการแล้ว' : 'Calendar saved')
  }

  async function handleSaveMaterials() {
    const { error } = await supabase
      .from('user_profiles')
      .update({ accepted_materials: acceptedMaterials })
      .eq('id', session.user.id)
    if (error) {
      toast.error(language === 'th' ? 'บันทึกไม่สำเร็จ' : 'Failed to save')
    } else {
      toast.success(language === 'th' ? 'บันทึกแล้ว' : 'Saved')
      setMaterialsSaved(true)
    }
  }

  function handleAccept(id) { acceptBooking(id); toast.success('Order accepted') }
  function handleReject(id) { rejectBooking(id); toast.error('Order rejected') }

  const pending   = bookings.filter(b => b.status === 'pending').length
  const accepted  = bookings.filter(b => b.status === 'accepted').length
  const completed = bookings.filter(b => b.status === 'completed').length
  const revenue   = bookings.filter(b => b.status === 'accepted').reduce((s, b) => s + (b.estValue ?? 0), 0)
  const newReqs   = pending

  const shopName  = shop?.name ?? (language === 'th' ? 'แดชบอร์ดร้าน' : 'Your Shop')

  return (
    <main className="w-full px-4 py-8 flex flex-col gap-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-0.5">
        <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-[0.15em]">
          {language === 'th' ? 'หน้าแรก / แดชบอร์ด' : 'Home / Dashboard'}
        </span>
        <h1 className="font-brand text-[26px] text-[var(--ink)] m-0 leading-tight">
          {shopName}
          <span className="font-body text-[16px] text-[var(--ink-3)] ml-2">
            — {language === 'th' ? 'วันนี้' : "today's haul"}
          </span>
        </h1>
      </div>

      {/* KPI row — 4 cards, full-width, exact spec pattern */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)] hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">Pending</span>
          <div className="font-brand text-[32px] text-[var(--orange)] leading-none">{pending}</div>
        </div>
        <div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)] hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">Accepted</span>
          <div className="font-brand text-[32px] text-[var(--green)] leading-none">{accepted}</div>
        </div>
        <div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)] hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">Completed</span>
          <div className="font-brand text-[32px] text-[var(--ink)] leading-none">{completed}</div>
          <span className="font-data text-[10px] text-[var(--ink-4)]">7d</span>
        </div>
        <div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)] hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">Revenue</span>
          <div className="font-brand text-[32px] text-[var(--ink)] leading-none">฿{revenue.toLocaleString()}</div>
          <span className="font-data text-[10px] text-[var(--ink-4)]">7d</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center justify-between gap-3 border-b-[1.5px] border-[var(--ink-4)] pb-0">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {[
            { key: 'orders',    label: 'Bookings' },
            { key: 'schedule',  label: language === 'th' ? 'ตารางนัด' : 'Schedule' },
            { key: 'route',     label: language === 'th' ? 'เส้นทาง' : 'Route' },
            { key: 'calendar',  label: language === 'th' ? 'วันทำการ' : 'Shop Days' },
            { key: 'materials', label: language === 'th' ? 'วัสดุ' : 'Materials' },
          ].map(({ key, label }) => (
            <TabBtn key={key} active={tab === key} onClick={() => setTab(key)}>
              {label}
            </TabBtn>
          ))}
        </div>
        {newReqs > 0 && (
          <span className="font-data text-[10px] text-[var(--orange)] uppercase tracking-widest whitespace-nowrap flex-shrink-0">
            ● {newReqs} new request{newReqs > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Bookings tab */}
      {tab === 'orders' && (
        <div className="flex flex-col">
          {loading && (
            <>
              <div className="h-20 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)] mb-3" />
              <div className="h-20 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)] mb-3" />
              <div className="h-20 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
            </>
          )}
          {!loading && bookings.length === 0 && (
            <EmptyState
              icon="📋"
              title="No bookings yet"
              body="When a recycler books a pickup, it'll appear here."
              primaryCta="Adjust materials →"
              onPrimary={() => setTab('materials')}
            />
          )}
          {!loading && bookings.map(b => (
            <BookingRow
              key={b.id}
              b={b}
              language={language}
              t={t}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Schedule tab */}
      {tab === 'schedule' && (
        <div className="flex flex-col gap-3">
          <ScheduleCalendar
            bookings={bookings}
            onSlotCreate={(date, hour) => setSlotPopup({ date, hour })}
          />
          {slotPopup && (
            <SlotCreatePopup
              date={slotPopup.date}
              hour={slotPopup.hour}
              shopId={shop?.id}
              onClose={() => setSlotPopup(null)}
              onCreated={() => { setSlotPopup(null); toast.success(language === 'th' ? 'สร้างช่วงเวลาแล้ว' : 'Slot created') }}
            />
          )}
        </div>
      )}

      {/* Smart Route tab */}
      {tab === 'route' && <SmartRouteMap />}

      {/* Calendar tab */}
      {tab === 'calendar' && (
        <div className="flex flex-col gap-4 max-w-xl">
          <div className="flex flex-col gap-0.5">
            <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">Operating Days</span>
            <p className="font-body text-[14px] text-[var(--ink-3)] m-0">
              {language === 'th'
                ? 'เลือกวันที่ร้านเปิดรับซื้อ เพื่อให้ลูกค้าไม่ถูกนำทางมาในวันที่ร้านหยุด'
                : 'Select your open days so users are not routed to you when closed.'}
            </p>
          </div>
          <div className="flex flex-col border-[1.5px] border-[var(--ink)] divide-y divide-[var(--ink-4)]">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName, index) => {
              const isOpen = openDays.includes(index)
              return (
                <div key={index} className="flex items-center justify-between px-4 py-3">
                  <span className="font-body text-[15px] text-[var(--ink)]">{dayName}</span>
                  <button
                    onClick={() => handleToggleDay(index)}
                    className={`font-data text-[10px] uppercase tracking-widest px-3 py-1 border-[1.5px] transition-colors cursor-pointer ${
                      isOpen
                        ? 'bg-[var(--green)] border-[var(--green-ink)] text-[var(--ink)]'
                        : 'bg-transparent border-[var(--ink-4)] text-[var(--ink-3)]'
                    }`}
                  >
                    {isOpen ? 'Open' : 'Closed'}
                  </button>
                </div>
              )
            })}
          </div>
          <Button variant="primary" onClick={handleSaveCalendar}>
            {language === 'th' ? 'บันทึก' : 'Save Calendar'}
          </Button>
        </div>
      )}

      {/* Materials tab */}
      {tab === 'materials' && (
        <div className="flex flex-col gap-4 max-w-xl">
          <div className="flex flex-col gap-0.5">
            <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">Accepted Materials</span>
            <p className="font-body text-[14px] text-[var(--ink-3)] m-0">
              {language === 'th'
                ? 'เลือกประเภทวัสดุที่ร้านของคุณรับซื้อ'
                : "Select the material types your shop accepts."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(WASTE_ITEMS).map(key => {
              const isOn = acceptedMaterials.includes(key)
              return (
                <button
                  key={key}
                  onClick={() => { dispatch(toggleMaterial(key)); setMaterialsSaved(false) }}
                  className={`py-3 px-4 font-body text-[14px] border-[1.5px] text-left transition-colors cursor-pointer ${
                    isOn
                      ? 'bg-[var(--green)] border-[var(--ink)] text-[var(--ink)]'
                      : 'bg-transparent border-[var(--ink-4)] text-[var(--ink-3)]'
                  }`}
                >
                  {localName(key, language)}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={handleSaveMaterials} disabled={!session?.user?.id}>
              {language === 'th' ? 'บันทึก' : 'Save'}
            </Button>
            {materialsSaved && (
              <span className="font-data text-[11px] text-[var(--green-ink)] uppercase tracking-widest">
                ● {language === 'th' ? 'บันทึกแล้ว' : 'saved'}
              </span>
            )}
          </div>
        </div>
      )}

    </main>
  )
}
