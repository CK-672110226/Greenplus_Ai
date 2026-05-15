import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

export function useInsertBooking() {
  const session = useSelector(s => s.user.session)

  const insertBooking = useCallback(async (shop, activeItems, estValue) => {
    if (!session?.user?.id) return false

    const materialTotals = {}
    activeItems.forEach(item => {
      materialTotals[item.materialType] = (materialTotals[item.materialType] ?? 0) + (item.weight ?? 0)
    })

    const rows = Object.entries(materialTotals).map(([material_type, weight_kg]) => ({
      shop_id:       shop.id,
      seller_id:     session.user.id,
      material_type,
      weight_kg,
      est_value:     estValue,
      status:        'pending',
    }))

    try {
      const { error } = await supabase.from('bookings').insert(rows)
      if (error) return false
      return true
    } catch {
      return false
    }
  }, [session])

  return insertBooking
}
