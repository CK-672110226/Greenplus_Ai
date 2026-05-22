import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { haversineKm } from '../utils/haversine'
import { useT } from './useT'
import {
  setActiveBooking,
  setNearbyOrders,
  setRiderLocation,
} from '../store/logisticsSlice'

const NEARBY_RADIUS_KM = 5
const APPROACHING_KM   = 0.5

export function useRealtimeLogistics() {
  const dispatch       = useDispatch()
  const t              = useT()
  const tRef           = useRef(t)
  const session        = useSelector(s => s.user.session)
  const profile        = useSelector(s => s.user.profile)
  const activeBooking  = useSelector(s => s.logistics.activeBooking)
  const nearbyOrders   = useSelector(s => s.logistics.nearbyOrders)
  const riderLocation  = useSelector(s => s.logistics.riderLocation)
  const isOnline       = useSelector(s => s.logistics.isOnline)

  useEffect(() => { tRef.current = t }, [t])

  // Stable refs so callbacks always see current values
  const riderLocRef    = useRef(riderLocation)
  const pickupLocRef   = useRef({ lat: activeBooking?.pickup_lat, lng: activeBooking?.pickup_lng })
  const prevStatusRef  = useRef(activeBooking?.status ?? null)
  const bookingIdRef   = useRef(activeBooking?.id ?? null)
  const nearAlertedRef = useRef(false)

  useEffect(() => { riderLocRef.current = riderLocation }, [riderLocation])
  useEffect(() => {
    pickupLocRef.current = { lat: activeBooking?.pickup_lat, lng: activeBooking?.pickup_lng }
  }, [activeBooking?.pickup_lat, activeBooking?.pickup_lng])

  // When booking ID changes reset notification state so we don't fire stale toasts
  useEffect(() => {
    if (activeBooking?.id !== bookingIdRef.current) {
      bookingIdRef.current   = activeBooking?.id ?? null
      prevStatusRef.current  = activeBooking?.status ?? null
      nearAlertedRef.current = false
    }
  }, [activeBooking?.id, activeBooking?.status])

  // ── SELLER: subscribe to own active booking ──────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return
    if (profile?.role !== 'user') return
    if (!activeBooking?.id) return
    if (!['searching', 'accepted'].includes(activeBooking?.status)) return

    const channel = supabase
      .channel(`seller-booking-${activeBooking.id}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'bookings',
        filter: `id=eq.${activeBooking.id}`,
      }, (payload) => {
        const newStatus  = payload.new.status
        const prevStatus = prevStatusRef.current
        prevStatusRef.current = newStatus

        if (prevStatus === 'searching' && newStatus === 'accepted') {
          toast.success(tRef.current.riderFound)
        }
        if (prevStatus === 'accepted' && newStatus === 'arrived') {
          toast.success(tRef.current.riderArrived)
          nearAlertedRef.current = false
        }

        dispatch(setActiveBooking(payload.new))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session, profile, activeBooking?.id, activeBooking?.status, dispatch])

  // ── SELLER: when accepted, subscribe to driver's position ─────────────────
  useEffect(() => {
    if (!session?.user?.id) return
    if (profile?.role !== 'user') return
    if (activeBooking?.status !== 'accepted') return
    if (!activeBooking?.assigned_driver_id) return

    const channel = supabase
      .channel(`driver-pos-${activeBooking.assigned_driver_id}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'user_profiles',
        filter: `id=eq.${activeBooking.assigned_driver_id}`,
      }, (payload) => {
        const { current_lat, current_lng } = payload.new
        if (current_lat == null || current_lng == null) return

        // Approaching threshold toast (fires once per booking)
        if (!nearAlertedRef.current) {
          const pickup = pickupLocRef.current
          if (pickup.lat != null && pickup.lng != null) {
            const dist = haversineKm(current_lat, current_lng, pickup.lat, pickup.lng)
            if (dist <= APPROACHING_KM) {
              toast(tRef.current.riderApproaching)
              nearAlertedRef.current = true
            }
          }
        }

        dispatch(setRiderLocation({ lat: current_lat, lng: current_lng }))
      })
      .subscribe()

    // Fetch current position immediately
    supabase
      .from('user_profiles')
      .select('current_lat, current_lng')
      .eq('id', activeBooking.assigned_driver_id)
      .single()
      .then(({ data }) => {
        if (data?.current_lat != null && data?.current_lng != null) {
          dispatch(setRiderLocation({ lat: data.current_lat, lng: data.current_lng }))
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [session, profile, activeBooking?.status, activeBooking?.assigned_driver_id, dispatch])

  // ── RIDER: load initial nearby orders ────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return
    if (profile?.role !== 'buyer') return
    if (!isOnline) {
      dispatch(setNearbyOrders([]))
      return
    }
    if (riderLocation == null) return

    supabase
      .from('bookings')
      .select('*')
      .eq('status', 'searching')
      .then(({ data }) => {
        if (!data) return
        const { lat, lng } = riderLocation
        const nearby = data.filter(b =>
          b.pickup_lat != null &&
          b.pickup_lng != null &&
          haversineKm(lat, lng, b.pickup_lat, b.pickup_lng) <= NEARBY_RADIUS_KM
        )
        dispatch(setNearbyOrders(nearby))
      })
  }, [session, profile, isOnline, riderLocation, dispatch])

  // ── RIDER: subscribe to new / updated searching orders ───────────────────
  useEffect(() => {
    if (!session?.user?.id) return
    if (profile?.role !== 'buyer') return
    if (!isOnline) return

    const channel = supabase
      .channel(`rider-orders-${session.user.id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'bookings',
        filter: 'status=eq.searching',
      }, (payload) => {
        const b = payload.new
        if (b.status !== 'searching') return
        const loc = riderLocRef.current
        if (!loc || b.pickup_lat == null || b.pickup_lng == null) return
        if (haversineKm(loc.lat, loc.lng, b.pickup_lat, b.pickup_lng) <= NEARBY_RADIUS_KM) {
          dispatch(setNearbyOrders(prev => [b, ...prev]))
        }
      })
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'bookings',
      }, (payload) => {
        const b = payload.new
        if (b.status !== 'searching') {
          dispatch(setNearbyOrders(prev => prev.filter(o => o.id !== b.id)))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session, profile, isOnline, dispatch])

  return { activeBooking, nearbyOrders, riderLocation }
}
