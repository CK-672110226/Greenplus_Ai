import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { removeFromBasket, updateWeight, toggleSkip, clearBasket } from '../store/wasteSlice'
import { GradeTag } from '../components/GradeTag'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useT } from '../hooks/useT'
import { localName } from '../data/wasteItems'
import { MOCK_SHOPS, singleShopMatches, multiStopRoute } from '../data/shops'

const ACCEPTED_BY_ANY_SHOP = new Set(MOCK_SHOPS.flatMap(s => s.accepts))

// ── Basket item card ──────────────────────────────────────────
function BasketItem({ item, language }) {
  const dispatch = useDispatch()
  const value = +(item.weight * item.pricePerKg).toFixed(2)

  return (
    <div className={`flex items-center gap-3 py-3 border-b border-[var(--ink-3)] last:border-0 ${item.skipped ? 'opacity-40' : ''}`}>
      <GradeTag grade={item.grade} />
      <div className="flex-1 min-w-0">
        <p className="font-body text-[15px] text-[var(--ink)] m-0 truncate">
          {localName(item.materialType, language)}
        </p>
        <p className="font-data text-[11px] text-[var(--ink-3)] m-0">฿{item.pricePerKg}/kg</p>
      </div>
      <input
        type="number"
        min="0.001"
        step="0.001"
        value={item.weight}
        onChange={e => dispatch(updateWeight({ id: item.id, weight: +e.target.value || 0 }))}
        className="w-20 px-2 py-1 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[13px] text-right outline-none focus:border-[var(--green)]"
      />
      <span className="font-data text-[13px] text-[var(--ink-2)] w-16 text-right">฿{value.toFixed(2)}</span>
      <button
        type="button"
        onClick={() => dispatch(removeFromBasket(item.id))}
        aria-label="remove"
        className="font-data text-[15px] text-[var(--orange)] hover:opacity-70 bg-transparent border-none cursor-pointer p-0 ml-1"
      >
        ×
      </button>
    </div>
  )
}

// ── Unmatched warning row ─────────────────────────────────────
function UnmatchedRow({ item, language, t }) {
  const dispatch = useDispatch()
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="font-body text-[14px] text-[var(--orange)] flex-1">
        {localName(item.materialType, language)} — {t.noShopWarning}
      </span>
      <button
        type="button"
        onClick={() => dispatch(toggleSkip(item.id))}
        className="font-data text-[11px] uppercase tracking-wider text-[var(--ink-2)] border-[1.5px] border-[var(--ink-3)] px-2 py-1 bg-transparent cursor-pointer hover:border-[var(--ink)]"
      >
        {item.skipped ? '↩' : t.skipItem}
      </button>
      <button
        type="button"
        onClick={() => dispatch(removeFromBasket(item.id))}
        className="font-data text-[11px] uppercase tracking-wider text-[var(--orange)] border-[1.5px] border-[var(--orange)] px-2 py-1 bg-transparent cursor-pointer"
      >
        {t.removeItem}
      </button>
    </div>
  )
}

// ── Shop result card ──────────────────────────────────────────
function ShopCard({ shop, items, t, language }) {
  const total = items.reduce((sum, i) => sum + i.weight * i.pricePerKg, 0)
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-body text-[15px] text-[var(--ink)] m-0 font-semibold">{shop.name}</p>
          <p className="font-data text-[11px] text-[var(--ink-3)] m-0 uppercase tracking-wider">
            {shop.distance} {t.distanceKm}
          </p>
        </div>
        <span className="font-data text-[17px] text-[var(--green)] font-bold">฿{total.toFixed(2)}</span>
      </div>
      <p className="font-data text-[11px] text-[var(--ink-2)] m-0">
        {items.map(i => localName(i.materialType, language)).join(', ')}
      </p>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────
export function BasketPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const { basket }  = useSelector(s => s.waste)
  const { profile } = useSelector(s => s.user)
  const language    = useSelector(s => s.user.language)
  const [mode, setMode] = useState('single')

  const userLat = profile?.location_lat ?? undefined
  const userLng = profile?.location_lng ?? undefined

  const total          = basket.reduce((sum, i) => sum + i.weight * i.pricePerKg, 0)
  const unmatchedItems = basket.filter(i => !ACCEPTED_BY_ANY_SHOP.has(i.materialType))
  const singleResults  = singleShopMatches(basket, userLat, userLng)
  const multiResults   = multiStopRoute(basket, userLat, userLng)

  if (basket.length === 0) {
    return (
      <main className="flex flex-col items-center px-6 py-16 gap-6">
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.basket}</h1>
        <Card className="w-full max-w-sm flex flex-col items-center py-10">
          <p className="font-body text-[15px] text-[var(--ink-3)] m-0 text-center">{t.basketEmpty}</p>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex flex-col px-4 py-6 gap-5 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.basket}</h1>
        <div className="flex items-center gap-3">
          <span className="font-data text-[20px] font-bold text-[var(--green)]">
            ฿{total.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() => dispatch(clearBasket())}
            className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-wider bg-transparent border-none cursor-pointer hover:text-[var(--orange)] p-0"
          >
            {t.clearBasket}
          </button>
        </div>
      </div>

      {/* Items */}
      <Card className="flex flex-col py-2 px-4">
        {basket.map(item => (
          <BasketItem key={item.id} item={item} language={language} />
        ))}
      </Card>

      {/* Unmatched warnings */}
      {unmatchedItems.length > 0 && (
        <Card className="flex flex-col gap-1 border-[var(--orange)]">
          {unmatchedItems.map(item => (
            <UnmatchedRow key={item.id} item={item} language={language} t={t} />
          ))}
        </Card>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button variant={mode === 'single' ? 'primary' : 'secondary'} onClick={() => setMode('single')} fullWidth>
          {t.singleShop}
        </Button>
        <Button variant={mode === 'multi' ? 'primary' : 'secondary'} onClick={() => setMode('multi')} fullWidth>
          {t.multiStop}
        </Button>
      </div>

      {/* Single shop results */}
      {mode === 'single' && (
        <div className="flex flex-col gap-3">
          {singleResults.length === 0
            ? <p className="font-body text-[14px] text-[var(--ink-3)] text-center m-0">{t.noShopWarning}</p>
            : singleResults.map(shop => (
                <ShopCard key={shop.id} shop={shop} items={basket.filter(i => !i.skipped)} t={t} language={language} />
              ))
          }
        </div>
      )}

      {/* Multi-stop results */}
      {mode === 'multi' && (
        <div className="flex flex-col gap-3">
          {multiResults.length === 0
            ? <p className="font-body text-[14px] text-[var(--ink-3)] text-center m-0">{t.noShopWarning}</p>
            : multiResults.map((stop, i) => (
                <div key={stop.shop.id}>
                  <p className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-wider m-0 mb-1">
                    {t.stop} {i + 1}
                  </p>
                  <ShopCard shop={stop.shop} items={stop.items} t={t} language={language} />
                </div>
              ))
          }
        </div>
      )}
    </main>
  )
}
