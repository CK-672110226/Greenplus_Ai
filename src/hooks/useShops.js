import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useQuery } from './useQuery'

export function useShops() {
  const fetchShops = useCallback(async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('*, shop_pricing(material_type, price_per_kg, cap_kg)')
      .eq('status', 'active')
    if (error) throw error
    return data.map(s => ({ ...s, distanceKm: null }))
  }, [])

  const { data, loading, error } = useQuery(fetchShops)
  return { shops: data ?? [], loading, error }
}
