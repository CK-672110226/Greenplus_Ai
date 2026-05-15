import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

export function useInsertBooking() {
  const session = useSelector(s => s.user.session)

  const insertBooking = useCallback(async (shop, activeItems) => {
    if (!session?.user?.id) return false

    // Group by material_type; keep clean flag from first item of that type
    const groups = {}
    activeItems.forEach(item => {
      if (!groups[item.materialType]) {
        groups[item.materialType] = { weight_kg: 0, clean: item.clean ?? true }
      }
      groups[item.materialType].weight_kg += item.weight ?? 0
    })

    const rows = Object.entries(groups).map(([material_type, { weight_kg, clean }]) => ({
      shop_id:       shop.id,
      seller_id:     session.user.id,
      material_type,
      grade:         clean ? 'A' : 'C',
      weight_kg,
      status:        'pending',
    }))

    try {
      const { error } = await supabase.from('bookings').insert(rows)
      return !error
    } catch {
      return false
    }
  }, [session])

  return insertBooking
}
