import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

export function useInsertBooking() {
  const session = useSelector(s => s.user.session)

  const insertBooking = useCallback(async (shop, activeItems, pickupOptions = {}) => {
    if (!session?.user?.id) return { ok: false, error: 'ยังไม่ได้เข้าสู่ระบบ' }

    const groups = {}
    activeItems.forEach(item => {
      if (!groups[item.materialType]) {
        groups[item.materialType] = { weight_kg: 0, clean: item.clean ?? true }
      }
      groups[item.materialType].weight_kg += item.weight ?? 0
    })

    const rows = Object.entries(groups).map(([material_type, { weight_kg, clean }]) => ({
      shop_id:       shop?.id ?? null,
      seller_id:     session.user.id,
      material_type,
      grade:         clean ? 'A' : 'C',
      weight_kg,
      status:        'pending',
      pickup_mode:   pickupOptions.mode ?? 'dropOff',
      pickup_lat:    pickupOptions.lat ?? null,
      pickup_lng:    pickupOptions.lng ?? null,
    }))

    try {
      const { error } = await supabase.from('bookings').insert(rows)
      if (error) throw error
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err?.message ?? 'สร้างการจองไม่สำเร็จ' }
    }
  }, [session])

  return insertBooking
}
