import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { useSelector, useDispatch } from 'react-redux'
import { localName, WASTE_ITEMS, pricePerKg } from '../data/wasteItems'
import { addPost, setPosts } from '../store/marketplaceSlice'
import { useSupabaseMarketplace } from '../hooks/useSupabaseMarketplace'

/* ── Static data ─────────────────────────────────────────────── */
const MATERIAL_KEYS = Object.keys(WASTE_ITEMS)

const CATEGORIES = {
  all:     MATERIAL_KEYS,
  plastic: ['pet_bottle_clear', 'mixed_plastic'],
  paper:   ['cardboard', 'newspaper'],
  metal:   ['aluminum_can', 'copper'],
  glass:   ['glass', 'cooking_oil'],
}

// Mock 7-day price history (Grade A price)
const TRENDS = {
  pet_bottle_clear: { vals: [8.0, 8.5, 8.2, 8.8, 9.0, 9.2, 9.6], dir: 'up'   },
  aluminum_can:     { vals: [52,  54,  56,  58,  60,  62,  62  ], dir: 'up'   },
  cardboard:        { vals: [3.6, 3.6, 3.7, 3.6, 3.7, 3.7, 3.7], dir: 'flat' },
  newspaper:        { vals: [2.8, 2.6, 2.5, 2.5, 2.4, 2.4, 2.4], dir: 'down' },
  mixed_plastic:    { vals: [4.0, 4.5, 4.5, 4.8, 5.0, 5.0, 5.0], dir: 'up'   },
  copper:           { vals: [170, 180, 190, 195, 198, 200, 200 ], dir: 'up'   },
  glass:            { vals: [1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.2], dir: 'flat' },
  cooking_oil:      { vals: [11,  11,  12,  12,  12,  12,  12  ], dir: 'flat' },
}

const BUYING_REQUESTS = [
  { id: 1, name: 'Lung Somchai Recycling', distanceKm: 1.2, minKg: 20,   window: '14:00–18:00', material: 'pet_bottle_clear', grade: 'A', price: 26,   mapX: 62,  mapY: 48  },
  { id: 2, name: 'JJ Market · stall 12',   distanceKm: 2.4, minKg: null, window: null,           material: 'aluminum_can',     grade: 'A', price: 64,   mapX: 130, mapY: 78  },
  { id: 3, name: 'Nimman Café Co-op',       distanceKm: 3.0, minKg: 15,   window: null,           material: 'cardboard',        grade: 'B', price: 4.6,  mapX: 88,  mapY: 110 },
  { id: 4, name: 'Doi Saket Scrap',         distanceKm: 8.7, minKg: null, window: 'pickup',       material: 'mixed_plastic',    grade: 'B', price: 10,   mapX: 148, mapY: 130 },
]

/* ── Sparkline SVG ───────────────────────────────────────────── */
function Sparkline({ vals, dir }) {
  const W = 48, H = 18
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 2) - 1
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const color = dir === 'up' ? 'var(--green)' : dir === 'down' ? 'var(--orange)' : 'var(--ink-4)'
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Mini map SVG ────────────────────────────────────────────── */
function MiniMap() {
  const ME = { x: 96, y: 84 }
  const labels = { 1: 'L. Somchai', 2: 'JJ #12', 3: 'Nimman', 4: 'Doi Saket' }
  return (
    <div className="border-[1.5px] border-[var(--ink)] bg-[var(--paper-2)] relative overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b-[1px] border-[var(--ink-4)]">
        <span className="font-data text-[9px] text-[var(--ink-3)] uppercase tracking-[0.15em]">Smart Map · 1:8k</span>
      </div>
      <svg width="100%" height="160" viewBox="0 0 192 160" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[40, 80, 120, 160].map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="160" stroke="var(--ink-4)" strokeWidth="0.5" strokeDasharray="3 4" />
        ))}
        {[40, 80, 120].map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="192" y2={y} stroke="var(--ink-4)" strokeWidth="0.5" strokeDasharray="3 4" />
        ))}

        {/* Distance ring */}
        <circle cx={ME.x} cy={ME.y} r="52" fill="none" stroke="var(--green)" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.4" />

        {/* Shop dots */}
        {BUYING_REQUESTS.map(r => (
          <g key={r.id}>
            <rect x={r.mapX - 3} y={r.mapY - 3} width="6" height="6" fill="var(--ink)" />
            <text x={r.mapX + 5} y={r.mapY + 3} fontSize="7" fill="var(--ink-3)" fontFamily="monospace">{labels[r.id]}</text>
          </g>
        ))}

        {/* Me dot */}
        <circle cx={ME.x} cy={ME.y} r="5" fill="var(--green)" stroke="var(--ink)" strokeWidth="1.5" />
        <text x={ME.x + 7} y={ME.y + 3} fontSize="7" fill="var(--green-ink)" fontFamily="monospace" fontWeight="bold">me</text>
      </svg>
    </div>
  )
}

/* ── Buying request card ─────────────────────────────────────── */
function RequestCard({ req, language }) {
  return (
    <div className="flex flex-col gap-2 border-[1.5px] border-[var(--ink)] p-4 bg-[var(--paper-2)] shadow-[2px_2px_0_var(--ink)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-body text-[14px] text-[var(--ink)] leading-tight">{req.name}</span>
          <span className="font-data text-[10px] text-[var(--ink-3)]">
            {req.distanceKm} km
            {req.minKg ? ` · ≥ ${req.minKg} kg` : ' · any'}
            {req.window && ` · ${req.window}`}
          </span>
        </div>
        <span className="font-brand text-[18px] text-[var(--green-ink)] shrink-0">฿ {req.price}/kg</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-widest">wants</span>
        <span className="font-body text-[13px] text-[var(--ink)]">
          {language === 'th'
            ? WASTE_ITEMS[req.material]?.nameTh
            : WASTE_ITEMS[req.material]?.nameEn}
        </span>
        <GradeTag grade={req.grade} />
      </div>

      <button
        onClick={() => toast.info(`Contact ${req.name}`)}
        className="mt-1 w-full py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] bg-transparent cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors shadow-[2px_2px_0_var(--ink)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
      >
        Deal →
      </button>
    </div>
  )
}

/* ── Post Ad Form ────────────────────────────────────────────── */
function PostAdForm({ onClose, onAdd }) {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)

  const [form, setForm] = useState({ materialType: MATERIAL_KEYS[0], grade: 'A', qty: '', pricePerKg: '', contact: '', shop: '' })
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

  const suggested = pricePerKg(form.materialType, form.grade).toFixed(1)

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
          <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.gradeLabel}</label>
          <div className="flex gap-2">
            {['A', 'B', 'C'].map(g => (
              <button key={g} type="button" onClick={() => set('grade', g)} className={`flex-1 py-2 font-data text-[12px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] transition-colors ${form.grade === g ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-transparent text-[var(--ink)]'}`}>{g}</button>
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
        <Button type="submit" variant="primary" fullWidth>{t.postAd}</Button>
      </form>
    </div>
  )
}

/* ── MarketplacePage ─────────────────────────────────────────── */
export function MarketplacePage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)
  const basket   = useSelector(s => s.waste?.basket ?? [])

  const { posts, addPost: supabaseAddPost } = useSupabaseMarketplace()

  useEffect(() => {
    if (posts.length > 0) dispatch(setPosts(posts))
  }, [posts, dispatch])

  const [catFilter, setCatFilter]   = useState('all')
  const [isPosting, setIsPosting]   = useState(false)

  // Basket material types for "in basket" badge
  const basketMaterials = new Set(basket.filter(i => !i.skipped).map(i => i.materialType))
  const basketCount     = basket.filter(i => !i.skipped).length

  // Filtered material list
  const visibleMaterials = catFilter === 'basket'
    ? MATERIAL_KEYS.filter(k => basketMaterials.has(k))
    : CATEGORIES[catFilter] ?? MATERIAL_KEYS

  const CAT_TABS = [
    { key: 'all',     label: 'All materials' },
    { key: 'plastic', label: 'Plastic' },
    { key: 'paper',   label: 'Paper' },
    { key: 'metal',   label: 'Metal' },
    { key: 'glass',   label: 'Glass' },
    { key: 'basket',  label: `★ My basket (${basketCount})` },
  ]

  const trendLabel = { up: '▲', down: '▼', flat: '·  flat' }
  const trendColor = { up: 'var(--green-ink)', down: 'var(--orange)', flat: 'var(--ink-4)' }

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
            <div className="grid grid-cols-[1fr_auto_auto] px-6 lg:px-10 py-2.5 border-b-[1.5px] border-[var(--ink)] bg-[var(--paper-2)]">
              <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">Material</span>
              <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em] text-right pr-16">Price</span>
              <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em] text-right">7-day trend</span>
            </div>

            {visibleMaterials.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <span className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest">
                  No items in basket
                </span>
              </div>
            ) : (
              visibleMaterials.map(key => {
                const price   = pricePerKg(key, 'A')
                const trend   = TRENDS[key] ?? { vals: [price], dir: 'flat' }
                const inBask  = basketMaterials.has(key)
                return (
                  <div
                    key={key}
                    className={`grid grid-cols-[1fr_auto_auto] items-center px-6 lg:px-10 py-4 border-b-[1px] border-[var(--ink-4)] hover:bg-[var(--paper-2)] transition-colors ${inBask ? 'bg-[var(--green-soft)]' : ''}`}
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
                    <div className="flex flex-col items-end gap-0.5 pr-8">
                      <span className="font-brand text-[22px] text-[var(--ink)] leading-none">
                        ฿ {price.toFixed(2)}
                      </span>
                      <span className="font-data text-[10px] text-[var(--ink-4)]">฿/kg</span>
                    </div>

                    {/* Trend sparkline + label */}
                    <div className="flex flex-col items-end gap-1">
                      <Sparkline vals={trend.vals} dir={trend.dir} />
                      <span className="font-data text-[10px]" style={{ color: trendColor[trend.dir] }}>
                        {trendLabel[trend.dir]}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Table footer */}
          <div className="flex items-center justify-between px-6 lg:px-10 py-3 border-t-[1.5px] border-[var(--ink)] bg-[var(--paper-2)]">
            <span className="font-data text-[10px] text-[var(--ink-4)]">
              updated 4 min ago · source: 6 buyers
            </span>
            <div className="flex items-center gap-4">
              <button onClick={() => toast.info('CSV export coming soon')} className="font-data text-[10px] text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer transition-colors uppercase tracking-wide">
                ↓ export CSV
              </button>
              <button onClick={() => toast.info('Price alerts coming soon')} className="font-data text-[10px] text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer transition-colors uppercase tracking-wide">
                set price alert
              </button>
            </div>
          </div>
        </div>

        {/* ══ RIGHT: Buying Requests + Map ═════════════════════ */}
        <div className="flex flex-col w-full lg:w-[320px] shrink-0 border-t-[1.5px] lg:border-t-0 border-[var(--ink)]">

          {/* Right header */}
          <div className="px-5 py-5 border-b-[1.5px] border-[var(--ink)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-brand text-[20px] text-[var(--ink)] m-0 leading-tight">
                  Buying requests —
                </h2>
                <h2 className="font-brand text-[20px] text-[var(--ink)] m-0 leading-tight">
                  near you
                </h2>
              </div>
              <div className="flex gap-2 mt-1">
                <button className="font-data text-[10px] border-[1.5px] border-[var(--ink-4)] px-2 py-1 bg-transparent cursor-default text-[var(--ink-3)]">5 km ▾</button>
                <button className="font-data text-[10px] border-[1.5px] border-[var(--ink-4)] px-2 py-1 bg-transparent cursor-default text-[var(--ink-3)]">best deal ▾</button>
              </div>
            </div>
          </div>

          {/* Buying request cards */}
          <div className="flex flex-col gap-3 px-5 py-5 flex-1 overflow-y-auto">
            {BUYING_REQUESTS.map(req => (
              <RequestCard key={req.id} req={req} language={language} />
            ))}
          </div>

          {/* Mini map */}
          <div className="px-5 pb-4">
            <MiniMap />
          </div>

          {/* Post Ad section */}
          <div className="px-5 pb-5 border-t-[1.5px] border-[var(--ink)] pt-4">
            {isPosting ? (
              <PostAdForm onClose={() => setIsPosting(false)} onAdd={supabaseAddPost} />
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
