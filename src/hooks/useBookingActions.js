import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { updateStatus as setStatus } from '../store/bookingSlice'

export function useBookingActions() {
  const dispatch = useDispatch()
  const bookings = useSelector(s => s.bookings.bookings)

  const updateStatus = useCallback(async (id, status) => {
    const prev = bookings.find(b => b.id === id)
    dispatch(setStatus({ id, status }))
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
      if (error) throw error
      return { ok: true }
    } catch (err) {
      if (prev) dispatch(setStatus({ id, status: prev.status }))
      return { ok: false, error: err?.message ?? 'อัปเดตสถานะไม่สำเร็จ' }
    }
  }, [dispatch, bookings])

  return { updateStatus }
}
