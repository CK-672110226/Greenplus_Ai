// Fetch bookings for buyer's shop from Supabase
// Returns { bookings, loading, error, acceptBooking, rejectBooking, completeBooking, cancelBooking }

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { WASTE_ITEMS } from '../data/wasteItems'

function estValueForBooking(materialType, weightKg) {
  const item = WASTE_ITEMS[materialType]
  if (!item) return 0
  return Math.round(item.basePrice * (weightKg ?? 0))
}

async function patchBooking(id, update) {
  const { error } = await supabase.from('bookings').update(update).eq('id', id)
  if (error) throw error
}

export function useSupabaseBookings() {
  const session = useSelector(s => s.user.session)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!session?.user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    async function fetch() {
      try {
        const { data, error: fetchErr } = await supabase
          .from('bookings')
          .select('*, shops!inner(owner_id, name), seller:seller_id(display_name)')
          .eq('shops.owner_id', session.user.id)
          .order('created_at', { ascending: false })

        if (fetchErr) throw fetchErr
        if (data) {
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
      } catch (err) {
        setError(err?.message ?? 'โหลดการจองไม่สำเร็จ')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [session])

  function applyStatus(id, status) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const acceptBooking = useCallback(async (id) => {
    const prev = bookings.find(b => b.id === id)
    applyStatus(id, 'accepted')
    try {
      await patchBooking(id, { status: 'accepted' })
      return { ok: true }
    } catch (err) {
      if (prev) applyStatus(id, prev.status)
      return { ok: false, error: err?.message ?? 'ยืนยันไม่สำเร็จ' }
    }
  }, [bookings])

  const rejectBooking = useCallback(async (id, reason) => {
    const prev = bookings.find(b => b.id === id)
    applyStatus(id, 'rejected')
    try {
      const update = { status: 'rejected' }
      if (reason) update.rejection_reason = reason
      await patchBooking(id, update)
      return { ok: true }
    } catch (err) {
      if (prev) applyStatus(id, prev.status)
      return { ok: false, error: err?.message ?? 'ปฏิเสธไม่สำเร็จ' }
    }
  }, [bookings])

  const completeBooking = useCallback(async (id) => {
    const prev = bookings.find(b => b.id === id)
    applyStatus(id, 'completed')
    try {
      await patchBooking(id, { status: 'completed' })
      return { ok: true }
    } catch (err) {
      if (prev) applyStatus(id, prev.status)
      return { ok: false, error: err?.message ?? 'บันทึกไม่สำเร็จ' }
    }
  }, [bookings])

  const cancelBooking = useCallback(async (id) => {
    const prev = bookings.find(b => b.id === id)
    applyStatus(id, 'cancelled')
    try {
      await patchBooking(id, { status: 'cancelled' })
      return { ok: true }
    } catch (err) {
      if (prev) applyStatus(id, prev.status)
      return { ok: false, error: err?.message ?? 'ยกเลิกไม่สำเร็จ' }
    }
  }, [bookings])

  return { bookings, loading, error, acceptBooking, rejectBooking, completeBooking, cancelBooking }
}
