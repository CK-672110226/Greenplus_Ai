import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Button } from '../components/Button'
import { useSelector, useDispatch } from 'react-redux'
import { localName, WASTE_ITEMS, pricePerKg } from '../data/wasteItems'
import { addPost, setPosts } from '../store/marketplaceSlice'
import { useSupabaseMarketplace } from '../hooks/useSupabaseMarketplace'
import { useShops } from '../hooks/useShops'
import { useMarketPricing } from '../hooks/useMarketPricing'

const MATERIAL_KEYS = Object.keys(WASTE_ITEMS)

const CATEGORIES = {
  all:     MATERIAL_KEYS,
  plastic: ['pet_bottle_clear', 'mixed_plastic'],
  paper:   ['cardboard', 'newspaper'],
  metal:   ['aluminum_can', 'copper'],
  glass:   ['glass', 'cooking_oil'],
}

/* ── Shop card (replaces mock RequestCard) ────────────────────── */
function ShopCard({ shop, language, t, marketPrice }) {
  const materials = (shop.accepts ?? []).slice(0, 3)
  const bestPrice = materials.length > 0 ? marketPrice(materials[0], true) : null

  return (
    <div className="flex flex-col gap-2 border-[1.5px] border-[var(--ink)] p-4 bg-[var(--paper-2)] shadow-[2px_2px_0_var(--ink)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-body text-[14px] text-[var(--ink)] leading-tight">{shop.name}</span>
          {shop.area && (
            <span className="font-data text-[10px] text-[var(--ink-3)]">{shop.area}</span>
          )}
        </div>
        {bestPrice != null && (
          <span className="font-data text-[18px] text-[var(--green-ink)] shrink-0">
            ฿ {bestPrice.toFixed(1)}/kg
          </span>
        )}
      </div>

      {materials.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-widest">{t.shopAccepts}:</span>
          {materials.map(m => (
            <span key={m} className="font-data text-[10px] text-[var(--ink-2)] border-[1px] border-[var(--ink-4)] px-1.5 py-0.5">
              {localName(m, language)}
            </span>
          ))}
        </div>
      )}

      <a
        href="/map"
        className="mt-1 w-full py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] bg-transparent cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors shadow-[2px_2px_0_var(--ink)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] text-center block no-underline text-[var(--ink)]"
      >
        {t.directions ?? 'View on Map'} →
      </a>
    </div>
  )
}

/* ── Post Ad Form ─────────────────────────────────────────────── */
function PostAdForm({ onClose, onAdd, marketPrice }) {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)

  const [form, setForm] = useState({ materialType: MATERIAL_KEYS[0], clean: true, qty: '', pricePerKg: '', contact: '', shop: '', lat: null, lng: null })
  function set(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.qty || !form.pricePerKg || !form.shop) { toast.error(t.requiredFields); return }
    const payload = { ...form, qty: Number(form.qty), pricePerKg: Number(form.pricePerKg), distanceKm: 0 }
    if (onAdd) await onAdd(payload)
    else dispatch(addPost(payload))
    toast.success(t.postSuccess)
    onClose()
  }

  const suggested = (marketPrice(form.materialType, form.clean) ?? pricePerKg(form.materialType, form.clean)).toFixed(1)

  return (
    <div className="border-[1.5px] border-[var(--green)] bg-[var(--paper-2)] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-brand text-[18px] text-[var(--ink)]">{t.postAd}</span>
        <button onClick={onClose} className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest bg-transparent border-none cursor-pointer hover:text-[var(--ink)]">{t.cancelLabel}</button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.materialTypeLabel}</label>
          <select value={form.materialType} onChange={e => set('materialType', e.target.value)} className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]">
            {MATERIAL_KEYS.map(k => <option key={k} value={k}>{localName(k, language)}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">สภาพ</label>
          <div className="flex gap-2">
            {[{ label: 'สะอาด', val: true }, { label: 'ไม่สะอาด', val: false }].map(({ label, val }) => (
              <button key={label} type="button" onClick={() => set('clean', val)}
                className={`flex-1 py-2 font-data text-[12px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] transition-colors ${form.clean === val ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-transparent text-[var(--ink)]'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.weightKg}</label>
            <input type="number" min="0.1" step="0.1" required value={form.qty} onChange={e => set('qty', e.target.value)} placeholder="kg" className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.pricePerKgLabel} <span className="text-[var(--green)] normal-case">(~฿{suggested})</span></label>
            <input type="number" min="0" step="0.1" required value={form.pricePerKg} onChange={e => set('pricePerKg', e.target.value)} placeholder={`฿ ${suggested}`} className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.shopName}</label>
          <input type="text" required value={form.shop} onChange={e => set('shop', e.target.value)} className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.contactInfo}</label>
          <input type="text" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="LINE / Tel" className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">ที่ตั้ง (สำหรับแผนที่)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.lat != null ? `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}` : ''}
              readOnly
              placeholder="กด 'ใช้ตำแหน่งปัจจุบัน'"
              className="flex-1 px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper-2)] font-data text-[11px] outline-none text-[var(--ink-3)]"
            />
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) return
                navigator.geolocation.getCurrentPosition(
                  pos => { set('lat', pos.coords.latitude); set('lng', pos.coords.longitude) },
                  () => {}
                )
              }}
              className="px-3 py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] bg-transparent hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors whitespace-nowrap"
            >
              📍 ตำแหน่ง
            </button>
          </div>
        </div>
        <Button type="submit" variant="primary" fullWidth>{t.postAd}</Button>
      </form>
    </div>
  )
}

/* ── MarketplacePage ──────────────────────────────────────────── */
export function MarketplacePage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)
  const basket   = useSelector(s => s.waste?.basket ?? [])

  const { posts, addPost: supabaseAddPost } = useSupabaseMarketplace()
  const { shops } = useShops()
  const { shopPricing, loading: pricingLoading, marketPrice } = useMarketPricing()

  useEffect(() => {
    if (posts.length > 0) dispatch(setPosts(posts))
  }, [posts, dispatch])

  const [catFilter, setCatFilter] = useState('all')
  const [isPosting, setIsPosting] = useState(false)

  const basketMaterials = new Set(basket.filter(i => !i.skipped).map(i => i.materialType))
  const basketCount     = basket.filter(i => !i.skipped).length

  const visibleMaterials = catFilter === 'basket'
    ? MATERIAL_KEYS.filter(k => basketMaterials.has(k))
    : CATEGORIES[catFilter] ?? MATERIAL_KEYS

  // Shops that accept at least one material in the current category
  const categoryMaterials = new Set(CATEGORIES[catFilter] ?? MATERIAL_KEYS)
  const visibleShops = shops.filter(s =>
    (s.accepts ?? []).some(m => categoryMaterials.has(m))
  ).slice(0, 6)

  const sourceCount = new Set(shopPricing.map(p => p.shop_id)).size

  const CAT_TABS = [
    { key: 'all',     label: 'All materials' },
    { key: 'plastic', label: 'Plastic' },
    { key: 'paper',   label: 'Paper' },
    { key: 'metal',   label: 'Metal' },
    { key: 'glass',   label: 'Glass' },
    { key: 'basket',  label: `★ My basket (${basketCount})` },
  ]

  return (
    <div className="flex flex-col min-h-full">

      {/* Breadcrumb */}
      <div className="px-6 lg:px-10 pt-5 pb-0 border-b-[0px]">
        <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">
          Home / Marketplace / Pricing Table
        </span>
      </div>

      {/* 2-column body */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* ══ LEFT: Pricing Table ══════════════════════════════ */}
        <div className="flex flex-col flex-1 min-w-0 lg:border-r-[1.5px] lg:border-[var(--ink)]">

          {/* Table header */}
          <div className="px-6 lg:px-10 pt-6 pb-4 border-b-[1.5px] border-[var(--ink)]">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
              <div>
                <h1 className="font-brand text-[28px] lg:text-[36px] text-[var(--ink)] m-0 leading-tight">
                  Today&apos;s market —
                </h1>
                <h1 className="font-brand text-[28px] lg:text-[36px] text-[var(--ink)] m-0 leading-tight">
                  Chiang Mai
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button className="font-data text-[11px] border-[1.5px] border-[var(--ink-4)] px-3 py-1.5 bg-transparent cursor-default text-[var(--ink-3)]">฿ THB ▾</button>
                <button className="font-data text-[11px] border-[1.5px] border-[var(--ink-4)] px-3 py-1.5 bg-transparent cursor-default text-[var(--ink-3)]">/ kg ▾</button>
              </div>
            </div>

            {/* Category filter tabs */}
            <div className="flex gap-2 flex-wrap mt-4">
              {CAT_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setCatFilter(tab.key)}
                  className={[
                    'px-3 py-1.5 font-data text-[11px] uppercase tracking-widest border-[1.5px] transition-colors',
                    catFilter === tab.key
                      ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
                      : 'bg-transparent text-[var(--ink-3)] border-[var(--ink-4)] hover:border-[var(--ink)] hover:text-[var(--ink)]',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            {/* Table head */}
            <div className="grid grid-cols-[1fr_auto] px-6 lg:px-10 py-2.5 border-b-[1.5px] border-[var(--ink)] bg-[var(--paper-2)]">
              <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">Material</span>
              <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em] text-right">
                {sourceCount > 0 ? `Avg · ${sourceCount} shops` : 'Price (฿/kg)'}
              </span>
            </div>

            {pricingLoading ? (
              <div className="flex flex-col gap-2 py-4">
                <div className="h-12 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
                <div className="h-12 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
                <div className="h-12 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
                <div className="h-12 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
              </div>
            ) : visibleMaterials.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <span className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest">
                  No items in basket
                </span>
              </div>
            ) : (
              visibleMaterials.map(key => {
                const price  = marketPrice(key, true)
                const inBask = basketMaterials.has(key)
                return (
                  <div
                    key={key}
                    className={`grid grid-cols-[1fr_auto] items-center px-6 lg:px-10 py-4 border-b-[1px] border-[var(--ink-4)] hover:bg-[var(--paper-2)] transition-colors ${inBask ? 'bg-[var(--green-soft)]' : ''}`}
                  >
                    {/* Material name + badge */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-body text-[15px] text-[var(--ink)] truncate">
                        {language === 'th' ? WASTE_ITEMS[key]?.nameTh : WASTE_ITEMS[key]?.nameEn}
                      </span>
                      {inBask && (
                        <span className="font-data text-[9px] text-[var(--green-ink)] border-[1px] border-[var(--green)] px-1.5 py-0.5 uppercase tracking-wide shrink-0">
                          in basket
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-data text-[22px] text-[var(--ink)] leading-none">
                        ฿ {price != null ? price.toFixed(2) : '—'}
                      </span>
                      <span className="font-data text-[10px] text-[var(--ink-4)]">฿/kg</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Table footer */}
          <div className="flex items-center justify-between px-6 lg:px-10 py-3 border-t-[1.5px] border-[var(--ink)] bg-[var(--paper-2)]">
            <span className="font-data text-[10px] text-[var(--ink-4)]">
              {sourceCount > 0
                ? `source: ${sourceCount} active ${sourceCount === 1 ? 'shop' : 'shops'}`
                : 'no shop pricing data yet'}
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const header = 'material,shop,price_per_kg,grade\n'
                  const rows   = shopPricing.map(p =>
                    `${p.material_type},${p.shop_name ?? p.shop_id},${p.price_per_kg},${p.grade ?? ''}`
                  ).join('\n')
                  const blob = new Blob([header + rows], { type: 'text/csv' })
                  const url  = URL.createObjectURL(blob)
                  const a    = document.createElement('a')
                  a.href     = url
                  a.download = `greenplus-prices-${new Date().toISOString().slice(0, 10)}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="font-data text-[10px] text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer transition-colors uppercase tracking-wide"
              >
                ↓ export CSV
              </button>
              <button onClick={() => toast.info('Price alerts coming soon')} className="font-data text-[10px] text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer transition-colors uppercase tracking-wide">
                set price alert
              </button>
            </div>
          </div>
        </div>

        {/* ══ RIGHT: Active Shops ═══════════════════════════════ */}
        <div className="flex flex-col w-full lg:w-[320px] shrink-0 border-t-[1.5px] lg:border-t-0 border-[var(--ink)]">

          {/* Right header */}
          <div className="px-5 py-5 border-b-[1.5px] border-[var(--ink)]">
            <h2 className="font-brand text-[20px] text-[var(--ink)] m-0 leading-tight">
              Active shops —
            </h2>
            <h2 className="font-brand text-[20px] text-[var(--ink)] m-0 leading-tight">
              Chiang Mai
            </h2>
          </div>

          {/* Shop cards */}
          <div className="flex flex-col gap-3 px-5 py-5 flex-1 overflow-y-auto">
            {visibleShops.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest">
                  {t.noShopsNear ?? 'No shops found'}
                </span>
              </div>
            ) : (
              visibleShops.map(shop => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  language={language}
                  t={t}
                  marketPrice={marketPrice}
                />
              ))
            )}
          </div>

          {/* Post Ad section */}
          <div className="px-5 pb-5 border-t-[1.5px] border-[var(--ink)] pt-4">
            {isPosting ? (
              <PostAdForm
                onClose={() => setIsPosting(false)}
                onAdd={supabaseAddPost}
                marketPrice={marketPrice}
              />
            ) : (
              <button
                onClick={() => setIsPosting(true)}
                className="w-full py-3 font-data text-[12px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] bg-transparent cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors shadow-[3px_3px_0_var(--ink)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
              >
                + {t.postAd}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
