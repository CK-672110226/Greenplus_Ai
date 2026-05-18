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
import { useShopPricingActions } from '../hooks/useShopPricingActions'

const DEFAULT_CAP_KG = 100

function buildDefaultLocal() {
  const local = {}
  Object.keys(WASTE_ITEMS).forEach(mat => {
    local[mat] = { price_per_kg: pricePerKg(mat), cap_kg: DEFAULT_CAP_KG }
  })
  return local
}

export function PricingPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)

  const [local, setLocal]     = useState(() => buildDefaultLocal())
  const [isDirty, setIsDirty] = useState(false)
  const { shop }              = useMyShop()
  const pricingActions        = useShopPricingActions()

  useEffect(() => {
    if (!shop?.id) return

    async function loadShopPricing() {
      try {
        const { data, error } = await supabase
          .from('shop_pricing')
          .select('material_type, price_per_kg, cap_kg')
          .eq('shop_id', shop.id)

        if (!error && data && data.length > 0) {
          const merged = buildDefaultLocal()
          data.forEach(row => {
            if (merged[row.material_type]) {
              merged[row.material_type] = {
                price_per_kg: row.price_per_kg ?? merged[row.material_type].price_per_kg,
                cap_kg:       row.cap_kg       ?? merged[row.material_type].cap_kg,
              }
            }
          })
          setLocal(merged)
          setIsDirty(false)
        }
      } catch {
        // Supabase not configured — fail silently
      }
    }
    loadShopPricing()
  }, [shop])

  function handlePriceChange(mat, raw) {
    const value = parseFloat(raw) || 0
    setLocal(prev => ({ ...prev, [mat]: { ...prev[mat], price_per_kg: value } }))
    setIsDirty(true)
  }

  function handleCapChange(mat, raw) {
    const value = parseFloat(raw) || 0
    setLocal(prev => ({ ...prev, [mat]: { ...prev[mat], cap_kg: value } }))
    setIsDirty(true)
  }

  async function handleSave() {
    const reduxPayload = {}
    Object.entries(local).forEach(([mat, vals]) => {
      reduxPayload[mat] = vals.price_per_kg
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
        await pricingActions.savePricing(shop.id, rows)
        setIsDirty(false)
        toast.success(t.pricingSaved)
      } catch {
        toast.error(language === 'th' ? 'บันทึกไม่สำเร็จ — กรุณาลองใหม่' : 'Failed to save — please try again')
      }
    } else {
      setIsDirty(false)
      toast.success(t.pricingSaved)
    }
  }

  function handleReset() {
    dispatch(resetToDefault())
    setLocal(buildDefaultLocal())
    setIsDirty(false)
    toast.success(t.pricingReset)
  }

  return (
    <main className="px-4 py-8 flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-[0.15em]">Material Pricing</span>
          <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.pricingTitle}</h1>
          <p className="font-body text-[13px] text-[var(--ink-3)] m-0">{t.pricingHint}</p>
          {isDirty && (
            <span className="font-data text-[10px] text-[var(--orange)] uppercase tracking-widest">
              ● Unsaved changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleReset}>{t.resetToMarket}</Button>
          <Button variant="primary"   onClick={handleSave}>
            {isDirty ? '● ' : ''}{t.saveChanges}
          </Button>
        </div>
      </div>

      {/* Price per material section */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest whitespace-nowrap">
            Price Per kg
          </span>
          <div className="flex-1 h-[1px] bg-[var(--ink-4)]" />
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-3 gap-2 font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest px-3 mb-1">
          <span>{t.materialTypeLabel}</span>
          <span>฿ / kg</span>
          <span>{t.statusLabel}</span>
        </div>

        <div className="flex flex-col gap-3">
          {Object.keys(WASTE_ITEMS).map(mat => {
            const vals  = local[mat] ?? { price_per_kg: 0, cap_kg: DEFAULT_CAP_KG }
            const price = vals.price_per_kg ?? 0

            return (
              <Card key={mat} className="grid grid-cols-3 gap-3 items-center">
                <span className="font-body text-[14px] text-[var(--ink)]">
                  {localName(mat, language)}
                </span>

                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={price}
                    onChange={e => handlePriceChange(mat, e.target.value)}
                    className="w-full px-2 py-1 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[13px] outline-none focus:border-[var(--green)]"
                    aria-label={`${localName(mat, language)} price per kg`}
                  />
                  <span className="font-data text-[10px] text-[var(--ink-3)] whitespace-nowrap">฿/kg</span>
                </div>

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
      </div>

      {/* Daily Capacity section */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest whitespace-nowrap">
            Daily Capacity (kg)
          </span>
          <div className="flex-1 h-[1px] bg-[var(--ink-4)]" />
        </div>

        <div className="grid grid-cols-3 gap-2 font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest px-3 mb-1">
          <span>{t.materialTypeLabel}</span>
          <span>{t.capKgCol}</span>
          <span>{t.statusLabel}</span>
        </div>

        <div className="flex flex-col gap-3">
          {Object.keys(WASTE_ITEMS).map(mat => {
            const vals  = local[mat] ?? { price_per_kg: 0, cap_kg: DEFAULT_CAP_KG }
            const cap   = vals.cap_kg    ?? DEFAULT_CAP_KG
            const price = vals.price_per_kg ?? 0

            return (
              <Card key={mat} className="grid grid-cols-3 gap-3 items-center">
                <span className="font-body text-[14px] text-[var(--ink)]">
                  {localName(mat, language)}
                </span>

                <input
                  type="number"
                  min="0"
                  step="10"
                  value={cap}
                  onChange={e => handleCapChange(mat, e.target.value)}
                  className="w-full px-2 py-1 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[13px] outline-none focus:border-[var(--green)]"
                />

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
      </div>
    </main>
  )
}
