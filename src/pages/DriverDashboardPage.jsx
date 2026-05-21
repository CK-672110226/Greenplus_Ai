import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Button } from '../components/Button'
import { supabase } from '../lib/supabase'
import { useGPS } from '../hooks/useGPS'
import { haversineKm } from '../utils/haversine'
import { setIsOnline, setRiderLocation } from '../store/logisticsSlice'
import { useRealtimeLogistics } from '../hooks/useRealtimeLogistics'
import { useDriverAssignment } from '../hooks/useDriverAssignment'

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-1.5 font-data text-[10px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] cursor-pointer whitespace-nowrap transition-colors',
        active ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/* ── Customer pickup order card ─────────────────────────── */
function PickupCard({ order, riderLat, riderLng, onAccept }) {
  const dist = (riderLat != null && order.pickup_lat != null)
    ? haversineKm(riderLat, riderLng, order.pickup_lat, order.pickup_lng).toFixed(1)
    : null
  return (
    <div className="flex flex-col gap-2 p-4 border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] bg-[var(--paper)]">
      <div className="flex items-center justify-between">
        <span className="font-body text-[15px] text-[var(--ink)]">{order.user_name ?? 'User'}</span>
        {dist && <span className="font-data text-[11px] text-[var(--ink-3)]">{dist} km</span>}
      </div>
      <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
        {order.material_type} · {(order.weight_kg ?? 0).toFixed(1)} kg
      </span>
      <div className="flex items-center gap-2">
        <span className="font-data text-[10px] text-[var(--orange)] uppercase tracking-widest border-[1.5px] border-[var(--orange)] px-2 py-0.5">
          searching
        </span>
        {order.scheduled_for && (
          <span className="font-data text-[10px] text-[var(--ink-3)]">
            {new Date(order.scheduled_for).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' })}
          </span>
        )}
      </div>
      <Button variant="primary" fullWidth onClick={() => onAccept(order)}>
        Accept →
      </Button>
    </div>
  )
}

/* ── Inter-shop transfer job card ─────────────────────────── */
function TransferCard({ job, riderLat, riderLng, onAccept }) {
  const dist = (riderLat != null && job.from_lat != null)
    ? haversineKm(riderLat, riderLng, job.from_lat, job.from_lng).toFixed(1)
    : null
  return (
    <div className="flex flex-col gap-2 p-4 border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] bg-[var(--paper)]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">From</span>
          <span className="font-body text-[14px] text-[var(--ink)]">{job.from_shop_name ?? '—'}</span>
        </div>
        <span className="font-data text-[14px] text-[var(--ink-3)]">→</span>
        <div className="flex flex-col gap-0.5 items-end">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">To</span>
          <span className="font-body text-[14px] text-[var(--ink)]">{job.to_shop_name ?? '—'}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-data text-[11px] text-[var(--ink-2)] uppercase tracking-widest">
          {job.material_type} · {(job.weight_kg ?? 0).toFixed(1)} kg
        </span>
        {job.offered_price && (
          <span className="font-data text-[13px] text-[var(--green-ink)]">฿{job.offered_price.toFixed(0)}</span>
        )}
        {dist && <span className="font-data text-[11px] text-[var(--ink-3)] ml-auto">{dist} km away</span>}
      </div>
      <Button variant="primary" fullWidth onClick={() => onAccept(job)}>
        Accept Transfer →
      </Button>
    </div>
  )
}

/* ── Active order panel ──────────────────────────────────── */
function ActiveOrderPanel({ order, onArrived, onComplete, onCancel, t }) {
  const [actualWeight, setActualWeight] = useState(order.weight_kg ?? 0)
  const arrived = order._arrived

  return (
    <div className="flex flex-col gap-3 p-4 border-[1.5px] border-[var(--green)] bg-[var(--green-soft)]">
      <span className="font-data text-[10px] text-[var(--green-ink)] uppercase tracking-widest">{arrived ? t.driverArrived : t.driverEnRoute}</span>
      <div className="flex flex-col gap-0.5">
        <span className="font-body text-[15px] text-[var(--ink)]">{order.user_name ?? 'User'}</span>
        <span className="font-data text-[11px] text-[var(--ink-3)]">{order.material_type} · {(order.weight_kg ?? 0).toFixed(1)} kg est.</span>
      </div>
      {arrived && (
        <div className="flex flex-col gap-2">
          <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.actualWeight}</label>
          <input
            type="number" min="0" step="0.1"
            value={actualWeight}
            onChange={e => setActualWeight(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[16px] outline-none focus:border-[var(--green)]"
          />
          <Button variant="primary" fullWidth onClick={() => onComplete(actualWeight)}>
            {t.completeAndPay} →
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        {!arrived && (
          <Button variant="primary" fullWidth onClick={onArrived}>
            {t.iArrived}
          </Button>
        )}
        <Button variant="secondary" fullWidth onClick={onCancel}>
          {t.cancelPickup}
        </Button>
      </div>
    </div>
  )
}

export function DriverDashboardPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const session  = useSelector(s => s.user.session)
  const isOnline = useSelector(s => s.logistics.isOnline)
  const { nearbyOrders } = useRealtimeLogistics()
  const { respondToAssignment, myAssignments } = useDriverAssignment()

  const [tab,          setTab]          = useState('assignments')
  const [activeOrder,  setActiveOrder]  = useState(null)
  const [transferJobs, setTransferJobs] = useState([])
  const gpsIntervalRef = useRef(null)
  const { lat: gpsLat, lng: gpsLng, request: requestGPS } = useGPS()

  // GPS polling when online
  useEffect(() => {
    if (!isOnline || !session?.user?.id) return
    requestGPS()
    gpsIntervalRef.current = setInterval(() => {
      navigator.geolocation?.getCurrentPosition(pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        dispatch(setRiderLocation({ lat, lng }))
        supabase.from('user_profiles').update({ current_lat: lat, current_lng: lng }).eq('id', session.user.id)
      })
    }, 30000)
    return () => clearInterval(gpsIntervalRef.current)
  }, [isOnline, session?.user?.id, dispatch, requestGPS])

  useEffect(() => {
    if (gpsLat != null && gpsLng != null) dispatch(setRiderLocation({ lat: gpsLat, lng: gpsLng }))
  }, [gpsLat, gpsLng, dispatch])

  // Load transfer jobs
  useEffect(() => {
    if (!isOnline) return
    async function loadJobs() {
      const { data } = await supabase
        .from('transfer_jobs')
        .select(`
          *,
          from_shop:from_shop_id(name, lat, lng),
          to_shop:to_shop_id(name)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
      if (data) {
        setTransferJobs(data.map(j => ({
          ...j,
          from_shop_name: j.from_shop?.name,
          to_shop_name:   j.to_shop?.name,
          from_lat:       j.from_shop?.lat,
          from_lng:       j.from_shop?.lng,
        })))
      }
    }
    loadJobs()
  }, [isOnline])

  async function toggleOnline() {
    if (!session?.user?.id) return
    const next = !isOnline
    dispatch(setIsOnline(next))
    const { error } = await supabase.from('user_profiles').update({ is_online: next }).eq('id', session.user.id)
    if (error) { dispatch(setIsOnline(!next)); toast.error('Could not update status'); return }
    toast(next ? t.driverOnline : t.driverOffline)
  }

  async function handleAcceptPickup(order) {
    if (!session?.user?.id) return
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'accepted',
        assigned_driver_id: session.user.id,
        driver_assignment_status: 'accepted',
      })
      .eq('id', order.id)
    if (error) { toast.error('Failed to accept'); return }
    setActiveOrder({ ...order, _arrived: false })
    toast.success('Order accepted')
  }

  async function handleArrived() {
    if (!activeOrder) return
    await supabase.from('bookings').update({ status: 'arrived', arrived_at: new Date().toISOString() }).eq('id', activeOrder.id)
    setActiveOrder(o => ({ ...o, _arrived: true }))
  }

  async function handleComplete(actualWeight) {
    if (!activeOrder) return
    const estPrice = 12  // fallback price per kg
    const actualValue = Math.round(actualWeight * estPrice)
    await supabase.from('bookings').update({
      status: 'completed', completed_at: new Date().toISOString(),
      actual_weight: actualWeight, actual_value: actualValue,
    }).eq('id', activeOrder.id)
    toast.success(`Completed — ฿${actualValue}`)
    setActiveOrder(null)
  }

  async function handleCancelOrder() {
    if (!activeOrder) return
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', activeOrder.id)
    setActiveOrder(null)
    toast('Order cancelled')
  }

  async function handleAcceptTransfer(job) {
    if (!session?.user?.id) return
    const { error } = await supabase
      .from('transfer_jobs')
      .update({ status: 'accepted', driver_id: session.user.id })
      .eq('id', job.id)
    if (error) { toast.error('Failed to accept transfer'); return }
    setTransferJobs(prev => prev.filter(j => j.id !== job.id))
    toast.success('Transfer job accepted')
  }

  return (
    <main className="w-full px-4 py-6 flex flex-col gap-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-[0.15em]">{t.driverModeBreadcrumb}</span>
          <h1 className="font-brand text-[26px] text-[var(--ink)] m-0">{t.driverModeTitle}</h1>
        </div>
        <button
          onClick={toggleOnline}
          className={[
            'flex items-center gap-2 px-4 py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] cursor-pointer transition-colors whitespace-nowrap shrink-0',
            isOnline
              ? 'border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-ink)]'
              : 'border-[var(--ink-4)] bg-[var(--paper)] text-[var(--ink-3)]',
          ].join(' ')}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[var(--green-ink)]' : 'bg-[var(--ink-4)]'}`} />
          {isOnline ? t.driverOnlineLabel : t.driverOfflineLabel}
        </button>
      </div>

      {/* Offline message */}
      {!isOnline && (
        <div className="border-[1.5px] border-dashed border-[var(--ink-4)] p-6 text-center">
          <p className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest m-0">{t.toggleOnlineToSee}</p>
        </div>
      )}

      {isOnline && (
        <>
          {/* Active order panel (shown above tabs when active) */}
          {activeOrder && (
            <ActiveOrderPanel
              order={activeOrder}
              onArrived={handleArrived}
              onComplete={handleComplete}
              onCancel={handleCancelOrder}
              t={t}
            />
          )}

          {/* Tabs */}
          <div className="flex gap-0 border-b-[1.5px] border-[var(--ink-4)] overflow-x-auto scrollbar-hide">
            <TabBtn active={tab === 'assignments'} onClick={() => setTab('assignments')}>
              {t.tabMyAssignments} {myAssignments.length > 0 && `(${myAssignments.length})`}
            </TabBtn>
            <TabBtn active={tab === 'pickups'} onClick={() => setTab('pickups')}>
              {t.tabCustomerPickups} {nearbyOrders.length > 0 && `(${nearbyOrders.length})`}
            </TabBtn>
            <TabBtn active={tab === 'transfers'} onClick={() => setTab('transfers')}>
              {t.tabInterShop} {transferJobs.length > 0 && `(${transferJobs.length})`}
            </TabBtn>
          </div>

          {/* My Assignments tab */}
          {tab === 'assignments' && (
            <div className="flex flex-col gap-3">
              {/* Today's jobs — pinned at top */}
              {(() => {
                const todayStr = new Date().toDateString()
                const todayJobs = myAssignments.filter(a =>
                  a.scheduled_for && new Date(a.scheduled_for).toDateString() === todayStr
                )
                if (todayJobs.length === 0) return null
                return (
                  <div className="flex flex-col gap-2 p-3 bg-[var(--green-soft)] border-[1.5px] border-[var(--green-ink)]">
                    <span className="font-data text-[10px] uppercase tracking-widest text-[var(--green-ink)]">{t.todayAssignments}</span>
                    {todayJobs.map(a => (
                      <div key={a.id} className="flex items-center justify-between gap-2">
                        <span className="font-body text-[13px] text-[var(--ink)] truncate">{a.shops?.name ?? '—'}</span>
                        <span className="font-data text-[13px] text-[var(--ink)] shrink-0">
                          {new Date(a.scheduled_for).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' })}
                        </span>
                        <span className={[
                          'font-data text-[9px] uppercase tracking-widest px-1.5 py-0.5 border-[1px] shrink-0',
                          a.driver_assignment_status === 'invited'
                            ? 'border-[var(--orange)] text-[var(--orange)]'
                            : 'border-[var(--green-ink)] text-[var(--green-ink)]',
                        ].join(' ')}>
                          {a.driver_assignment_status === 'invited' ? t.assignmentInvited : t.assignmentAccepted}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {myAssignments.length === 0 && (
                <div className="border-[1.5px] border-dashed border-[var(--ink-4)] p-6 text-center">
                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.noMyAssignments}</span>
                </div>
              )}
              {myAssignments.map(a => {
                const shopName = a.shops?.name ?? '—'
                const isInvited = a.driver_assignment_status === 'invited'
                return (
                  <div key={a.id} className="flex flex-col gap-2 p-4 border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] bg-[var(--paper)]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-body text-[15px] text-[var(--ink)]">{shopName}</span>
                        <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
                          {a.material_type} · {(a.weight_kg ?? 0).toFixed(1)} kg
                        </span>
                      </div>
                      {a.scheduled_for && (
                        <span className="font-data text-[10px] text-[var(--ink-3)] text-right shrink-0">
                          {new Date(a.scheduled_for).toLocaleString('th-TH', {
                            weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok',
                          })}
                        </span>
                      )}
                    </div>
                    {isInvited && (
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            const { ok, error } = await respondToAssignment(a.id, true)
                            if (ok) toast.success(t.assignmentAccepted)
                            else toast.error(error ?? t.errorGeneric)
                          }}
                          className="flex-1 font-data text-[10px] uppercase tracking-widest py-2.5 border-[1.5px] border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-ink)] cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          {t.acceptAssignment} ✓
                        </button>
                        <button
                          onClick={async () => {
                            const { ok, error } = await respondToAssignment(a.id, false)
                            if (ok) toast(t.declineAssignment)
                            else toast.error(error ?? t.errorGeneric)
                          }}
                          className="px-4 font-data text-[10px] uppercase tracking-widest py-2.5 border-[1.5px] border-[var(--ink-3)] text-[var(--ink-3)] bg-[var(--paper)] cursor-pointer hover:bg-[var(--paper-2)] transition-colors"
                        >
                          {t.declineAssignment}
                        </button>
                      </div>
                    )}
                    {!isInvited && (
                      <span className="font-data text-[10px] text-[var(--green-ink)] uppercase tracking-widest">
                        ✓ {t.assignmentAccepted}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Customer pickups tab */}
          {tab === 'pickups' && !activeOrder && (
            <div className="flex flex-col gap-3">
              {nearbyOrders.length === 0 && (
                <div className="border-[1.5px] border-dashed border-[var(--ink-4)] p-4 text-center">
                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.noNearbyPickups}</span>
                </div>
              )}
              {nearbyOrders.map(order => (
                <PickupCard
                  key={order.id}
                  order={order}
                  riderLat={gpsLat}
                  riderLng={gpsLng}
                  onAccept={handleAcceptPickup}
                />
              ))}
            </div>
          )}

          {/* Inter-shop transfers tab */}
          {tab === 'transfers' && (
            <div className="flex flex-col gap-3">
              {transferJobs.length === 0 && (
                <div className="border-[1.5px] border-dashed border-[var(--ink-4)] p-4 text-center">
                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.noTransferJobs}</span>
                </div>
              )}
              {transferJobs.map(job => (
                <TransferCard
                  key={job.id}
                  job={job}
                  riderLat={gpsLat}
                  riderLng={gpsLng}
                  onAccept={handleAcceptTransfer}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
