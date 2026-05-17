import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { pricePerKg } from '../data/wasteItems'

export function useMarketPricing() {
  const [pricing, setPricing]       = useState({})
  const [shopPricing, setShopPricing] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('shop_pricing')
          .select('shop_id, material_type, price_per_kg, cap_kg')
        if (error || !data) { setLoading(false); return }

        setShopPricing(data)

        const agg = {}
        for (const row of data) {
          const m = row.material_type
          if (!agg[m]) agg[m] = []
          if (row.price_per_kg != null) agg[m].push(Number(row.price_per_kg))
        }
        const result = {}
        for (const [m, prices] of Object.entries(agg)) {
          if (prices.length > 0) {
            result[m] = Math.round((prices.reduce((s, v) => s + v, 0) / prices.length) * 100) / 100
          }
        }
        setPricing(result)
      } catch {
        // Supabase not configured
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function marketPrice(materialType) {
    return pricing[materialType] ?? pricePerKg(materialType)
  }

  function shopPrice(shopId, materialType) {
    const row = shopPricing.find(r => r.shop_id === shopId && r.material_type === materialType)
    if (!row) return null
    return row.price_per_kg != null ? Number(row.price_per_kg) : null
  }

  return { pricing, shopPricing, loading, marketPrice, shopPrice }
}
