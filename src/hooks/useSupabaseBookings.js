// Fetch bookings for buyer's shop from Supabase
// Returns { bookings, loading, acceptBooking, rejectBooking }

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { WASTE_ITEMS } from '../data/wasteItems'

function estValueForBooking(materialType, weightKg) {
  const item = WASTE_ITEMS[materialType]
  if (!item) return 0
  return Math.round(item.basePrice * (weightKg ?? 0))
}

export function useSupabaseBookings() {
  const session = useSelector(s => s.user.session)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!session?.user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    async function fetch() {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, shops!inner(owner_id, name), seller:seller_id(display_name)')
          .eq('shops.owner_id', session.user.id)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setBookings(data.map(b => ({
            id:         b.id,
            shopName:   b.shops?.name ?? '',
            seller:     b.seller?.display_name ?? b.seller_id,
            materials:  [b.material_type],
            totalKg:    b.weight_kg,
            estValue:   estValueForBooking(b.material_type, b.weight_kg),
            status:     b.status,
            createdAt:  b.created_at,
            scheduledAt: b.scheduled_at,
          })))
        }
      } catch {
        // Supabase not configured — fail silently
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [session])

  const acceptBooking = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'accepted' })
        .eq('id', id)
      if (!error) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'accepted' } : b))
      }
    } catch {
      // fail silently
    }
  }, [])

  const rejectBooking = useCallback(async (id, reason) => {
    try {
      const update = { status: 'rejected' }
      if (reason) update.rejection_reason = reason
      const { error } = await supabase
        .from('bookings')
        .update(update)
        .eq('id', id)
      if (!error) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' } : b))
      }
    } catch {
      // fail silently
    }
  }, [])

  const completeBooking = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', id)
      if (!error) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b))
      }
    } catch {
      // fail silently
    }
  }, [])

  const cancelBooking = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)
      if (!error) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
      }
    } catch {
      // fail silently
    }
  }, [])

  return { bookings, loading, acceptBooking, rejectBooking, completeBooking, cancelBooking }
}
