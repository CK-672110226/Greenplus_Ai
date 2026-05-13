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

  const shopsWithDist = SHOPS.map(s => ({ ...s, dist: distOf(s, userLat, userLng) }))

  const single = shopsWithDist
    .filter(s => materials.every(m => s.accepts.includes(m)))
    .sort((a, b) => a.dist - b.dist)

  const stopsMap = new Map()
  const unmatched = []
  materials.forEach(mat => {
    const shop = shopsWithDist
      .filter(s => s.accepts.includes(mat))
      .sort((a, b) => a.dist - b.dist)[0]
    if (!shop) { unmatched.push(mat); return }
    if (!stopsMap.has(shop.id)) stopsMap.set(shop.id, { shop, materials: [] })
    stopsMap.get(shop.id).materials.push(mat)
  })
  const multi = [...stopsMap.values()].sort((a, b) => a.shop.dist - b.shop.dist)

  return { single, multi, unmatched, materials }
}

export function BasketPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const basket   = useSelector(s => s.waste.basket)
  const language = useSelector(s => s.user.language)

  const [routeMode, setRouteMode] = useState('single')
  const [showRoute, setShowRoute] = useState(false)
  const gps = useGPS()

  function handleBook(shop) {
    const active = basket.filter(i => !i.skipped)
    dispatch(addBooking({
      shopId:    shop.id,
      shopName:  shop.name,
      seller:    'me',
      materials: [...new Set(active.map(i => i.materialType))],
      totalKg:   active.reduce((s, i) => s + (i.weight ?? 0), 0),
      estValue:  Math.round(active.reduce((s, i) => s + pricePerKg(i.materialType, i.grade) * (i.weight ?? 0), 0)),
    }))
    toast.success(t.bookingConfirmed)
  }

  const total = basket
    .filter(i => !i.skipped)
    .reduce((sum, i) => sum + pricePerKg(i.materialType, i.grade) * (i.weight ?? 0), 0)

  const { single, multi, unmatched, materials } = computeRoutes(basket, gps.lat, gps.lng)

  function openMaps(shop) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`, '_blank')
  }

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <div className="w-full max-w-sm flex items-center gap-3">
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.basket}</h1>
        {basket.length > 0 && (
          <span className="inline-flex items-center justify-center w-6 h-6 bg-[var(--green)] border-[1.5px] border-[var(--ink)] font-data text-[11px] font-bold text-[#062040]">
            {basket.length}
          </span>
        )}
      </div>

      {basket.length === 0 ? (
        <Card className="w-full max-w-sm flex flex-col items-center py-10 gap-2">
          <p className="font-body text-[15px] text-[var(--ink-3)] m-0 text-center">{t.basketEmpty}</p>
        </Card>
      ) : (
        <div className="w-full max-w-sm flex flex-col gap-3">
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

          {/* Total + clear */}
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-data text-[12px] text-[var(--ink-3)] uppercase tracking-widest">{t.basketTotal}</span>
              <span className="font-brand text-[22px] text-[var(--green)]">฿{total.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" fullWidth onClick={() => setShowRoute(r => !r)}>
                {showRoute ? '▲' : '▼'} {t.findRoute}
              </Button>
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

          {/* Route planner */}
          {showRoute && materials.length > 0 && (
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
                        <Button variant="primary" onClick={() => handleBook(shop)}>{t.bookAppointment}</Button>
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
                        <Button variant="primary" onClick={() => handleBook(stop.shop)}>{t.bookAppointment}</Button>
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
          )}
        </div>
      )}
    </main>
  )
}
