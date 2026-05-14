// Fetch active shops from Supabase public.shops
// Returns { shops, loading }
// shops array has shape: { id, name, area, lat, lng, accepts (text[]), distanceKm (null if unknown) }
// distanceKm is null since GPS distance is computed per-user in BasketPage

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useShops() {
  const [shops, setShops]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('status', 'active')
        if (!error && data) {
          setShops(data.map(s => ({ ...s, distanceKm: null })))
        }
      } catch {
        // Supabase not configured — return empty
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { shops, loading }
}
