import { supabase } from '../lib/supabase'

export function useBookingActions() {
  async function updateStatus(id, status) {
    try {
      await supabase.from('bookings').update({ status }).eq('id', id)
    } catch { /* silent — local Redux state already updated by caller */ }
  }

  return { updateStatus }
}
