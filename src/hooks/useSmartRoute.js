import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { haversineKm } from '../utils/haversine'

export function useSmartRoute() {
  const session = useSelector(s => s.user.session)
  const hasSession = Boolean(session?.user?.id)

  const [stops, setStops]               = useState([])
  const [shopLocation, setShopLocation] = useState(null)
  const [stats, setStats]               = useState({ totalKg: 0, totalValue: 0, totalDistanceKm: 0, stopCount: 0 })
  const [loading, setLoading]           = useState(hasSession)
  const [error, setError]               = useState(null)

  useEffect(() => {
    if (!session?.user?.id) return

    async function load() {
      setLoading(true)
      try {
        const { data: shopData } = await supabase
          .from('shops')
          .select('id, lat, lng, name')
          .eq('owner_id', session.user.id)
          .maybeSingle()

        if (!shopData || shopData.lat == null || shopData.lng == null) return

        const shopLat = shopData.lat
        const shopLng = shopData.lng
        setShopLocation({ lat: shopLat, lng: shopLng, name: shopData.name })

        const today = new Date().toISOString().slice(0, 10)
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id, pickup_lat, pickup_lng, total_kg, est_value, materials, seller_id, seller:seller_id(display_name)')
          .eq('shop_id', shopData.id)
          .eq('status', 'accepted')
          .eq('scheduled_date', today)

        if (!bookings?.length) return

        const valid = bookings.filter(b => b.pickup_lat && b.pickup_lng)
        const ordered = nearestNeighborTSP(shopLat, shopLng, valid)

        const totalDistanceKm = computeRouteDistance(shopLat, shopLng, ordered)
        const totalKg         = ordered.reduce((s, b) => s + (b.total_kg ?? 0), 0)
        const totalValue      = ordered.reduce((s, b) => s + (b.est_value ?? 0), 0)

        setStops(ordered)
        setStats({ totalKg, totalValue, totalDistanceKm, stopCount: ordered.length })
      } catch (err) {
        setError(err?.message ?? 'โหลดเส้นทางไม่สำเร็จ')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [session])

  return { stops, shopLocation, stats, loading, error }
}

function nearestNeighborTSP(startLat, startLng, points) {
  const remaining = [...points]
  const route = []
  let curLat = startLat, curLng = startLng
  while (remaining.length) {
    let minDist = Infinity, minIdx = 0
    remaining.forEach((p, i) => {
      const d = haversineKm(curLat, curLng, p.pickup_lat, p.pickup_lng)
      if (d < minDist) { minDist = d; minIdx = i }
    })
    const next = remaining.splice(minIdx, 1)[0]
    route.push({ ...next, distanceFromPrev: minDist })
    curLat = next.pickup_lat
    curLng = next.pickup_lng
  }
  return route
}

function computeRouteDistance(startLat, startLng, stops) {
  let total = 0, curLat = startLat, curLng = startLng
  stops.forEach(s => {
    total += haversineKm(curLat, curLng, s.pickup_lat, s.pickup_lng)
    curLat = s.pickup_lat
    curLng = s.pickup_lng
  })
  return Math.round(total * 10) / 10
}
