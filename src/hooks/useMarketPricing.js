import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { pricePerKg } from '../data/wasteItems'

export function useMarketPricing() {
  const [pricing, setPricing] = useState({})
  const [shopPricing, setShopPricing] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('shop_pricing')
          .select('shop_id, material_type, price_grade_a, price_grade_b, price_grade_c')
        if (error || !data) { setLoading(false); return }

        setShopPricing(data)

        // Average price per material + grade across all shops
        const agg = {}
        for (const row of data) {
          const m = row.material_type
          if (!agg[m]) agg[m] = { A: [], B: [], C: [] }
          if (row.price_grade_a != null) agg[m].A.push(Number(row.price_grade_a))
          if (row.price_grade_b != null) agg[m].B.push(Number(row.price_grade_b))
          if (row.price_grade_c != null) agg[m].C.push(Number(row.price_grade_c))
        }
        const result = {}
        for (const [m, grades] of Object.entries(agg)) {
          result[m] = {}
          for (const g of ['A', 'B', 'C']) {
            if (grades[g].length > 0) {
              result[m][g] = Math.round((grades[g].reduce((s, v) => s + v, 0) / grades[g].length) * 100) / 100
            }
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

  function marketPrice(materialType, grade) {
    return pricing[materialType]?.[grade] ?? pricePerKg(materialType, grade)
  }

  function shopPrice(shopId, materialType, grade) {
    const row = shopPricing.find(r => r.shop_id === shopId && r.material_type === materialType)
    if (!row) return null
    const key = grade === 'A' ? 'price_grade_a' : grade === 'B' ? 'price_grade_b' : 'price_grade_c'
    return row[key] != null ? Number(row[key]) : null
  }

  return { pricing, shopPricing, loading, marketPrice, shopPrice }
}
