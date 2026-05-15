import { useState } from 'react'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { localName, WASTE_ITEMS } from '../data/wasteItems'
import { removeFromBasket, updateWeight, toggleSkip, clearBasket, addToBasket } from '../store/wasteSlice'
import { useGPS } from '../hooks/useGPS'
import { haversineKm } from '../utils/haversine'
import { addBooking } from '../store/bookingSlice'
import { useShops } from '../hooks/useShops'
import { useMarketPricing } from '../hooks/useMarketPricing'
import { useInsertBooking } from '../hooks/useInsertBooking'

const MATERIAL_KEYS = Object.keys(WASTE_ITEMS)

function distOf(shop, userLat, userLng) {
  if (userLat != null && userLng != null) {
    return Math.round(haversineKm(userLat, userLng, shop.lat, shop.lng) * 10) / 10
  }
  return shop.distanceKm
}

function shopTotalFor(shop, activeItems, shopPrice, marketPrice) {
  return activeItems.reduce((sum, i) => {
    const p = shopPrice(shop.id, i.materialType, i.clean ?? true) ?? marketPrice(i.materialType, i.clean ?? true)
    return sum + p * (i.weight ?? 0)
  }, 0)
}

function computeRoutes(basket, shopsWithDist, userLat, userLng) {
  const active    = basket.filter(i => !i.skipped)
  const materials = [...new Set(active.map(i => i.materialType))]

  const single = shopsWithDist
    .filter(s => materials.every(m => (s.accepts ?? []).includes(m)))
    .sort((a, b) => a.dist - b.dist)

  // Nearest-Neighbor TSP heuristic
  const multi = []
  const unmatched = []
  let remainingMaterials = new Set(materials)
  let currentNode = { lat: userLat ?? null, lng: userLng ?? null }
  let available = [...shopsWithDist]

  while (remainingMaterials.size > 0) {
    const candidates = available.map(s => ({
      shop: s,
      distFromCurrent: currentNode.lat != null
        ? Math.round(haversineKm(currentNode.lat, currentNode.lng, s.lat, s.lng) * 10) / 10
        : s.dist,
      covering: (s.accepts ?? []).filter(m => remainingMaterials.has(m)),
    })).filter(c => c.covering.length > 0)

    if (candidates.length === 0) { remainingMaterials.forEach(m => unmatched.push(m)); break }
    candidates.sort((a, b) => a.distFromCurrent - b.distFromCurrent)
    const next = candidates[0]
    multi.push({ shop: next.shop, distFromLast: next.distFromCurrent, materials: next.covering })
    next.covering.forEach(m => remainingMaterials.delete(m))
    currentNode = { lat: next.shop.lat, lng: next.shop.lng }
    available = available.filter(s => s.id !== next.shop.id)
  }

  return { single, multi, unmatched, materials }
}

function BookingModal({ shop, estValue, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-[#1A1A1Ae6] flex items-end md:items-center md:justify-center z-50">
      <div className="w-full max-w-sm mx-4 md:mx-0 bg-[var(--paper)] border-[2px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] p-6 flex flex-col gap-4 mb-6 md:mb-0">
        <div className="flex flex-col gap-1">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">Confirm Booking</span>
          <h2 className="font-brand text-[22px] text-[var(--ink)] m-0">{shop.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-data text-[12px] text-[var(--ink-3)] uppercase tracking-widest">Est. Value</span>
            <span className="font-data text-[20px] text-[var(--green)]">฿{estValue.toFixed(2)}</span>
          </div>
          <p className="font-body text-[13px] text-[var(--ink-3)] m-0 mt-1">
            {shop.area} · {shop.dist} km away
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" fullWidth onClick={onConfirm}>Confirm Booking</Button>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

function ManualAddPanel({ t, language, onAdd }) {
  const [mat,    setMat]    = useState('')
  const [clean,  setClean]  = useState(true)
  const [weight, setWeight] = useState('')

  function submit() {
    if (!mat || !weight || parseFloat(weight) <= 0) return
    onAdd(mat, clean, parseFloat(weight))
    setWeight('')
  }

  return (
    <Card className="flex flex-col gap-3">
      <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.addManually}</span>
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
        {MATERIAL_KEYS.map(k => (
          <button
            key={k}
            onClick={() => setMat(k)}
            className={[
              'px-2 py-0.5 font-data text-[10px] uppercase tracking-widest border-[1.5px] transition-colors',
              mat === k
                ? 'border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-ink)]'
                : 'border-[var(--ink-4)] bg-[var(--paper)] text-[var(--ink-3)]',
            ].join(' ')}
          >
            {localName(k, language)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex gap-1">
          {['สะอาด', 'ไม่สะอาด'].map((label, i) => {
            const val = i === 0
            return (
              <button key={label} onClick={() => setClean(val)}
                className={['px-3 h-8 font-data text-[11px] border-[1.5px] border-[var(--ink)]', clean === val ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-[var(--paper)] text-[var(--ink)]'].join(' ')}>
                {label}
              </button>
            )
          })}
        </div>
        <input
          type="number"
          min="0.01"
          step="0.1"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="kg"
          className="w-20 px-2 py-1 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[14px] outline-none focus:border-[var(--green)]"
        />
        <Button variant="primary" onClick={submit} disabled={!mat || !weight}>{t.addItem}</Button>
      </div>
    </Card>
  )
}

export function BasketPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const basket   = useSelector(s => s.waste.basket)
  const language = useSelector(s => s.user.language)

  const [routeMode,   setRouteMode]   = useState('single')
  const [showRoute,   setShowRoute]   = useState(false)
  const [showManual,  setShowManual]  = useState(false)
  const [filterMat,   setFilterMat]   = useState('all')
  const [bookingShop, setBookingShop] = useState(null)

  const gps = useGPS()
  const { shops } = useShops()
  const { marketPrice, shopPrice } = useMarketPricing()
  const insertBooking = useInsertBooking()

  const shopsWithDist = shops.map(s => ({ ...s, dist: distOf(s, gps.lat, gps.lng) }))
  const { single, multi, unmatched, materials } = computeRoutes(basket, shopsWithDist, gps.lat, gps.lng)

  const activeItems  = basket.filter(i => !i.skipped)
  const basketMats   = [...new Set(basket.map(i => i.materialType))]
  const visibleItems = filterMat === 'all' ? basket : basket.filter(i => i.materialType === filterMat)
  const total        = activeItems.reduce((sum, i) => sum + marketPrice(i.materialType, i.clean ?? true) * (i.weight ?? 0), 0)

  function handleBookClick(shop) { setBookingShop(shop) }

  async function handleConfirmBooking() {
    const shop = bookingShop
    dispatch(addBooking({
      shopId:    shop.id,
      shopName:  shop.name,
      seller:    'me',
      materials: [...new Set(activeItems.map(i => i.materialType))],
      totalKg:   activeItems.reduce((s, i) => s + (i.weight ?? 0), 0),
      estValue:  Math.round(total),
    }))
    await insertBooking(shop, activeItems)
    toast.success(t.bookingConfirmed)
    setBookingShop(null)
  }

  function handleManualAdd(mat, clean, weight) {
    dispatch(addToBasket({
      id:           `manual-${Date.now()}`,
      materialType: mat,
      clean,
      weight,
      confidence:   1,
      source:       'manual',
    }))
    toast.success(localName(mat, language) + ' ' + t.addToBasket)
  }

  function openMaps(shop) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`, '_blank')
  }

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">

      {/* Heading */}
      <div className="w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.basket}</h1>
          {basket.length > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 bg-[var(--green)] border-[1.5px] border-[var(--ink)] font-data text-[11px] font-bold text-[#062040]">
              {basket.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowManual(v => !v)}
          className="font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] px-3 py-1.5 bg-[var(--paper)] hover:bg-[var(--paper-2)] text-[var(--ink)]"
        >
          + {t.addManually}
        </button>
      </div>

      {showManual && (
        <div className="w-full max-w-5xl">
          <ManualAddPanel t={t} language={language} onAdd={handleManualAdd} />
        </div>
      )}

      {/* Material filter pills */}
      {basket.length > 0 && basketMats.length > 1 && (
        <div className="w-full max-w-5xl flex gap-1.5 flex-wrap">
          {['all', ...basketMats].map(m => (
            <button
              key={m}
              onClick={() => setFilterMat(m)}
              className={[
                'px-3 py-1 font-data text-[10px] uppercase tracking-widest border-[1.5px] border-[var(--ink)]',
                filterMat === m ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-[var(--paper)] text-[var(--ink)]',
              ].join(' ')}
            >
              {m === 'all' ? (t.allItems ?? 'All') : localName(m, language)}
            </button>
          ))}
        </div>
      )}

      {basket.length === 0 && !showManual ? (
        <Card className="w-full max-w-5xl flex flex-col items-center py-10 gap-2">
          <p className="font-body text-[15px] text-[var(--ink-3)] m-0 text-center">{t.basketEmpty}</p>
        </Card>
      ) : (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* LEFT — basket items */}
          <div className="flex flex-col gap-3 md:sticky md:top-4">
            {visibleItems.map(item => {
              const unitPrice = marketPrice(item.materialType, item.clean ?? true)
              const lineTotal = unitPrice * (item.weight ?? 0)
              return (
                <Card key={item.id} className={`flex flex-col gap-3 ${item.skipped ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GradeTag clean={item.clean} />
                      <span className="font-body text-[15px] text-[var(--ink)]">
                        {localName(item.materialType, language)}
                      </span>
                      {item.source === 'manual' && (
                        <span className="font-data text-[9px] uppercase border-[1px] border-[var(--ink-4)] px-1 text-[var(--ink-3)]">manual</span>
                      )}
                    </div>
                    <span className="font-data text-[13px] text-[var(--green)] font-bold">฿{lineTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">kg</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.weight ?? 0}
                      onChange={e => dispatch(updateWeight({ id: item.id, weight: parseFloat(e.target.value) || 0 }))}
                      className="w-20 px-2 py-1 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[14px] outline-none focus:border-[var(--green)]"
                    />
                    <span className="font-data text-[11px] text-[var(--ink-3)]">฿{unitPrice.toFixed(2)}/kg</span>
                    <span className="font-data text-[9px] text-[var(--ink-4)] ml-auto">{t.marketAvg}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant={item.skipped ? 'primary' : 'secondary'} onClick={() => dispatch(toggleSkip(item.id))}>
                      {item.skipped ? 'Unskip' : t.skipItem}
                    </Button>
                    <Button variant="ghost" onClick={() => dispatch(removeFromBasket(item.id))}>
                      {t.removeItem}
                    </Button>
                  </div>
                </Card>
              )
            })}

            {basket.length > 0 && (
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-data text-[12px] text-[var(--ink-3)] uppercase tracking-widest">{t.basketTotal}</span>
                  <span className="font-data text-[22px] text-[var(--green)]">฿{total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" fullWidth className="md:hidden" onClick={() => setShowRoute(r => !r)}>
                    {showRoute ? '▲' : '▼'} {t.findRoute}
                  </Button>
                  <span className="hidden md:inline-flex items-center font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
                    Route shown →
                  </span>
                  <Button variant="secondary" onClick={() => dispatch(clearBasket())}>{t.clearBasket}</Button>
                </div>
                <button
                  onClick={gps.request}
                  disabled={gps.loading}
                  className="font-data text-[11px] text-[var(--green)] uppercase tracking-widest bg-transparent border-none cursor-pointer disabled:opacity-50 text-left"
                >
                  {gps.loading ? '...' : gps.lat ? `GPS: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : '+ ' + t.useMyLocation}
                </button>
              </Card>
            )}
          </div>

          {/* RIGHT — route planner (desktop always, mobile toggle) */}
          {materials.length > 0 && (
            <div className={showRoute ? 'flex flex-col gap-3' : 'hidden md:flex flex-col gap-3'}>
              <Card className="flex flex-col gap-4">
                <div className="flex gap-2">
                  {['single', 'multi'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setRouteMode(mode)}
                      className={`flex-1 py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] ${routeMode === mode ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-[var(--paper)] text-[var(--ink)]'}`}
                    >
                      {mode === 'single' ? t.singleShop : t.multiStop}
                    </button>
                  ))}
                </div>

                {routeMode === 'single' && (
                  single.length === 0 ? (
                    <p className="font-body text-[13px] text-[var(--orange)] m-0">{t.noShopWarning}</p>
                  ) : (
                    single.slice(0, 3).map(shop => {
                      const shopTotal = shopTotalFor(shop, activeItems, shopPrice, marketPrice)
                      const diff = shopTotal - total
                      return (
                        <div key={shop.id} className="flex flex-col gap-2 border-[1.5px] border-[var(--ink-4)] p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-body text-[15px] text-[var(--ink)] m-0 font-semibold">{shop.name}</p>
                              <p className="font-data text-[11px] text-[var(--ink-3)] m-0">
                                {shop.dist != null ? `${shop.dist} ${t.distanceKm}` : '—'} · {shop.area}
                              </p>
                              <p className="font-data text-[10px] text-[var(--green)] m-0">{t.acceptsAll}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-data text-[18px] text-[var(--green)]">฿{shopTotal.toFixed(0)}</span>
                              {diff !== 0 && (
                                <p className={`font-data text-[10px] m-0 ${diff > 0 ? 'text-[var(--green)]' : 'text-[var(--orange)]'}`}>
                                  {diff > 0 ? '+' : ''}{diff.toFixed(0)} vs avg
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => openMaps(shop)}>{t.openInMaps}</Button>
                            <Button variant="primary" onClick={() => handleBookClick(shop)}>{t.bookAppointment}</Button>
                          </div>
                        </div>
                      )
                    })
                  )
                )}

                {routeMode === 'multi' && (
                  <div className="flex flex-col gap-3">
                    {multi.map((stop, i) => {
                      const stopItems = activeItems.filter(item => stop.materials.includes(item.materialType))
                      const stopTotal = shopTotalFor(stop.shop, stopItems, shopPrice, marketPrice)
                      return (
                        <div key={stop.shop.id} className="flex flex-col gap-1 border-[1.5px] border-[var(--ink-4)] p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">{t.stop} {i + 1}</span>
                            <span className="font-data text-[11px] text-[var(--ink-3)]">
                              {stop.distFromLast != null ? `${stop.distFromLast} ${t.distanceKm}` : '—'}
                            </span>
                          </div>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-body text-[15px] text-[var(--ink)] m-0 font-semibold">{stop.shop.name}</p>
                              <p className="font-data text-[11px] text-[var(--ink-3)] m-0">
                                {stop.materials.map(m => localName(m, language)).join(', ')}
                              </p>
                            </div>
                            <span className="font-data text-[16px] text-[var(--green)]">฿{stopTotal.toFixed(0)}</span>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Button variant="secondary" onClick={() => openMaps(stop.shop)}>{t.openInMaps}</Button>
                            <Button variant="primary" onClick={() => handleBookClick(stop.shop)}>{t.bookAppointment}</Button>
                          </div>
                        </div>
                      )
                    })}
                    {unmatched.length > 0 && (
                      <p className="font-data text-[11px] text-[var(--orange)] m-0">
                        {t.noAcceptingShop}: {unmatched.map(m => localName(m, language)).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {bookingShop && (
        <BookingModal
          shop={bookingShop}
          estValue={total}
          onConfirm={handleConfirmBooking}
          onCancel={() => setBookingShop(null)}
        />
      )}
    </main>
  )
}
