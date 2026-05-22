import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Button } from '../components/Button'
import { WASTE_ITEMS, localName, pricePerKg } from '../data/wasteItems'
import { bulkSet, resetToDefault } from '../store/pricingSlice'
import { useMyShop } from '../hooks/useMyShop'
import { supabase } from '../lib/supabase'
import { useShopPricingActions } from '../hooks/useShopPricingActions'
import styles from './PricingPage.module.css'

const DEFAULT_CAP_KG = 100

function buildDefault() {
  const out = {}
  Object.keys(WASTE_ITEMS).forEach(mat => {
    out[mat] = { price_per_kg: pricePerKg(mat), cap_kg: DEFAULT_CAP_KG, active: true }
  })
  return out
}

export function PricingPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)

  const [local, setLocal]     = useState(() => buildDefault())
  const [isDirty, setIsDirty] = useState(false)
  const { shop }              = useMyShop()
  const pricingActions        = useShopPricingActions()

  useEffect(() => {
    if (!shop?.id) return

    async function loadShopPricing() {
      try {
        const { data, error } = await supabase
          .from('shop_pricing')
          .select('material_type, price_per_kg, cap_kg, active')
          .eq('shop_id', shop.id)

        if (!error && data && data.length > 0) {
          const merged = buildDefault()
          data.forEach(row => {
            if (merged[row.material_type]) {
              merged[row.material_type] = {
                price_per_kg: row.price_per_kg ?? merged[row.material_type].price_per_kg,
                cap_kg:       row.cap_kg       ?? merged[row.material_type].cap_kg,
                active:       row.active       ?? true,
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

  function handleToggle(mat) {
    setLocal(prev => ({
      ...prev,
      [mat]: { ...prev[mat], active: !prev[mat].active },
    }))
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
        active:        vals.active        ?? true,
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
    setLocal(buildDefault())
    setIsDirty(false)
    toast.success(t.pricingReset)
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.eyebrow}>Material Pricing</span>
          <h1 className={styles.title}>{t.pricingTitle}</h1>
          <p className={styles.hint}>{t.pricingHint}</p>
          {isDirty && <span className={styles.dirty}>● Unsaved changes</span>}
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={handleReset}>{t.resetToMarket}</Button>
          <Button variant="primary"   onClick={handleSave}>
            {isDirty ? '● ' : ''}{t.saveChanges}
          </Button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>{t.materialTypeLabel}</th>
              <th className={styles.th}>{t.pricePerKgCol}</th>
              <th className={styles.th}>{t.capKgCol}</th>
              <th className={styles.th}>{t.statusLabel}</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(WASTE_ITEMS).map(mat => {
              const vals   = local[mat] ?? { price_per_kg: 0, cap_kg: DEFAULT_CAP_KG, active: true }
              const active = vals.active ?? true

              return (
                <tr key={mat} className={`${styles.tr} ${active ? '' : styles.trOff}`}>
                  <td className={styles.td}>
                    <span className={styles.matName}>{localName(mat, language)}</span>
                  </td>

                  <td className={styles.td}>
                    <input
                      type="number"
                      min="0"
                      max="9999"
                      step="0.5"
                      value={vals.price_per_kg ?? 0}
                      onChange={e => handlePriceChange(mat, e.target.value)}
                      className={styles.numInput}
                      disabled={!active}
                      aria-label={`${localName(mat, language)} price per kg`}
                    />
                    <span className={styles.unit}>฿/kg</span>
                  </td>

                  <td className={styles.td}>
                    <input
                      type="number"
                      min="0"
                      max="50000"
                      step="10"
                      value={vals.cap_kg ?? DEFAULT_CAP_KG}
                      onChange={e => handleCapChange(mat, e.target.value)}
                      className={styles.numInput}
                      disabled={!active}
                      aria-label={`${localName(mat, language)} daily cap kg`}
                    />
                    <span className={styles.unit}>kg</span>
                  </td>

                  <td className={`${styles.td} ${styles.toggleCell}`}>
                    <button
                      className={`${styles.toggle} ${active ? styles.toggleOn : styles.toggleOff}`}
                      onClick={() => handleToggle(mat)}
                    >
                      <span className={styles.dot} />
                      {active ? t.statusActive : t.statusOff}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
