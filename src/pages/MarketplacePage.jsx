import { useState } from 'react'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { useSelector, useDispatch } from 'react-redux'
import { localName, WASTE_ITEMS, pricePerKg } from '../data/wasteItems'
import { addPost, setGradeFilter } from '../store/marketplaceSlice'

const GRADES = ['A', 'B', 'C']
const MATERIAL_KEYS = Object.keys(WASTE_ITEMS)

function PostAdForm({ onClose }) {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)

  const [form, setForm] = useState({
    materialType: MATERIAL_KEYS[0],
    grade:        'A',
    qty:          '',
    pricePerKg:   '',
    contact:      '',
    shop:         '',
  })

  function set(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.qty || !form.pricePerKg || !form.shop) {
      toast.error(t.requiredFields)
      return
    }
    dispatch(addPost({
      ...form,
      qty:        Number(form.qty),
      pricePerKg: Number(form.pricePerKg),
      distanceKm: 0,
    }))
    toast.success(t.postSuccess)
    onClose()
  }

  const suggested = pricePerKg(form.materialType, form.grade).toFixed(1)

  return (
    <Card className="w-full flex flex-col gap-4 border-[var(--green)]">
      <div className="flex items-center justify-between">
        <h2 className="font-brand text-[20px] text-[var(--ink)] m-0">{t.postAd}</h2>
        <button onClick={onClose} className="font-data text-[12px] text-[var(--ink-3)] uppercase tracking-widest bg-transparent border-none cursor-pointer hover:text-[var(--ink)]">
          {t.cancelLabel}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Material */}
        <div className="flex flex-col gap-1">
          <label className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.materialTypeLabel}</label>
          <select
            value={form.materialType}
            onChange={e => set('materialType', e.target.value)}
            className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[16px] outline-none focus:border-[var(--green)]"
          >
            {MATERIAL_KEYS.map(k => (
              <option key={k} value={k}>{localName(k, language)}</option>
            ))}
          </select>
        </div>

        {/* Grade */}
        <div className="flex flex-col gap-1">
          <label className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.gradeLabel}</label>
          <div className="flex gap-2">
            {GRADES.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => set('grade', g)}
                className={[
                  'flex-1 py-2 font-data text-[13px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] transition-colors',
                  form.grade === g ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-transparent text-[var(--ink)] hover:bg-[var(--ink-4)]/20',
                ].join(' ')}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Qty */}
          <div className="flex flex-col gap-1">
            <label className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.weightKg}</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              required
              value={form.qty}
              onChange={e => set('qty', e.target.value)}
              placeholder="kg"
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[16px] outline-none focus:border-[var(--green)]"
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1">
            <label className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
              {t.pricePerKgLabel}
              <span className="ml-1 text-[var(--green)] normal-case tracking-normal">(~฿{suggested})</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              required
              value={form.pricePerKg}
              onChange={e => set('pricePerKg', e.target.value)}
              placeholder={`฿ ${suggested}`}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[16px] outline-none focus:border-[var(--green)]"
            />
          </div>
        </div>

        {/* Shop name */}
        <div className="flex flex-col gap-1">
          <label className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.shopName}</label>
          <input
            type="text"
            required
            value={form.shop}
            onChange={e => set('shop', e.target.value)}
            className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[16px] outline-none focus:border-[var(--green)]"
          />
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-1">
          <label className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.contactInfo}</label>
          <input
            type="text"
            value={form.contact}
            onChange={e => set('contact', e.target.value)}
            placeholder="LINE / Tel"
            className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[16px] outline-none focus:border-[var(--green)]"
          />
        </div>

        <Button type="submit" variant="primary" fullWidth>{t.postAd}</Button>
      </form>
    </Card>
  )
}

export function MarketplacePage() {
  const t          = useT()
  const dispatch   = useDispatch()
  const language   = useSelector(s => s.user.language)
  const role       = useSelector(s => s.user.profile?.role)
  const posts      = useSelector(s => s.marketplace.posts)
  const gradeFilter= useSelector(s => s.marketplace.gradeFilter ?? 'all')

  const [isPosting, setIsPosting] = useState(false)

  const visible = gradeFilter === 'all'
    ? posts.filter(p => !p.flagged)
    : posts.filter(p => !p.flagged && p.grade === gradeFilter.toUpperCase())

  const FILTERS = [
    { key: 'all', label: t.filterAll },
    { key: 'a',   label: t.filterA },
    { key: 'b',   label: t.filterB },
    { key: 'c',   label: t.filterC },
  ]

  return (
    <div className="flex flex-col items-center px-4 py-8 gap-6">
      <div className="w-full max-w-xl flex items-center justify-between">
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.marketplace}</h1>
        {(role === 'user' || role === 'buyer') && !isPosting && (
          <Button variant="secondary" onClick={() => setIsPosting(true)}>
            + {t.postAd}
          </Button>
        )}
      </div>

      <div className="w-full max-w-xl flex flex-col gap-5">
        {isPosting && <PostAdForm onClose={() => setIsPosting(false)} />}

        {/* Filter bar */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => dispatch(setGradeFilter(f.key))}
              className={[
                'px-3 py-1 font-data text-[12px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] transition-colors',
                gradeFilter === f.key
                  ? 'bg-[var(--ink)] text-[var(--paper)]'
                  : 'bg-[var(--paper)] text-[var(--ink)] hover:text-[var(--green)]',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Listings */}
        {visible.length === 0 ? (
          <Card className="flex items-center justify-center py-10">
            <p className="font-body text-[15px] text-[var(--ink-3)] m-0">{t.noListings}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visible.map(item => (
              <Card key={item.id} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <GradeTag grade={item.grade} />
                  <span className="font-body text-[15px] text-[var(--ink)] font-semibold">
                    {localName(item.materialType, language)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Qty</span>
                  <span className="font-data text-[13px] text-[var(--ink)]">{item.qty} kg</span>

                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">฿/kg</span>
                  <span className="font-data text-[13px] text-[var(--green)] font-bold">฿{item.pricePerKg}</span>

                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Shop</span>
                  <span className="font-body text-[13px] text-[var(--ink)]">{item.shop}</span>

                  {item.distanceKm > 0 && (
                    <>
                      <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Dist</span>
                      <span className="font-data text-[13px] text-[var(--ink)]">{item.distanceKm} {t.kmAway}</span>
                    </>
                  )}
                  {item.contact && (
                    <>
                      <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Tel</span>
                      <span className="font-body text-[13px] text-[var(--ink)]">{item.contact}</span>
                    </>
                  )}
                </div>

                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => toast.info(item.contact || t.contactSeller)}
                >
                  {t.contactSeller}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
