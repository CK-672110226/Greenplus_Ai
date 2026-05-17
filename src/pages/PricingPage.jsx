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

const DEFAULT_CAP_KG = 100

function buildDefaultPrices() {
  const prices = {}
  Object.keys(WASTE_ITEMS).forEach(mat => {
    prices[mat] = {
      price_per_kg: pricePerKg(mat, true),
      cap_kg: DEFAULT_CAP_KG,
    }
  })
  return prices
}

export function PricingPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)

  const [local, setLocal] = useState(() => buildDefaultPrices())
  const { shop } = useMyShop()

  useEffect(() => {
    if (!shop?.id) return

    async function loadShopPricing() {
      try {
        const { data, error } = await supabase
          .from('shop_pricing')
          .select('material_type, price_per_kg, cap_kg')
          .eq('shop_id', shop.id)

        if (!error && data && data.length > 0) {
          const merged = buildDefaultPrices()
          data.forEach(row => {
            merged[row.material_type] = {
              price_per_kg: row.price_per_kg ?? merged[row.material_type]?.price_per_kg,
              cap_kg:       row.cap_kg       ?? merged[row.material_type]?.cap_kg,
            }
          })
          setLocal(merged)
        }
      } catch {
        // Supabase not configured — fail silently
      }
    }
    loadShopPricing()
  }, [shop])

  function handleChange(mat, field, raw) {
    const value = parseFloat(raw) || 0
    setLocal(prev => ({ ...prev, [mat]: { ...prev[mat], [field]: value } }))
  }

  async function handleSave() {
    // Keep Redux pricing slice in sync using the single price_per_kg value
    const reduxPayload = {}
    Object.entries(local).forEach(([mat, vals]) => {
      reduxPayload[mat] = {
        clean: vals.price_per_kg,
        dirty: vals.price_per_kg,
      }
    })
    dispatch(bulkSet(reduxPayload))

    if (shop?.id) {
      const rows = Object.entries(local).map(([mat, vals]) => ({
        shop_id:       shop.id,
        material_type: mat,
        price_per_kg:  vals.price_per_kg ?? null,
        cap_kg:        vals.cap_kg        ?? null,
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
    dispatch(resetToDefault())
    setLocal(buildDefaultPrices())
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

      {/* Table header */}
      <div className="grid grid-cols-4 gap-2 font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest px-3">
        <span>{t.materialTypeLabel}</span>
        <span>{t.pricePerKgCol}</span>
        <span>{t.capKgCol}</span>
        <span>{t.statusLabel}</span>
      </div>

      <div className="flex flex-col gap-3">
        {Object.keys(WASTE_ITEMS).map(mat => {
          const marketRef   = pricePerKg(mat, true)
          const currentVals = local[mat] ?? { price_per_kg: marketRef, cap_kg: DEFAULT_CAP_KG }
          const price       = currentVals.price_per_kg ?? 0
          const cap         = currentVals.cap_kg ?? DEFAULT_CAP_KG
          const diff        = price - marketRef

          return (
            <Card key={mat} className="grid grid-cols-4 gap-3 items-center">
              {/* Material name */}
              <div className="flex flex-col gap-0.5">
                <span className="font-body text-[14px] text-[var(--ink)]">
                  {localName(mat, language)}
                </span>
                <span className="font-data text-[10px]" style={{ color: 'var(--ink-3)' }}>
                  {t.marketRate}: ฿{marketRef}/kg
                </span>
              </div>

              {/* Price per kg */}
              <div className="flex flex-col gap-0.5">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={price}
                  onChange={e => handleChange(mat, 'price_per_kg', e.target.value)}
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

              {/* Cap kg/day */}
              <input
                type="number"
                min="0"
                step="10"
                value={cap}
                onChange={e => handleChange(mat, 'cap_kg', e.target.value)}
                className="w-full px-2 py-1 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[13px] outline-none focus:border-[var(--green)]"
              />

              {/* Status indicator */}
              <span
                className="font-data text-[11px] uppercase tracking-wide"
                style={{ color: price > 0 ? 'var(--green)' : 'var(--ink-3)' }}
              >
                {price > 0 ? t.statusActive : t.statusOff}
              </span>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
