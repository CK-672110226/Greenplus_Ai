// Mock shop data — Tambon Suthep / CMU pilot area
// Replace with live Supabase query once M5 (Smart Map) is complete
export const MOCK_SHOPS = [
  {
    id: 'shop-1',
    name: 'ร้านขยะหลัง มช.',
    name_en: 'CMU Rear Scrap Shop',
    lat: 18.8022,
    lng: 98.9534,
    accepts: ['pet_bottle_clear', 'aluminum_can', 'cardboard', 'newspaper', 'mixed_plastic'],
  },
  {
    id: 'shop-2',
    name: 'วงษ์พาณิชย์',
    name_en: 'Wongpanich Scrap',
    lat: 18.7984,
    lng: 98.9612,
    accepts: ['aluminum_can', 'copper', 'mixed_plastic', 'pet_bottle_clear'],
  },
  {
    id: 'shop-3',
    name: 'Recycle Station ตลาดจริงใจ',
    name_en: 'Jingjai Market Recycle',
    lat: 18.8067,
    lng: 98.9501,
    accepts: ['pet_bottle_clear', 'cardboard', 'newspaper', 'glass'],
  },
  {
    id: 'shop-4',
    name: 'ปั๊มบางจาก สุเทพ',
    name_en: 'Bangchak Suthep',
    lat: 18.7945,
    lng: 98.9478,
    accepts: ['cooking_oil'],
  },
]

// Haversine distance in km
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2)
}

// Default origin: CMU rear gate (pilot area center)
const DEFAULT_LAT = 18.7963
const DEFAULT_LNG = 98.9536

export function shopsWithDistance(userLat = DEFAULT_LAT, userLng = DEFAULT_LNG) {
  return MOCK_SHOPS.map(s => ({
    ...s,
    distance: distanceKm(userLat, userLng, s.lat, s.lng),
  })).sort((a, b) => a.distance - b.distance)
}

// Single-shop mode: shops that accept every non-skipped item
export function singleShopMatches(items, userLat, userLng) {
  const active = items.filter(i => !i.skipped)
  if (!active.length) return []
  return shopsWithDistance(userLat, userLng).filter(shop =>
    active.every(item => shop.accepts.includes(item.materialType))
  )
}

// Multi-stop mode: greedy nearest-first assignment per item
export function multiStopRoute(items, userLat, userLng) {
  const active = items.filter(i => !i.skipped)
  if (!active.length) return []
  const shops = shopsWithDistance(userLat, userLng)
  const stopMap = {}

  for (const item of active) {
    const shop = shops.find(s => s.accepts.includes(item.materialType))
    if (!shop) continue
    if (!stopMap[shop.id]) stopMap[shop.id] = { shop, items: [] }
    stopMap[shop.id].items.push(item)
  }

  return Object.values(stopMap).sort((a, b) => a.shop.distance - b.shop.distance)
}
