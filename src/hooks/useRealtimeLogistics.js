import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { haversineKm } from '../utils/haversine'
import {
  setActiveBooking,
  setNearbyOrders,
  setRiderLocation,
} from '../store/logisticsSlice'

const NEARBY_RADIUS_KM = 5

export function useRealtimeLogistics() {
  const dispatch       = useDispatch()
  const session        = useSelector(s => s.user.session)
  const profile        = useSelector(s => s.user.profile)
  const activeBooking  = useSelector(s => s.logistics.activeBooking)
  const nearbyOrders   = useSelector(s => s.logistics.nearbyOrders)
  const riderLocation  = useSelector(s => s.logistics.riderLocation)
  const isOnline       = useSelector(s => s.logistics.isOnline)

  // Stable ref so rider lat/lng is always current inside Supabase callbacks
  const riderLocRef = useRef(riderLocation)
  useEffect(() => { riderLocRef.current = riderLocation }, [riderLocation])

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
        dispatch(setActiveBooking(payload.new))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session, profile, activeBooking?.id, activeBooking?.status, dispatch])

  // ── SELLER: when accepted, subscribe to rider's position ─────────────────
  useEffect(() => {
    if (!session?.user?.id) return
    if (profile?.role !== 'user') return
    if (activeBooking?.status !== 'accepted') return
    if (!activeBooking?.buyer_id) return

    const channel = supabase
      .channel(`rider-pos-${activeBooking.buyer_id}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'user_profiles',
        filter: `id=eq.${activeBooking.buyer_id}`,
      }, (payload) => {
        const { current_lat, current_lng } = payload.new
        if (current_lat != null && current_lng != null) {
          dispatch(setRiderLocation({ lat: current_lat, lng: current_lng }))
        }
      })
      .subscribe()

    // Fetch current position immediately
    supabase
      .from('user_profiles')
      .select('current_lat, current_lng')
      .eq('id', activeBooking.buyer_id)
      .single()
      .then(({ data }) => {
        if (data?.current_lat != null && data?.current_lng != null) {
          dispatch(setRiderLocation({ lat: data.current_lat, lng: data.current_lng }))
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [session, profile, activeBooking?.status, activeBooking?.buyer_id, dispatch])

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
        // Remove orders that are no longer searching
        if (b.status !== 'searching') {
          dispatch(setNearbyOrders(prev => prev.filter(o => o.id !== b.id)))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session, profile, isOnline, dispatch])

  return { activeBooking, nearbyOrders, riderLocation }
}
