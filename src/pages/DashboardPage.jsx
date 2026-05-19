import { useEffect, useRef, useState } from 'react'
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
import { setAcceptedMaterials } from '../store/buyerSlice'
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

const REJECT_PRESETS = [
  { en: 'Yard is full',             th: 'ลานเต็มแล้ว' },
  { en: 'Material paused',          th: 'หยุดรับวัสดุนี้ชั่วคราว' },
  { en: 'Wrong materials listed',   th: 'วัสดุไม่ตรงกับที่ระบุ' },
  { en: "Time doesn't work",        th: 'เวลาไม่สะดวก' },
]

function getTimeGroup(b, language) {
  const iso = b.scheduledAt || b.createdAt
  if (!iso) return language === 'th' ? 'รายการอื่น' : 'Other'
  const bkk    = { timeZone: 'Asia/Bangkok' }
  const d      = new Date(iso)
  const now    = new Date()
  const dDate  = d.toLocaleDateString('en-CA', bkk)
  const nowDate = now.toLocaleDateString('en-CA', bkk)
  const tomorrowDate = new Date(now.getTime() + 86_400_000).toLocaleDateString('en-CA', bkk)
  if (dDate === nowDate) {
    const hour = d.toLocaleTimeString('en-US', { ...bkk, hour: '2-digit', hour12: false }).slice(0, 2)
    return language === 'th'
      ? (parseInt(hour) < 12 ? 'วันนี้ ช่วงเช้า' : 'วันนี้ ช่วงบ่าย')
      : (parseInt(hour) < 12 ? 'Today AM'        : 'Today PM')
  }
  if (dDate === tomorrowDate) return language === 'th' ? 'พรุ่งนี้' : 'Tomorrow'
  if (d > now)                return language === 'th' ? 'ถัดไป'    : 'Later'
  return language === 'th' ? 'ก่อนหน้า' : 'Past'
}

const GROUP_ORDER_EN = ['Today AM', 'Today PM', 'Tomorrow', 'Later', 'Past', 'Other']
const GROUP_ORDER_TH = ['วันนี้ ช่วงเช้า', 'วันนี้ ช่วงบ่าย', 'พรุ่งนี้', 'ถัดไป', 'ก่อนหน้า', 'รายการอื่น']

function groupBookings(bookings, language) {
  const grouped = {}
  bookings.forEach(b => {
    const g = getTimeGroup(b, language)
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(b)
  })
  const order = language === 'th' ? GROUP_ORDER_TH : GROUP_ORDER_EN
  return order.filter(g => grouped[g]?.length).map(g => ({ label: g, items: grouped[g] }))
}

function BookingRow({ b, language, t, onAccept, onReject, onComplete, onCancel }) {
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
      {b.status === 'accepted' && (
        <div className="flex gap-2 pl-12">
          <button
            onClick={() => onComplete(b.id)}
            className="font-data text-[10px] uppercase tracking-[0.1em] px-3 py-2.5 border-[1.5px] border-[var(--green)] text-[var(--green)] bg-[var(--paper)] cursor-pointer transition-colors duration-150 hover:bg-[var(--green-soft)] active:scale-[0.97]"
          >
            COMPLETE
          </button>
          <button
            onClick={() => onCancel(b.id)}
            className="font-data text-[10px] uppercase tracking-[0.1em] px-3 py-2.5 border-[1.5px] border-[var(--ink-2)] text-[var(--ink-2)] bg-[var(--paper)] cursor-pointer transition-colors duration-150 hover:bg-[var(--paper-2)] active:scale-[0.97]"
          >
            CANCEL
          </button>
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

  const acceptedMaterials = useSelector(s => s.buyer?.acceptedMaterials ?? Object.keys(WASTE_ITEMS))

  const [tab, setTab]               = useState('orders')
  const [slotPopup, setSlotPopup]   = useState(null)
  const [rejectModal, setRejectModal] = useState(null)  // { id } | null
  const [rejectReason, setRejectReason] = useState('')
  const rejectCustomRef = useRef(null)

  const { shop } = useMyShop()
  const { bookings, loading, acceptBooking, rejectBooking, completeBooking, cancelBooking } = useSupabaseBookings()

  useEffect(() => {
    dispatch(setBookings(bookings))
  }, [bookings, dispatch])

  useEffect(() => {
    if (!session?.user?.id) return
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('accepted_materials')
          .eq('id', session.user.id)
          .single()
        if (data?.accepted_materials?.length > 0) {
          dispatch(setAcceptedMaterials(data.accepted_materials))
        }
      } catch { /* fail silently */ }
    }
    loadSettings()
  }, [session?.user?.id, dispatch])

  function handleAccept(id)   { acceptBooking(id);   toast.success('Order accepted') }
  function handleOpenReject(id) { setRejectModal({ id }); setRejectReason('') }
  function handleConfirmReject() {
    rejectBooking(rejectModal.id, rejectReason || undefined)
    toast.error('Order rejected')
    setRejectModal(null)
    setRejectReason('')
  }
  function handleComplete(id) { completeBooking(id); toast.success('Order marked as completed') }
  function handleCancel(id)   { cancelBooking(id);   toast.error('Order cancelled') }

  const pending   = bookings.filter(b => b.status === 'pending').length
  const accepted  = bookings.filter(b => b.status === 'accepted').length
  const completed = bookings.filter(b => b.status === 'completed').length
  const revenue   = bookings.filter(b => b.status === 'accepted').reduce((s, b) => s + (b.estValue ?? 0), 0)
  const newReqs   = pending

  const shopName  = shop?.name ?? t.shopNameFallback

  return (
    <main className="w-full px-4 py-8 flex flex-col gap-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-0.5">
        <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-[0.15em]">
          {t.breadcrumbDash}
        </span>
        <h1 className="font-brand text-[26px] text-[var(--ink)] m-0 leading-tight flex items-baseline gap-2 flex-wrap">
          <span className="truncate max-w-[60vw]">{shopName}</span>
          <span className="font-body text-[16px] text-[var(--ink-3)] shrink-0">— {t.todaysHaul}</span>
        </h1>
      </div>

      {/* KPI row — 4 cards, full-width, exact spec pattern */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)] hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.kpiPending}</span>
          <div className="font-brand text-[32px] text-[var(--orange)] leading-none">{pending}</div>
        </div>
        <div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)] hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.kpiAccepted}</span>
          <div className="font-brand text-[32px] text-[var(--green)] leading-none">{accepted}</div>
        </div>
        <div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)] hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.kpiCompleted}</span>
          <div className="font-brand text-[32px] text-[var(--ink)] leading-none">{completed}</div>
          <span className="font-data text-[10px] text-[var(--ink-4)]">7d</span>
        </div>
        <div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)] hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.kpiRevenue}</span>
          <div className="font-brand text-[32px] text-[var(--ink)] leading-none">฿{revenue.toLocaleString()}</div>
          <span className="font-data text-[10px] text-[var(--ink-4)]">7d</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center justify-between gap-3 border-b-[1.5px] border-[var(--ink-4)] pb-0">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {[
            { key: 'orders',    label: t.tabBookings },
            { key: 'schedule',  label: t.schedule },
            { key: 'route',     label: t.tabSmartRoute },
            { key: 'pricing',   label: t.pricing },
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
              primaryCta="View pricing →"
              onPrimary={() => setTab('pricing')}
            />
          )}
          {!loading && groupBookings(bookings, language).map(({ label, items }) => (
            <div key={label}>
              <div className="flex items-center gap-3 my-2">
                <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest whitespace-nowrap">
                  {label}
                </span>
                <div className="flex-1 h-[1px] bg-[var(--ink-4)]" />
              </div>
              {items.map(b => (
                <BookingRow
                  key={b.id}
                  b={b}
                  language={language}
                  t={t}
                  onAccept={handleAccept}
                  onReject={handleOpenReject}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                />
              ))}
            </div>
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

      {/* Reject reason modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-[#1A1A1Ae6] flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm bg-[var(--paper)] border-[2px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] p-6 flex flex-col gap-4">
            <h2 className="font-brand text-[20px] text-[var(--ink)] m-0">
              {language === 'th' ? 'ปฏิเสธคำสั่ง' : 'Reject order'}
            </h2>
            <p className="font-body text-[13px] text-[var(--ink-3)] m-0">
              {language === 'th' ? 'เหตุผล (ไม่บังคับ)' : 'Reason (optional)'}
            </p>
            <div className="flex flex-wrap gap-2">
              {REJECT_PRESETS.map(p => {
                const label = language === 'th' ? p.th : p.en
                return (
                  <button
                    key={p.en}
                    type="button"
                    onClick={() => setRejectReason(label)}
                    className={[
                      'px-3 py-1.5 font-data text-[11px] uppercase tracking-wide border-[1.5px] cursor-pointer transition-colors',
                      rejectReason === label
                        ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
                        : 'border-[var(--ink-4)] text-[var(--ink-3)] hover:border-[var(--ink)] hover:text-[var(--ink)]',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <input
              ref={rejectCustomRef}
              type="text"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder={language === 'th' ? 'หรือพิมพ์เหตุผลเอง…' : 'or type a reason…'}
              className="px-3 py-2 border-[1.5px] border-[var(--ink-4)] bg-[var(--paper)] font-body text-[14px] outline-none focus:border-[var(--ink)]"
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setRejectModal(null)}>
                {language === 'th' ? 'ยกเลิก' : 'Cancel'}
              </Button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--orange)] bg-[var(--orange)] text-[var(--ink)] cursor-pointer hover:opacity-90 transition-opacity"
              >
                {language === 'th' ? 'ปฏิเสธ' : 'Reject order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing tab */}
      {tab === 'pricing' && (
        <div className="flex flex-col gap-0 max-w-2xl">
          <div className="flex items-center justify-between px-0 py-3 border-b-[1.5px] border-[var(--ink)]">
            <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">Material</span>
            <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">Base price ฿/kg</span>
          </div>
          {acceptedMaterials.map(key => {
            const item = WASTE_ITEMS[key]
            if (!item) return null
            return (
              <div key={key} className="flex items-center justify-between py-3 border-b-[1px] border-[var(--ink-4)]">
                <span className="font-body text-[15px] text-[var(--ink)]">{localName(key, language)}</span>
                <span className="font-data text-[18px] text-[var(--green-ink)]">฿ {item.basePrice.toFixed(0)}</span>
              </div>
            )
          })}
          <p className="font-data text-[10px] text-[var(--ink-4)] mt-4">
            {t.pricingHint}
          </p>
        </div>
      )}

    </main>
  )
}
