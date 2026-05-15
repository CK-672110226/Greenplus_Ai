import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { WASTE_ITEMS, localName, pricePerKg } from '../data/wasteItems'
import { bulkSet, resetToDefault } from '../store/pricingSlice'
import { useMyShop } from '../hooks/useMyShop'
import { supabase } from '../lib/supabase'

function buildDefaultPrices() {
  const prices = {}
  Object.keys(WASTE_ITEMS).forEach(mat => {
    prices[mat] = {
      A: pricePerKg(mat, 'A'),
      B: pricePerKg(mat, 'B'),
      C: pricePerKg(mat, 'C'),
    }
  })
  return prices
}

export function PricingPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)
  const reduxPrices = useSelector(s => s.pricing.prices)

  const [local, setLocal] = useState(() => JSON.parse(JSON.stringify(reduxPrices)))
  const { shop } = useMyShop()

  useEffect(() => {
    if (!shop?.id) return

    async function loadShopPricing() {
      try {
        const { data, error } = await supabase
          .from('shop_pricing')
          .select('material_type, price_grade_a, price_grade_b, price_grade_c')
          .eq('shop_id', shop.id)

        if (!error && data && data.length > 0) {
          const merged = { ...reduxPrices }
          data.forEach(row => {
            merged[row.material_type] = {
              A: row.price_grade_a ?? merged[row.material_type]?.A,
              B: row.price_grade_b ?? merged[row.material_type]?.B,
              C: row.price_grade_c ?? merged[row.material_type]?.C,
            }
          })
          setLocal(merged)
        }
      } catch {
        // Supabase not configured — fail silently
      }
    }
    loadShopPricing()
  // reduxPrices intentionally excluded — only sync from DB once when shop loads
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop])

  function handleChange(mat, grade, raw) {
    const value = parseFloat(raw) || 0
    setLocal(prev => ({ ...prev, [mat]: { ...prev[mat], [grade]: value } }))
  }

  async function handleSave() {
    dispatch(bulkSet(local))

    if (shop?.id) {
      const rows = Object.entries(local).map(([mat, grades]) => ({
        shop_id:       shop.id,
        material_type: mat,
        price_grade_a: grades.A ?? null,
        price_grade_b: grades.B ?? null,
        price_grade_c: grades.C ?? null,
      }))
      try {
        await supabase.from('shop_pricing').upsert(rows, { onConflict: 'shop_id,material_type' })
      } catch {
        // Supabase not configured — fail silently
      }
    }

    toast.success(t.pricingSaved)
  }

  function handleReset() {
    const defaults = buildDefaultPrices()
    dispatch(resetToDefault())
    setLocal(defaults)
    toast.success(t.pricingReset)
  }

  return (
    <main className="px-4 py-8 flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.pricingTitle}</h1>
          <p className="font-body text-[13px] text-[var(--ink-3)] m-0">{t.pricingHint}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleReset}>{t.resetToMarket}</Button>
          <Button variant="primary"   onClick={handleSave}>{t.saveChanges}</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest px-3">
        <span>{t.materialTypeLabel}</span>
        <span>{t.gradeA}</span>
        <span>{t.gradeB}</span>
        <span>{t.gradeC}</span>
      </div>

      <div className="flex flex-col gap-3">
        {Object.keys(WASTE_ITEMS).map(mat => {
          const marketA = pricePerKg(mat, 'A')
          const marketB = pricePerKg(mat, 'B')
          const marketC = pricePerKg(mat, 'C')
          const currentPrices = local[mat] ?? { A: marketA, B: marketB, C: marketC }

          return (
            <Card key={mat} className="grid grid-cols-4 gap-3 items-center">
              <div className="flex flex-col gap-0.5">
                <span className="font-body text-[14px] text-[var(--ink)]">
                  {localName(mat, language)}
                </span>
                <span className="font-data text-[10px]" style={{ color: 'var(--ink-3)' }}>
                  {t.marketRate}: ฿{marketA} / ฿{marketB} / ฿{marketC}
                </span>
              </div>

              {[['A', marketA], ['B', marketB], ['C', marketC]].map(([grade, market]) => {
                const val = currentPrices[grade] ?? 0
                const diff = val - market
                return (
                  <div key={grade} className="flex flex-col gap-0.5">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={val}
                      onChange={e => handleChange(mat, grade, e.target.value)}
                      className="w-full px-2 py-1 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[13px] outline-none focus:border-[var(--green)]"
                    />
                    {diff > 0 && (
                      <span className="font-data text-[10px]" style={{ color: 'var(--green)' }}>
                        {t.priceAbove}
                      </span>
                    )}
                    {diff < 0 && (
                      <span className="font-data text-[10px]" style={{ color: 'var(--orange)' }}>
                        {t.priceBelow}
                      </span>
                    )}
                  </div>
                )
              })}
            </Card>
          )
        })}
      </div>
    </main>
  )
}
