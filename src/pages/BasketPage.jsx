import { useState } from 'react'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { localName, pricePerKg } from '../data/wasteItems'
import { SHOPS } from '../data/shops'
import { removeFromBasket, updateWeight, toggleSkip, clearBasket } from '../store/wasteSlice'
import { useGPS } from '../hooks/useGPS'
import { haversineKm } from '../utils/haversine'
import { addBooking } from '../store/bookingSlice'

function distOf(shop, userLat, userLng) {
  if (userLat != null && userLng != null) {
    return Math.round(haversineKm(userLat, userLng, shop.lat, shop.lng) * 10) / 10
  }
  return shop.distanceKm
}

function computeRoutes(basket, userLat, userLng) {
  const active = basket.filter(i => !i.skipped)
  const materials = [...new Set(active.map(i => i.materialType))]

  const currentDay = new Date().getDay()

  // 1. Filter open shops (Calendar feature)
  const openShops = SHOPS.filter(s => {
    const days = s.openDays || [1, 2, 3, 4, 5, 6] // default to Mon-Sat if missing
    return days.includes(currentDay)
  })

  // Add baseline distance from user
  const shopsWithDist = openShops.map(s => ({ ...s, dist: distOf(s, userLat, userLng) }))

  // Single Shop mode
  const single = shopsWithDist
    .filter(s => materials.every(m => s.accepts.includes(m)))
    .sort((a, b) => a.dist - b.dist)

  // Multi-Stop mode (Tree/Graph Traversal - Nearest Neighbor TSP heuristic)
  const multi = []
  const unmatched = []
  let remainingMaterials = new Set(materials)

  // Node 0 = User's location
  let currentLat = userLat ?? 18.7953 // Default to CMU if no GPS
  let currentLng = userLng ?? 98.9528
  let availableShops = [...openShops]

  while (remainingMaterials.size > 0) {
    // Recompute edges (distances) from the CURRENT node to all eligible shops
    const candidates = availableShops.map(s => ({
      shop: s,
      distFromCurrent: distOf(s, currentLat, currentLng),
      covering: s.accepts.filter(mat => remainingMaterials.has(mat))
    })).filter(c => c.covering.length > 0)

    if (candidates.length === 0) {
      remainingMaterials.forEach(m => unmatched.push(m))
      break
    }

    // Pick the shortest edge (Nearest Neighbor)
    candidates.sort((a, b) => a.distFromCurrent - b.distFromCurrent)
    const nextNode = candidates[0]

    // Add to route sequence
    multi.push({
      shop: { ...nextNode.shop, dist: distOf(nextNode.shop, userLat, userLng) }, // keep dist from user for display
      distFromLast: nextNode.distFromCurrent,
      materials: nextNode.covering
    })

    // Mark materials as covered
    nextNode.covering.forEach(m => remainingMaterials.delete(m))

    // Traverse to next node
    currentLat = nextNode.shop.lat
    currentLng = nextNode.shop.lng
    availableShops = availableShops.filter(s => s.id !== nextNode.shop.id)
  }

  return { single, multi, unmatched, materials }
}

// ─── Booking Modal ───────────────────────────────────────────────────────────

function BookingModal({ shop, estValue, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-[#1A1A1Ae6] flex items-end md:items-center md:justify-center z-50">
      <div className="w-full max-w-sm mx-4 md:mx-0 bg-[var(--paper)] border-[2px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] p-6 flex flex-col gap-4 mb-6 md:mb-0">
        <div className="flex flex-col gap-1">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">Confirm Booking</span>
          <h2 className="font-brand text-[22px] text-[var(--ink)] m-0">{shop.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-data text-[12px] text-[var(--ink-3)] uppercase tracking-widest">Est. Value</span>
            <span className="font-brand text-[20px] text-[var(--green)]">฿{estValue.toFixed(2)}</span>
          </div>
          <p className="font-body text-[13px] text-[var(--ink-3)] m-0 mt-1">
            {shop.area} · {shop.dist} km away
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" fullWidth onClick={onConfirm}>
            Confirm Booking
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Route Planner Panel ─────────────────────────────────────────────────────

function RoutePlannerPanel({ routeMode, setRouteMode, single, multi, unmatched, materials, language, t, openMaps, onBook }) {
  if (materials.length === 0) return null

  return (
    <Card className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setRouteMode('single')}
          className={`flex-1 py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] ${routeMode === 'single' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-[var(--paper)] text-[var(--ink)]'}`}
        >
          {t.singleShop}
        </button>
        <button
          onClick={() => setRouteMode('multi')}
          className={`flex-1 py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] ${routeMode === 'multi' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-[var(--paper)] text-[var(--ink)]'}`}
        >
          {t.multiStop}
        </button>
      </div>

      {/* Single shop results */}
      {routeMode === 'single' && (
        single.length === 0 ? (
          <p className="font-body text-[13px] text-[var(--orange)] m-0">{t.noShopWarning}</p>
        ) : (
          single.slice(0, 3).map(shop => (
            <div key={shop.id} className="flex flex-col gap-2 border-[1.5px] border-[var(--ink-4)] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-[15px] text-[var(--ink)] m-0 font-semibold">{shop.name}</p>
                  <p className="font-data text-[11px] text-[var(--ink-3)] m-0">{shop.dist} {t.distanceKm} · {shop.area}</p>
                  <p className="font-data text-[10px] text-[var(--green)] m-0">{t.acceptsAll}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => openMaps(shop)}>{t.openInMaps}</Button>
                <Button variant="primary" onClick={() => onBook(shop)}>{t.bookAppointment}</Button>
              </div>
            </div>
          ))
        )
      )}

      {/* Multi-stop results */}
      {routeMode === 'multi' && (
        <div className="flex flex-col gap-3">
          {multi.map((stop, i) => (
            <div key={stop.shop.id} className="flex flex-col gap-1 border-[1.5px] border-[var(--ink-4)] p-3">
              <div className="flex items-center justify-between">
                <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">{t.stop} {i + 1}</span>
                <span className="font-data text-[11px] text-[var(--ink-3)]">{stop.shop.dist} {t.distanceKm}</span>
              </div>
              <p className="font-body text-[15px] text-[var(--ink)] m-0 font-semibold">{stop.shop.name}</p>
              <p className="font-data text-[11px] text-[var(--ink-3)] m-0">
                {stop.materials.map(m => localName(m, language)).join(', ')}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => openMaps(stop.shop)}>{t.openInMaps}</Button>
                <Button variant="primary" onClick={() => onBook(stop.shop)}>{t.bookAppointment}</Button>
              </div>
            </div>
          ))}
          {unmatched.length > 0 && (
            <p className="font-data text-[11px] text-[var(--orange)] m-0">
              {t.noAcceptingShop}: {unmatched.map(m => localName(m, language)).join(', ')}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function BasketPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const basket   = useSelector(s => s.waste.basket)
  const language = useSelector(s => s.user.language)

  const [routeMode, setRouteMode]     = useState('single')
  const [showRoute, setShowRoute]     = useState(false)
  const [bookingShop, setBookingShop] = useState(null)   // null = modal closed
  const gps = useGPS()

  const active = basket.filter(i => !i.skipped)
  const total  = active.reduce((sum, i) => sum + pricePerKg(i.materialType, i.grade) * (i.weight ?? 0), 0)

  const { single, multi, unmatched, materials } = computeRoutes(basket, gps.lat, gps.lng)

  function openMaps(shop) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`, '_blank')
  }

  // Open modal instead of booking immediately
  function handleBookClick(shop) {
    setBookingShop(shop)
  }

  // Confirm from modal — dispatch + close
  function handleConfirmBooking() {
    const shop = bookingShop
    dispatch(addBooking({
      shopId:    shop.id,
      shopName:  shop.name,
      seller:    'me',
      materials: [...new Set(active.map(i => i.materialType))],
      totalKg:   active.reduce((s, i) => s + (i.weight ?? 0), 0),
      estValue:  Math.round(total),
    }))
    toast.success(t.bookingConfirmed)
    setBookingShop(null)
  }

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      {/* Page heading */}
      <div className="w-full max-w-5xl flex items-center gap-3">
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.basket}</h1>
        {basket.length > 0 && (
          <span className="inline-flex items-center justify-center w-6 h-6 bg-[var(--green)] border-[1.5px] border-[var(--ink)] font-data text-[11px] font-bold text-[#062040]">
            {basket.length}
          </span>
        )}
      </div>

      {basket.length === 0 ? (
        /* Empty state spans both columns on desktop */
        <Card className="w-full max-w-5xl md:col-span-2 flex flex-col items-center py-10 gap-2">
          <p className="font-body text-[15px] text-[var(--ink-3)] m-0 text-center">{t.basketEmpty}</p>
        </Card>
      ) : (
        /* ── 2-column grid ─────────────────────────────────────────────── */
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* LEFT COLUMN — basket items + total (sticky on desktop) */}
          <div className="flex flex-col gap-3 md:sticky md:top-4">
            {basket.map(item => (
              <Card
                key={item.id}
                className={`flex flex-col gap-3 ${item.skipped ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GradeTag grade={item.grade} />
                    <span className="font-body text-[15px] text-[var(--ink)]">
                      {localName(item.materialType, language)}
                    </span>
                  </div>
                  <span className="font-data text-[13px] text-[var(--green)] font-bold">
                    ฿{(pricePerKg(item.materialType, item.grade) * (item.weight ?? 0)).toFixed(2)}
                  </span>
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
                  <span className="font-data text-[11px] text-[var(--ink-3)]">
                    ฿{pricePerKg(item.materialType, item.grade).toFixed(2)}/kg
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={item.skipped ? 'primary' : 'secondary'}
                    onClick={() => dispatch(toggleSkip(item.id))}
                  >
                    {item.skipped ? 'Unskip' : t.skipItem}
                  </Button>
                  <Button variant="ghost" onClick={() => dispatch(removeFromBasket(item.id))}>
                    {t.removeItem}
                  </Button>
                </div>
              </Card>
            ))}

            {/* Total + clear + GPS */}
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-data text-[12px] text-[var(--ink-3)] uppercase tracking-widest">{t.basketTotal}</span>
                <span className="font-brand text-[22px] text-[var(--green)]">฿{total.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                {/* Toggle button — mobile only */}
                <Button
                  variant="primary"
                  fullWidth
                  className="md:hidden"
                  onClick={() => setShowRoute(r => !r)}
                >
                  {showRoute ? '▲' : '▼'} {t.findRoute}
                </Button>
                {/* On desktop the route panel is always visible — show label only */}
                <span className="hidden md:inline-flex items-center font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
                  Route shown →
                </span>
                <Button variant="secondary" onClick={() => dispatch(clearBasket())}>
                  {t.clearBasket}
                </Button>
              </div>
              {/* GPS locate */}
              <button
                onClick={gps.request}
                disabled={gps.loading}
                className="font-data text-[11px] text-[var(--green)] uppercase tracking-widest bg-transparent border-none cursor-pointer disabled:opacity-50 text-left"
              >
                {gps.loading ? '...' : gps.lat ? `GPS: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : '+ ' + t.useMyLocation}
              </button>
            </Card>
          </div>

          {/* RIGHT COLUMN — route planner */}
          <div className="flex flex-col gap-3">
            {/* Always visible on desktop */}
            <div className="hidden md:flex flex-col gap-3">
              <RoutePlannerPanel
                routeMode={routeMode}
                setRouteMode={setRouteMode}
                single={single}
                multi={multi}
                unmatched={unmatched}
                materials={materials}
                language={language}
                t={t}
                openMaps={openMaps}
                onBook={handleBookClick}
              />
            </div>

            {/* Mobile: toggle-controlled */}
            {showRoute && (
              <div className="md:hidden flex flex-col gap-3">
                <RoutePlannerPanel
                  routeMode={routeMode}
                  setRouteMode={setRouteMode}
                  single={single}
                  multi={multi}
                  unmatched={unmatched}
                  materials={materials}
                  language={language}
                  t={t}
                  openMaps={openMaps}
                  onBook={handleBookClick}
                />
              </div>
            )}
          </div>

        </div>
      )}

      {/* Booking confirmation modal */}
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
