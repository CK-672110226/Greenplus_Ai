import { useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { pricePerKg } from '../data/wasteItems'
import { useQuery } from './useQuery'

export function useMarketPricing() {
  const fetchPricing = useCallback(async () => {
    const { data, error } = await supabase
      .from('shop_pricing')
      .select('shop_id, material_type, price_per_kg, cap_kg')
    if (error) throw error
    return data ?? []
  }, [])

  const { data: rows, loading, error } = useQuery(fetchPricing)

  const { pricing, shopPricing } = useMemo(() => {
    const rawRows = rows ?? []
    const agg = {}
    for (const row of rawRows) {
      const m = row.material_type
      if (!agg[m]) agg[m] = []
      if (row.price_per_kg != null) agg[m].push(Number(row.price_per_kg))
    }
    const pricing = {}
    for (const [m, prices] of Object.entries(agg)) {
      if (prices.length > 0) {
        pricing[m] = Math.round((prices.reduce((s, v) => s + v, 0) / prices.length) * 100) / 100
      }
    }
    return { pricing, shopPricing: rawRows }
  }, [rows])

  const marketPrice = useCallback((materialType) => {
    return pricing[materialType] ?? pricePerKg(materialType)
  }, [pricing])

  const shopPrice = useCallback((shopId, materialType) => {
    const row = shopPricing.find(r => r.shop_id === shopId && r.material_type === materialType)
    if (!row) return null
    return row.price_per_kg != null ? Number(row.price_per_kg) : null
  }, [shopPricing])

  return { pricing, shopPricing, loading, error, marketPrice, shopPrice }
}
