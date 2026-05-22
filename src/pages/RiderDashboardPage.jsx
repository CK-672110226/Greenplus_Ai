import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import { useGPS } from '../hooks/useGPS'
import { useRealtimeLogistics } from '../hooks/useRealtimeLogistics'
import { setIsOnline, setRiderLocation } from '../store/logisticsSlice'
import { haversineKm } from '../utils/haversine'

function pinIcon(fill) {
  return new L.DivIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5 0 23.1 12.5 41 12.5 41S25 23.1 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${fill}" stroke="#333" stroke-width="1"/><circle cx="12.5" cy="12.5" r="4.5" fill="rgba(255,255,255,0.75)"/></svg>`,
    iconSize:   [25, 41],
    iconAnchor: [12, 41],
  })
}

const riderMiniIcon  = pinIcon('#3b82f6')
const pickupMiniIcon = pinIcon('#22c55e')

const PRICE_PER_KG = { PET: 12, HDPE: 8, Paper: 5, Glass: 3, Metal: 18, Mixed: 4 }

function fmtAgo(isoStr) {
  if (!isoStr) return ''
  const diff = Math.round((Date.now() - new Date(isoStr)) / 60000)
  if (diff < 1) return 'just now'
  return `${diff}m ago`
}


function OrderCard({ order, onAccept }) {
  const riderLat = useSelector(s => s.logistics.riderLocation?.lat)
  const riderLng = useSelector(s => s.logistics.riderLocation?.lng)

  let distLabel = ''
  if (riderLat != null && riderLng != null && order.pickup_lat != null) {
    const d = haversineKm(riderLat, riderLng, order.pickup_lat, order.pickup_lng)
    distLabel = `${d.toFixed(1)} km`
  }

  const estValue = PRICE_PER_KG[order.material_type] != null
    ? Math.round((PRICE_PER_KG[order.material_type] ?? 5) * (order.weight_kg ?? 0))
    : null

  return (
    <div className="border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] p-4 bg-[var(--paper)] mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-brand text-[16px]">{order.user_name ?? 'User'}</span>
        {distLabel && (
          <span className="font-data text-[11px] text-[var(--ink-3)]">{distLabel}</span>
        )}
      </div>
      <div className="font-body text-[13px] text-[var(--ink-2)] mb-1">
        {order.material_type} · {order.weight_kg ?? '?'} kg
      </div>
      {estValue != null && (
        <div className="font-data text-[12px] text-[var(--green-ink)] mb-1">
          Est. ฿{estValue}
        </div>
      )}
      <div className="font-data text-[10px] text-[var(--ink-3)] mb-3 uppercase tracking-wider">
        searching {fmtAgo(order.created_at)}
      </div>
      <button
        className="w-full py-2 bg-[var(--ink)] text-[var(--paper)] font-data text-[12px] uppercase tracking-wider cursor-pointer border-none"
        onClick={() => onAccept(order)}
      >
        Accept Order
      </button>
    </div>
  )
}

function WeightEditor({ order, onComplete }) {
  const [weights, setWeights] = useState({
    [order.material_type]: Number(order.weight_kg ?? 0),
  })
  const totalValue = Math.round(
    Object.entries(weights).reduce((s, [mat, kg]) => s + (PRICE_PER_KG[mat] ?? 5) * kg, 0)
  )

  function adjust(mat, delta) {
    setWeights(w => ({ ...w, [mat]: Math.max(0, parseFloat(((w[mat] ?? 0) + delta).toFixed(1))) }))
  }

  const totalKg = Object.values(weights).reduce((s, v) => s + v, 0)

  return (
    <div className="border-[1.5px] border-[var(--green-ink)] shadow-[2px_2px_0_var(--green-ink)] p-4 bg-[var(--paper)] mt-4">
      <div className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-3)] mb-3">
        Weight Verification
      </div>
      {Object.entries(weights).map(([mat, kg]) => (
        <div key={mat} className="flex items-center gap-3 mb-3">
          <span className="font-body text-[13px] w-16">{mat}</span>
          <button
            className="w-7 h-7 border-[1.5px] border-[var(--ink)] font-data text-[16px] cursor-pointer bg-[var(--paper-2)] flex items-center justify-center"
            onClick={() => adjust(mat, -0.5)}
          >-</button>
          <span className="font-data text-[14px] w-14 text-center">{kg.toFixed(1)} kg</span>
          <button
            className="w-7 h-7 border-[1.5px] border-[var(--ink)] font-data text-[16px] cursor-pointer bg-[var(--paper-2)] flex items-center justify-center"
            onClick={() => adjust(mat, 0.5)}
          >+</button>
        </div>
      ))}
      <div className="border-t-[1px] border-[var(--ink-4)] pt-3 mb-4">
        <span className="font-body text-[13px] text-[var(--ink-2)]">Total value: </span>
        <span className="font-data text-[14px] text-[var(--green-ink)]">฿{totalValue}</span>
      </div>
      <button
        className="w-full py-2 bg-[var(--green-ink)] text-[var(--paper)] font-data text-[12px] uppercase tracking-wider cursor-pointer border-none"
        onClick={() => onComplete({ weights, totalKg, totalValue })}
      >
        Complete &amp; Pay
      </button>
    </div>
  )
}

export function RiderDashboardPage() {
  const dispatch  = useDispatch()
  const session   = useSelector(s => s.user.session)
  const profile   = useSelector(s => s.user.profile)
  const isOnline  = useSelector(s => s.logistics.isOnline)
  const { nearbyOrders } = useRealtimeLogistics()

  const [activeOrder, setActiveOrder] = useState(null)
  const gpsIntervalRef = useRef(null)
  const { lat: gpsLat, lng: gpsLng, request: requestGPS } = useGPS()

  // Sync GPS position to store and Supabase when online
  useEffect(() => {
    if (!isOnline || !session?.user?.id) return

    requestGPS()

    gpsIntervalRef.current = setInterval(() => {
      navigator.geolocation?.getCurrentPosition(pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        dispatch(setRiderLocation({ lat, lng }))
        supabase
          .from('user_profiles')
          .update({ current_lat: lat, current_lng: lng })
          .eq('id', session.user.id)
      })
    }, 30000)

    return () => { clearInterval(gpsIntervalRef.current) }
  }, [isOnline, session, dispatch, requestGPS])

  // Push GPS into store when useGPS resolves
  useEffect(() => {
    if (gpsLat != null && gpsLng != null) {
      dispatch(setRiderLocation({ lat: gpsLat, lng: gpsLng }))
    }
  }, [gpsLat, gpsLng, dispatch])

  async function toggleOnline() {
    if (!session?.user?.id) return
    const next = !isOnline
    dispatch(setIsOnline(next))          // optimistic
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_online: next })
      .eq('id', session.user.id)
    if (error) {
      dispatch(setIsOnline(!next))       // rollback
      toast.error('Could not update status')
      return
    }
    if (next) {
      toast.success('You are now online')
    } else {
      toast('You are offline')
    }
  }

  async function handleAccept(order) {
    if (!profile?.id) return
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'accepted', assigned_driver_id: profile.id, driver_assignment_status: 'accepted' })
      .eq('id', order.id)
    if (error) { toast.error('Failed to accept order'); return }
    setActiveOrder({ ...order, status: 'accepted' })
    toast.success('Order accepted')
  }

  async function handleArrived() {
    if (!activeOrder) return
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'arrived', arrived_at: new Date().toISOString() })
      .eq('id', activeOrder.id)
    if (error) { toast.error('Failed to mark arrived'); return }
    setActiveOrder(o => ({ ...o, status: 'arrived' }))
  }

  async function handleCancel() {
    if (!activeOrder) return
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', activeOrder.id)
    if (error) { toast.error('Failed to cancel'); return }
    setActiveOrder(null)
    toast('Order cancelled')
  }

  async function handleComplete({ totalKg, totalValue }) {
    if (!activeOrder) return
    const { error } = await supabase
      .from('bookings')
      .update({
        status:       'completed',
        actual_weight: totalKg,
        actual_value:  totalValue,
        completed_at:  new Date().toISOString(),
      })
      .eq('id', activeOrder.id)
    if (error) { toast.error('Failed to complete'); return }
    setActiveOrder(null)
    toast.success(`Completed — ฿${totalValue} earned`)
  }

  const showAvailable = isOnline && !activeOrder
  const showActive    = !!activeOrder && activeOrder.status === 'accepted'
  const showArrived   = !!activeOrder && activeOrder.status === 'arrived'

  return (
    <div className="max-w-lg mx-auto p-6">
      {/* Header + Online toggle */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-brand text-[28px]">Rider Mode</h1>
        <button
          className={[
            'flex items-center gap-2 px-4 py-2 font-data text-[12px] uppercase tracking-wider cursor-pointer border-[1.5px]',
            isOnline
              ? 'bg-[var(--green-soft)] border-[var(--green-ink)] text-[var(--green-ink)]'
              : 'bg-[var(--paper-2)] border-[var(--ink)] text-[var(--ink-2)]',
          ].join(' ')}
          onClick={toggleOnline}
        >
          <span className={[
            'inline-block w-2 h-2 rounded-full',
            isOnline ? 'bg-[var(--green-ink)]' : 'bg-[var(--ink-3)]',
          ].join(' ')} />
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {/* Offline message */}
      {!isOnline && (
        <div className="border-[1.5px] border-dashed border-[var(--ink-3)] p-6 text-center mb-4">
          <p className="font-body text-[14px] text-[var(--ink-3)]">Toggle online to see nearby pickups</p>
        </div>
      )}

      {/* Available pickups */}
      {showAvailable && (
        <section className="mb-6">
          <div className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-3)] mb-3">
            Available Pickups ({nearbyOrders.length} nearby)
          </div>
          {nearbyOrders.length === 0 && (
            <div className="border-[1.5px] border-dashed border-[var(--ink-4)] p-4 text-center">
              <span className="font-body text-[13px] text-[var(--ink-3)]">No orders within 5 km</span>
            </div>
          )}
          {nearbyOrders.map(order => (
            <OrderCard key={order.id} order={order} onAccept={handleAccept} />
          ))}
        </section>
      )}

      {/* Active order (en route) */}
      {showActive && (
        <section className="mb-6">
          <div className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-3)] mb-3">
            Active Order
          </div>
          <div className="border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] p-4 bg-[var(--paper)]">
            <div className="font-body text-[13px] text-[var(--ink-2)] mb-1">
              En route to: <span className="font-brand text-[15px] text-[var(--ink)]">{activeOrder.user_name ?? 'User'}</span>
            </div>
            <div className="font-body text-[13px] text-[var(--ink-2)] mb-4">
              Items: {activeOrder.material_type} {activeOrder.weight_kg}kg
            </div>

            {activeOrder?.pickup_lat && gpsLat != null && (
              <div className="border-[1.5px] border-[var(--ink)] overflow-hidden mb-4" style={{ height: 200, borderRadius: 4 }}>
                <MapContainer
                  center={[activeOrder.pickup_lat, activeOrder.pickup_lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  dragging={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[activeOrder.pickup_lat, activeOrder.pickup_lng]} icon={pickupMiniIcon} />
                  <Marker position={[gpsLat, gpsLng]} icon={riderMiniIcon} />
                </MapContainer>
              </div>
            )}

            <div className="flex gap-3">
              <button
                className="flex-1 py-2 bg-[var(--ink)] text-[var(--paper)] font-data text-[12px] uppercase tracking-wider cursor-pointer border-none"
                onClick={handleArrived}
              >
                Arrived
              </button>
              <button
                className="flex-1 py-2 border-[1.5px] border-[var(--ink)] text-[var(--ink)] font-data text-[12px] uppercase tracking-wider cursor-pointer bg-[var(--paper)]"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Weight verification (arrived) */}
      {showArrived && (
        <section>
          <div className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-3)] mb-2">
            Weight Verification
          </div>
          <WeightEditor order={activeOrder} onComplete={handleComplete} />
        </section>
      )}
    </div>
  )
}
