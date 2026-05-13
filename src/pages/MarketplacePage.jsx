import { useState } from 'react'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { useSelector } from 'react-redux'
import { localName } from '../data/wasteItems'

const LISTINGS = [
  { id: 1, materialType: 'aluminum_can',    grade: 'A', qty: 50,  pricePerKg: 48,  shop: 'เฮียอ้วน รีไซเคิล',   distanceKm: 1.2 },
  { id: 2, materialType: 'copper',          grade: 'A', qty: 10,  pricePerKg: 240, shop: 'แม่น้อย ของเก่า',      distanceKm: 2.5 },
  { id: 3, materialType: 'cardboard',       grade: 'B', qty: 200, pricePerKg: 3,   shop: 'ร้านบุญชู',             distanceKm: 0.8 },
  { id: 4, materialType: 'pet_bottle_clear',grade: 'A', qty: 80,  pricePerKg: 9.6, shop: 'กรีน พอยท์ CM',        distanceKm: 3.1 },
  { id: 5, materialType: 'newspaper',       grade: 'B', qty: 100, pricePerKg: 2,   shop: 'ร้านลุงแดง',            distanceKm: 1.5 },
  { id: 6, materialType: 'mixed_plastic',   grade: 'C', qty: 300, pricePerKg: 3.5, shop: 'นิรันดร์ รีไซเคิล',    distanceKm: 4.2 },
  { id: 7, materialType: 'glass',           grade: 'B', qty: 60,  pricePerKg: 1,   shop: 'ป้าแอน ของเก่า',        distanceKm: 2.0 },
  { id: 8, materialType: 'cooking_oil',     grade: 'A', qty: 25,  pricePerKg: 14.4,shop: 'ไบโอ ออยล์ CMU',       distanceKm: 5.6 },
]

export function MarketplacePage() {
  const t          = useT()
  const language   = useSelector(s => s.user.language)
  const [filter, setFilter] = useState('all')

  const visible = filter === 'all' ? LISTINGS : LISTINGS.filter(l => l.grade === filter.toUpperCase())

  const FILTERS = [
    { key: 'all', label: t.filterAll },
    { key: 'a',   label: t.filterA },
    { key: 'b',   label: t.filterB },
    { key: 'c',   label: t.filterC },
  ]

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.marketplace}</h1>

      {/* Filter bar */}
      <div className="w-full max-w-xl flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              'px-3 py-1 font-data text-[12px] uppercase tracking-widest border-[1.5px] border-[var(--ink)]',
              filter === f.key
                ? 'bg-[var(--ink)] text-[var(--paper)]'
                : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <Card className="w-full max-w-xl flex items-center justify-center py-10">
          <p className="font-body text-[15px] text-[var(--ink-3)] m-0">{t.noListings}</p>
        </Card>
      ) : (
        <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Dist</span>
                <span className="font-data text-[13px] text-[var(--ink)]">{item.distanceKm} {t.kmAway}</span>
              </div>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => toast.info('Feature in M4 final')}
              >
                {t.contactSeller}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
