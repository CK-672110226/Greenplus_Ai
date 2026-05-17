import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
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
        'px-4 py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] cursor-pointer',
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
  const session  = useSelector(s => s.user.session)

  const savedOpenDays     = useSelector(s => s.buyer?.openDays ?? [1, 2, 3, 4, 5, 6])
  const acceptedMaterials = useSelector(s => s.buyer?.acceptedMaterials ?? Object.keys(WASTE_ITEMS))

  const [tab, setTab]                     = useState('orders')
  const [openDays, setOpenDays_local]     = useState(savedOpenDays)
  const [materialsSaved, setMaterialsSaved] = useState(false)
  const [slotPopup, setSlotPopup]         = useState(null) // { date, hour }

  const { shop } = useMyShop()

  const { bookings, loading, acceptBooking, rejectBooking } = useSupabaseBookings()

  useEffect(() => {
    dispatch(setBookings(bookings))
  }, [bookings, dispatch])

  // Load persisted buyer settings from Supabase on mount
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
      } catch {
        // fail silently — Redux defaults remain
      }
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
        await supabase
          .from('user_profiles')
          .update({ open_days: openDays })
          .eq('id', session.user.id)
      }
    } catch {
      // fail silently
    }
    toast.success(language === 'th' ? 'บันทึกวันเปิดทำการแล้ว' : 'Calendar saved successfully')
  }

  async function handleSaveMaterials() {
    const { error } = await supabase
      .from('user_profiles')
      .update({ accepted_materials: acceptedMaterials })
      .eq('id', session.user.id)
    if (error) {
      toast.error(language === 'th' ? 'บันทึกไม่สำเร็จ' : 'Failed to save materials')
    } else {
      toast.success(language === 'th' ? 'บันทึกแล้ว' : 'Materials saved')
      setMaterialsSaved(true)
    }
  }

  function handleAccept(id) {
    acceptBooking(id)
    toast.success('Order accepted')
  }
  function handleReject(id) {
    rejectBooking(id)
    toast.error('Order rejected')
  }

  const pending   = bookings.filter(b => b.status === 'pending').length
  const accepted  = bookings.filter(b => b.status === 'accepted').length
  const completed = bookings.filter(b => b.status === 'completed').length
  const revenue   = bookings.filter(b => b.status === 'accepted').reduce((s, b) => s + (b.estValue ?? 0), 0)

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <div className="flex flex-col gap-1">
        <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-[0.15em]">Buyer Dashboard</span>
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.dashboardTitle ?? t.dashboard}</h1>
      </div>

      <div className="w-full max-w-xl grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)]">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.pendingOrders}</span>
          <div className="font-brand text-[32px] text-[var(--orange)] leading-none">{pending}</div>
        </div>
        <div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)]">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">Accepted</span>
          <div className="font-brand text-[32px] text-[var(--green)] leading-none">{accepted}</div>
        </div>
        <div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)]">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.completedOrders}</span>
          <div className="font-brand text-[32px] text-[var(--ink)] leading-none">{completed}</div>
        </div>
        <div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)]">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.totalRevenue}</span>
          <div className="font-data text-[26px] text-[var(--ink)] leading-none">฿{revenue}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-xl flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <TabBtn active={tab === 'orders'}    onClick={() => setTab('orders')}>{t.recentBookings}</TabBtn>
        <TabBtn active={tab === 'schedule'}  onClick={() => setTab('schedule')}>{language === 'th' ? 'ตารางนัด' : 'Schedule'}</TabBtn>
        <TabBtn active={tab === 'route'}     onClick={() => setTab('route')}>{language === 'th' ? 'เส้นทางวันนี้' : 'Smart Route'}</TabBtn>
        <TabBtn active={tab === 'calendar'}  onClick={() => setTab('calendar')}>{language === 'th' ? 'ปฏิทินร้าน' : 'Shop Days'}</TabBtn>
        <TabBtn active={tab === 'materials'} onClick={() => setTab('materials')}>{language === 'th' ? 'วัสดุที่รับ' : 'Materials'}</TabBtn>
      </div>

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="w-full max-w-xl flex flex-col gap-3">
          {loading && (
            <>
              <div className="h-20 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
              <div className="h-20 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
              <div className="h-20 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
            </>
          )}
          {!loading && bookings.length === 0 && (
            <EmptyState
              icon="📋"
              title="No bookings yet today"
              body="When a recycler books a pickup, it'll appear here."
              primaryCta="Adjust prices →"
              onPrimary={() => setTab('materials')}
            />
          )}
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
                <span>
                  {b.status === 'pending'   && <span className="font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border-[1.5px] border-[var(--ink)] text-[var(--ink)]">pending</span>}
                  {b.status === 'accepted'  && <span className="font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border-[1.5px] border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-ink)]">accepted</span>}
                  {b.status === 'completed' && <span className="font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border-[1.5px] border-[var(--ink-4)] bg-[var(--paper-2)] text-[var(--ink-3)]">completed</span>}
                  {b.status === 'rejected'  && <span className="font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border-[1.5px] border-[var(--orange)] text-[var(--orange)]">rejected</span>}
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

      {/* Schedule tab */}
      {tab === 'schedule' && (
        <div className="w-full max-w-4xl flex flex-col gap-3">
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
      {tab === 'route' && (
        <div className="w-full max-w-2xl">
          <SmartRouteMap />
        </div>
      )}

      {/* Calendar tab */}
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
                      className={`font-data text-[11px] uppercase tracking-widest px-3 py-1.5 border-[1.5px] transition-colors cursor-pointer ${
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

      {/* Materials tab */}
      {tab === 'materials' && (
        <div className="w-full max-w-xl flex flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <h2 className="font-brand text-[18px] text-[var(--ink)] m-0">
              {language === 'th' ? 'วัสดุที่รับซื้อ' : 'Accepted Materials'}
            </h2>
            <p className="font-body text-[14px] text-[var(--ink-3)] m-0">
              {language === 'th'
                ? 'เลือกประเภทวัสดุที่ร้านของคุณรับซื้อ ระบบจะแสดงเฉพาะร้านที่รับวัสดุที่ผู้ใช้ต้องการขาย'
                : "Select the material types your shop accepts. Only shops that accept the user's materials will be shown in routing."}
            </p>
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
                        : 'bg-[var(--paper-2)] border-[var(--ink-4)] text-[var(--ink-3)]'
                    }`}
                  >
                    {localName(key, language)}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={handleSaveMaterials}
                disabled={!session?.user?.id}
              >
                {language === 'th' ? 'บันทึก' : 'Save'}
              </Button>
              {materialsSaved && (
                <span className="font-data text-[11px] text-[var(--green-ink)] uppercase tracking-widest">
                  ● {language === 'th' ? 'บันทึกแล้ว' : 'saved'}
                </span>
              )}
            </div>
          </Card>
        </div>
      )}
    </main>
  )
}
