import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { EmptyState } from '../components/EmptyState'
import { SectionDivider } from '../components/SectionDivider'
import { localName, WASTE_ITEMS } from '../data/wasteItems'
import { removeFromBasket, updateWeight, toggleSkip, clearBasket, addToBasket } from '../store/wasteSlice'
import { useGPS } from '../hooks/useGPS'
import { haversineKm } from '../utils/haversine'
import { addBooking } from '../store/bookingSlice'
import { useShops } from '../hooks/useShops'
import { useMarketPricing } from '../hooks/useMarketPricing'
import { useInsertBooking } from '../hooks/useInsertBooking'
import { useBookingGroup } from '../hooks/useBookingGroup'

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

function generateSlots(minOffsetMin = 30) {
  const slots = []
  const now = new Date()
  const base = new Date(now)
  // Round up to next 30-min mark + offset
  const rawMin = now.getMinutes() + minOffsetMin
  base.setMinutes(Math.ceil(rawMin / 30) * 30, 0, 0)
  for (let i = 0; i < 8; i++) {
    slots.push(new Date(base.getTime() + i * 30 * 60 * 1000))
  }
  return slots
}

function fmtSlot(d) {
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' })
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
          {[
            { label: t.cleanLabel, val: true },
            { label: t.dirtyLabel, val: false },
          ].map(({ label, val }) => (
            <button key={label} onClick={() => setClean(val)}
              className={['px-3 h-8 font-data text-[11px] border-[1.5px] border-[var(--ink)]', clean === val ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-[var(--paper)] text-[var(--ink)]'].join(' ')}>
              {label}
            </button>
          ))}
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
  const navigate = useNavigate()
  const basket   = useSelector(s => s.waste.basket)
  const language = useSelector(s => s.user.language)

  const [showManual,    setShowManual]    = useState(false)
  const [filterMat,     setFilterMat]     = useState('all')
  const [bookingShop,   setBookingShop]   = useState(null)
  const [pickupMode,    setPickupMode]    = useState('dropOff')
  const [onDemandStep,  setOnDemandStep]  = useState('schedule')  // schedule | waiting | timeout | complete
  const [shopSchedules, setShopSchedules] = useState([])  // [{ shop, materials, scheduledFor: Date }]

  const gps = useGPS()
  const { shops } = useShops()
  const { marketPrice, shopPrice } = useMarketPricing()
  const insertBooking = useInsertBooking()
  const { createGroup, groupBookings, secondsLeft, phase, cancelGroup, reset: resetGroup } = useBookingGroup()

  const shopsWithDist = shops.map(s => ({ ...s, dist: distOf(s, gps.lat, gps.lng) }))
  const { single, multi, unmatched } = computeRoutes(basket, shopsWithDist, gps.lat, gps.lng)

  const activeItems  = basket.filter(i => !i.skipped)
  const basketMats   = [...new Set(basket.map(i => i.materialType))]
  const visibleItems = filterMat === 'all' ? basket : basket.filter(i => i.materialType === filterMat)
  const total        = activeItems.reduce((sum, i) => sum + marketPrice(i.materialType, i.clean ?? true) * (i.weight ?? 0), 0)

  // Sync phase from hook to onDemandStep
  useEffect(() => {
    if (phase === 'idle') return
    async function sync() { setOnDemandStep(phase) }
    sync()
  }, [phase])

  // Initialize shopSchedules when entering on-demand mode
  useEffect(() => {
    if (pickupMode !== 'onDemand') return
    async function init() {
      if (multi.length === 0 && single.length === 0) return
      const slots = generateSlots(30)
      const stopsToUse = multi.length > 0 ? multi : (single.length > 0 ? [{ shop: single[0], materials: activeItems.map(i => i.materialType) }] : [])
      const schedules = stopsToUse.map((stop, idx) => ({
        shop:         stop.shop,
        materials:    stop.materials ?? activeItems.map(i => i.materialType),
        scheduledFor: slots[idx],
      }))
      setShopSchedules(schedules)
    }
    init()
  }, [pickupMode, multi.length, single.length]) // eslint-disable-line react-hooks/exhaustive-deps

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
    await insertBooking(shop, activeItems, { mode: 'dropOff', lat: gps.lat, lng: gps.lng })
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
    const url = gps.lat
      ? `https://www.openstreetmap.org/directions?from=${gps.lat},${gps.lng}&to=${shop.lat},${shop.lng}`
      : `https://www.openstreetmap.org/?mlat=${shop.lat}&mlon=${shop.lng}`
    window.open(url, '_blank')
  }

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">

      {/* Heading */}
      <div className="w-full max-w-5xl flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-[0.15em]">
            BASKET · {activeItems.length} of {basket.length} active
          </span>
          <div className="flex items-baseline gap-3">
            <span className="font-brand text-[32px] leading-none">
              <span className="text-[var(--green-ink)]">฿</span>{total.toFixed(0)}
            </span>
            <span className="font-data text-[12px] text-[var(--ink-3)]">estimated</span>
          </div>
        </div>
        <button
          onClick={() => setShowManual(v => !v)}
          className="font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] px-3 py-1.5 bg-[var(--paper)] hover:bg-[var(--paper-2)] text-[var(--ink)] shrink-0 mt-1"
        >
          + {t.addManually}
        </button>
      </div>

      {/* Pickup mode selector */}
      <div className="w-full max-w-5xl flex gap-0 border-[1.5px] border-[var(--ink)]">
        <button
          onClick={() => setPickupMode('dropOff')}
          className={`flex-1 py-2.5 font-data text-[11px] uppercase tracking-widest border-none cursor-pointer transition-colors ${pickupMode === 'dropOff' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]'}`}
        >
          {t.modeDropOff}
        </button>
        <button
          onClick={() => setPickupMode('onDemand')}
          className={`flex-1 py-2.5 font-data text-[11px] uppercase tracking-widest border-l-[1.5px] border-[var(--ink)] cursor-pointer transition-colors ${pickupMode === 'onDemand' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]'}`}
        >
          {t.modeOnDemand}
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
              {m === 'all' ? t.allItems : localName(m, language)}
            </button>
          ))}
        </div>
      )}

      {basket.length === 0 && !showManual ? (
        <div className="flex flex-col min-h-[60vh] items-center justify-center w-full max-w-5xl">
          <EmptyState
            icon="🧺"
            title="Your basket is empty"
            body="Scan an item to add it. The AI will weigh and price it in seconds."
            primaryCta="+ Scan an item"
            onPrimary={() => navigate('/scan')}
            secondaryCta="See today's prices"
            onSecondary={() => navigate('/marketplace')}
          />
        </div>
      ) : (
        <div className="w-full max-w-5xl flex flex-col gap-4">

          {/* Basket items list */}
          <div className="flex flex-col gap-3">
            {visibleItems.map(item => {
              const unitPrice = marketPrice(item.materialType, item.clean ?? true)
              const lineTotal = unitPrice * (item.weight ?? 0)
              return (
                <Card key={item.id} className={`flex flex-col gap-3 ${item.skipped ? 'opacity-40' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GradeTag clean={item.clean} />
                      <span className={`font-body text-[15px] text-[var(--ink)]${item.skipped ? ' line-through' : ''}`}>
                        {localName(item.materialType, language)}
                      </span>
                      {item.source === 'manual' && (
                        <span className="font-data text-[9px] uppercase border-[1px] border-[var(--ink-4)] px-1 text-[var(--ink-3)]">manual</span>
                      )}
                    </div>
                    <span className={`font-data text-[13px] text-[var(--green)] font-bold${item.skipped ? ' line-through' : ''}`}>฿{lineTotal.toFixed(2)}</span>
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
          </div>

          {/* ─── ROUTE ─────────────────────────────────────────── */}
          <SectionDivider label="ROUTE" />

          {pickupMode === 'dropOff' ? (
            <>
              {/* Route options */}
              <div className="flex flex-col gap-3">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="font-body text-[15px] text-[var(--ink)]">Pickup options</span>
                  <span className="font-data text-[11px] text-[var(--ink-3)]">
                    GPS · {gps.lat != null ? '0.0' : '—'} km
                  </span>
                </div>

                {/* Single shop card */}
                <div className="flex flex-col gap-2 border-[1.5px] border-[var(--ink-4)] p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-body text-[15px] text-[var(--ink)] m-0 font-semibold">Single shop</p>
                      {single.length > 0 ? (
                        <p className="font-data text-[11px] text-[var(--ink-3)] m-0">
                          {single[0].name} · {single[0].dist != null ? `${single[0].dist}km` : '—'}
                        </p>
                      ) : (
                        <p className="font-data text-[11px] text-[var(--ink-3)] m-0">
                          {gps.lat ? 'No shop accepts all materials' : 'Finding shops…'}
                        </p>
                      )}
                    </div>
                    {single.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="font-data text-[16px] text-[var(--green)]">
                          ฿{shopTotalFor(single[0], activeItems, shopPrice, marketPrice).toFixed(0)}
                        </span>
                        <span className="font-data text-[14px] text-[var(--ink-3)]">→</span>
                      </div>
                    )}
                  </div>
                  {single.length > 0 && (
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => openMaps(single[0])}>{t.openInMaps}</Button>
                      <Button variant="primary" onClick={() => handleBookClick(single[0])}>{t.bookAppointment}</Button>
                    </div>
                  )}
                </div>

                {/* Multi-stop card — highlighted as best */}
                <div className="flex flex-col gap-2 border-[1.5px] border-[var(--green)] bg-[var(--green-soft)] p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-body text-[15px] text-[var(--ink)] m-0 font-semibold">Multi-stop · best</p>
                      {multi.length > 0 ? (
                        <p className="font-data text-[11px] text-[var(--ink-3)] m-0">
                          {multi.length} shops · {multi.reduce((s, stop) => s + (stop.distFromLast ?? 0), 0).toFixed(1)}km loop
                        </p>
                      ) : (
                        <p className="font-data text-[11px] text-[var(--ink-3)] m-0">
                          {gps.lat ? 'Computing route…' : 'Finding shops…'}
                        </p>
                      )}
                    </div>
                    {multi.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="font-data text-[16px] text-[var(--green-ink)]">
                          ฿{multi.reduce((sum, stop) => {
                            const stopItems = activeItems.filter(item => stop.materials.includes(item.materialType))
                            return sum + shopTotalFor(stop.shop, stopItems, shopPrice, marketPrice)
                          }, 0).toFixed(0)}
                        </span>
                        <span className="font-data text-[14px] text-[var(--ink-3)]">→</span>
                      </div>
                    )}
                  </div>
                  {multi.length > 0 && (
                    <div className="flex gap-2">
                      {multi.slice(0, 1).map(stop => (
                        <Button key={stop.shop.id} variant="secondary" onClick={() => openMaps(stop.shop)}>
                          {t.openInMaps}
                        </Button>
                      ))}
                      <Button variant="primary" onClick={() => multi.length > 0 && handleBookClick(multi[0].shop)}>
                        {t.bookAppointment}
                      </Button>
                    </div>
                  )}
                  {unmatched.length > 0 && (
                    <p className="font-data text-[11px] text-[var(--orange)] m-0">
                      {t.noAcceptingShop}: {unmatched.map(m => localName(m, language)).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* GPS location button */}
              <button
                onClick={gps.request}
                disabled={gps.loading}
                className="font-data text-[11px] text-[var(--green)] uppercase tracking-widest bg-transparent border-none cursor-pointer disabled:opacity-50 text-left"
              >
                {gps.loading ? '...' : gps.lat ? `GPS: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : '+ ' + t.useMyLocation}
              </button>

              {/* Bottom CTAs */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => single.length > 0 ? handleBookClick(single[0]) : (multi.length > 0 ? handleBookClick(multi[0].shop) : null)}
                  disabled={single.length === 0 && multi.length === 0}
                >
                  {t.bookAppointment} · ฿{total.toFixed(0)} →
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => dispatch(clearBasket())}
                >
                  Clear basket
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* ─── ON-DEMAND: SCHEDULE STEP ─────────────────────────── */}
              {onDemandStep === 'schedule' && (
                <div className="flex flex-col gap-3 border-[1.5px] border-[var(--ink)] p-4">
                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.onDemandTitle}</span>
                  <p className="font-body text-[14px] text-[var(--ink)] m-0">{t.onDemandDesc}</p>

                  {shopSchedules.length === 0 && (
                    <p className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest">
                      {gps.lat ? t.computingRoute : t.noGpsWarning}
                    </p>
                  )}

                  {shopSchedules.map((ss, idx) => {
                    const baseSlots = generateSlots(30 + idx * 30)
                    return (
                      <div key={ss.shop.id} className="flex flex-col gap-1.5 border-[1px] border-[var(--ink-4)] p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-body text-[14px] text-[var(--ink)]">{ss.shop.name}</span>
                          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">
                            {ss.materials.map(m => localName(m, language)).join(', ')}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {baseSlots.map(slot => {
                            const selected = ss.scheduledFor.getTime() === slot.getTime()
                            return (
                              <button
                                key={slot.getTime()}
                                onClick={() => setShopSchedules(prev => prev.map((s, i) =>
                                  i === idx ? { ...s, scheduledFor: slot } : s
                                ))}
                                className={[
                                  'px-2.5 py-1 font-data text-[11px] border-[1.5px] cursor-pointer transition-colors',
                                  selected
                                    ? 'border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-ink)]'
                                    : 'border-[var(--ink-4)] bg-[var(--paper)] text-[var(--ink-3)] hover:border-[var(--ink)] hover:text-[var(--ink)]',
                                ].join(' ')}
                              >
                                {fmtSlot(slot)}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  {shopSchedules.length > 1 && (
                    <p className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">
                      {t.minGapBetweenShops}
                    </p>
                  )}

                  <Button
                    variant="primary"
                    fullWidth
                    disabled={shopSchedules.length === 0 || !gps.lat}
                    onClick={async () => {
                      await createGroup(shopSchedules, activeItems)
                    }}
                  >
                    {t.sendPickupRequests}
                  </Button>
                </div>
              )}

              {/* ─── ON-DEMAND: WAITING STEP ───────────────────────────── */}
              {onDemandStep === 'waiting' && (
                <div className="flex flex-col gap-3 border-[1.5px] border-[var(--orange)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.waitingForShops}</span>
                    <span className="font-data text-[18px] text-[var(--orange)]">
                      {secondsLeft != null
                        ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {groupBookings.map(gb => (
                      <div key={gb.shopId} className="flex items-center justify-between py-2 border-b-[1px] border-[var(--ink-4)] last:border-0">
                        <span className="font-body text-[14px] text-[var(--ink)]">{gb.shopName}</span>
                        <span className={`font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border-[1.5px] ${
                          gb.status === 'accepted' ? 'border-[var(--green)] text-[var(--green-ink)] bg-[var(--green-soft)]' :
                          gb.status === 'rejected' ? 'border-[var(--orange)] text-[var(--orange)]' :
                          'border-[var(--ink-4)] text-[var(--ink-3)]'
                        }`}>
                          {gb.status === 'accepted' ? t.statusAccepted : gb.status === 'rejected' ? t.statusRejected : t.statusSearching}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button variant="secondary" fullWidth onClick={() => { cancelGroup(); resetGroup(); setOnDemandStep('schedule') }}>
                    {t.cancelPickupRequest}
                  </Button>
                </div>
              )}

              {/* ─── ON-DEMAND: TIMEOUT ─────────────────────────────────── */}
              {onDemandStep === 'timeout' && (
                <div className="flex flex-col gap-3 border-[1.5px] border-[var(--ink-4)] p-4">
                  <span className="font-data text-[11px] text-[var(--orange)] uppercase tracking-widest">{t.noShopAccepted}</span>
                  <p className="font-body text-[14px] text-[var(--ink)] m-0">{t.disposalAlternatives}</p>
                  <div className="flex flex-col gap-1 pl-3">
                    <span className="font-body text-[13px] text-[var(--ink-2)]">• {t.altCityDrop}</span>
                    <span className="font-body text-[13px] text-[var(--ink-2)]">• {t.altMunicipal}</span>
                    <span className="font-body text-[13px] text-[var(--ink-2)]">• {t.altScheduleLater}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" fullWidth onClick={() => { resetGroup(); setOnDemandStep('schedule') }}>{t.tryAgain}</Button>
                    <Button variant="primary" fullWidth onClick={() => navigate('/map')}>{t.findDropOff}</Button>
                  </div>
                </div>
              )}

              {/* ─── ON-DEMAND: COMPLETE ─────────────────────────────────── */}
              {onDemandStep === 'complete' && (
                <div className="flex flex-col gap-3 border-[1.5px] border-[var(--green)] p-4 bg-[var(--green-soft)]">
                  <span className="font-data text-[11px] text-[var(--green-ink)] uppercase tracking-widest">{t.allShopsAccepted}</span>
                  <p className="font-body text-[14px] text-[var(--ink)] m-0">{t.trackPickupOnMap}</p>
                  <Button variant="primary" fullWidth onClick={() => navigate('/map')}>{t.viewOnMap}</Button>
                </div>
              )}

              {/* GPS location button */}
              <button
                onClick={gps.request}
                disabled={gps.loading}
                className="font-data text-[11px] text-[var(--green)] uppercase tracking-widest bg-transparent border-none cursor-pointer disabled:opacity-50 text-left"
              >
                {gps.loading ? '...' : gps.lat ? `GPS: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : '+ ' + t.useMyLocation}
              </button>

              {/* Bottom CTA */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => dispatch(clearBasket())}
                >
                  Clear basket
                </Button>
              </div>
            </>
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
