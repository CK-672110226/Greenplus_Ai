import L from 'leaflet'
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import { useSmartRoute } from '../hooks/useSmartRoute'

// Public OSRM demo — replace with a self-hosted instance or paid API for production
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'

async function fetchRoadGeometry(waypoints) {
  if (waypoints.length < 2) return null
  // OSRM expects lon,lat pairs separated by semicolons
  const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';')
  try {
    const res = await fetch(`${OSRM_BASE}/${coords}?overview=full&geometries=geojson`)
    if (!res.ok) return null
    const json = await res.json()
    const coords2 = json?.routes?.[0]?.geometry?.coordinates
    if (!coords2) return null
    // GeoJSON is [lng, lat]; Leaflet needs [lat, lng]
    return coords2.map(([lng, lat]) => [lat, lng])
  } catch {
    return null
  }
}

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function KpiBox({ label, value }) {
  return (
    <div className="border-[1.5px] border-[var(--ink-4)] p-3 flex flex-col gap-0.5">
      <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{label}</span>
      <span className="font-brand text-[20px] text-[var(--ink)] leading-none">{value}</span>
    </div>
  )
}

export default function SmartRouteMap() {
  const { stops, shopLocation, stats, loading } = useSmartRoute()
  const [roadGeometry, setRoadGeometry] = useState(null)

  const center = shopLocation
    ? [shopLocation.lat, shopLocation.lng]
    : [18.7883, 98.9853]

  // Straight-line fallback — used while OSRM loads or if it fails
  const straightLine = shopLocation
    ? [[shopLocation.lat, shopLocation.lng], ...stops.map(s => [s.pickup_lat, s.pickup_lng])]
    : stops.map(s => [s.pickup_lat, s.pickup_lng])

  useEffect(() => {
    if (stops.length === 0) return
    let cancelled = false
    // straightLine is derived from stops+shopLocation — both are deps
    const waypoints = shopLocation
      ? [[shopLocation.lat, shopLocation.lng], ...stops.map(s => [s.pickup_lat, s.pickup_lng])]
      : stops.map(s => [s.pickup_lat, s.pickup_lng])
    fetchRoadGeometry(waypoints).then(geo => {
      if (!cancelled) setRoadGeometry(geo)
    })
    return () => { cancelled = true }
  }, [stops, shopLocation])

  const routePositions = roadGeometry ?? straightLine

  if (loading) {
    return (
      <div className="w-full max-w-5xl flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="border-[1.5px] border-[var(--ink-4)] p-3 h-16 animate-pulse bg-[var(--paper-2)]" />
          ))}
        </div>
        <div className="border-[1.5px] border-[var(--ink)] animate-pulse bg-[var(--paper-2)]" style={{ height: 340 }} />
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="border-[1.5px] border-[var(--ink-4)] h-12 animate-pulse bg-[var(--paper-2)]" />
          ))}
        </div>
      </div>
    )
  }

  if (stops.length === 0) {
    return (
      <div className="w-full max-w-5xl flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <KpiBox label="Stops"    value={0} />
          <KpiBox label="Total kg" value="0.0 kg" />
          <KpiBox label="Distance" value="0 km" />
        </div>
        <div
          className="border-[1.5px] border-[var(--ink)] flex items-center justify-center"
          style={{ height: 340 }}
        >
          <span className="font-data text-[12px] text-[var(--ink-3)]">No accepted bookings for today</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4">

      <div className="grid grid-cols-3 gap-3">
        <KpiBox label="Stops"    value={stats.stopCount} />
        <KpiBox label="Total kg" value={`${stats.totalKg.toFixed(1)} kg`} />
        <KpiBox label="Distance" value={`${stats.totalDistanceKm} km`} />
      </div>

      <div className="border-[1.5px] border-[var(--ink)] overflow-hidden" style={{ height: 340 }}>
        <MapContainer
          center={center}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {shopLocation && (
            <Marker position={[shopLocation.lat, shopLocation.lng]}>
              <Popup>
                <span className="font-body text-[13px]">{shopLocation.name ?? 'Your Shop'}</span>
              </Popup>
            </Marker>
          )}

          {stops.map((stop, i) => (
            <Marker key={stop.id} position={[stop.pickup_lat, stop.pickup_lng]}>
              <Popup>
                <div className="flex flex-col gap-0.5">
                  <span className="font-body text-[13px] font-semibold">Stop #{i + 1}</span>
                  <span className="font-data text-[11px] text-[var(--ink-3)]">
                    {stop.seller?.display_name ?? 'Seller'}
                  </span>
                  <span className="font-data text-[11px]">
                    {(stop.materials ?? []).join(', ')}
                  </span>
                  <span className="font-data text-[11px]">{stop.total_kg ?? 0} kg</span>
                </div>
              </Popup>
            </Marker>
          ))}

          {stops.length > 0 && (
            <Polyline
              positions={routePositions}
              color="var(--green)"
              weight={roadGeometry ? 4 : 2}
              dashArray={roadGeometry ? undefined : '6 6'}
              opacity={roadGeometry ? 1 : 0.5}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)]">
          TODAY'S ROUTE
        </span>

        {stops.map((stop, i) => (
          <div
            key={stop.id}
            className="flex items-center gap-3 border-[1.5px] border-[var(--ink-4)] px-3 py-2"
          >
            <span className="w-6 h-6 bg-[var(--green)] border-[1.5px] border-[var(--ink)] flex items-center justify-center font-data text-[11px] text-[var(--ink)] flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-body text-[13px] text-[var(--ink)] truncate block">
                {stop.seller?.display_name ?? 'Seller'}
              </span>
              <span className="font-data text-[10px] text-[var(--ink-3)]">
                {(stop.materials ?? []).join(', ')} · {stop.total_kg ?? 0} kg
              </span>
            </div>
            <span className="font-data text-[11px] text-[var(--ink-3)] whitespace-nowrap flex-shrink-0">
              +{stop.distanceFromPrev?.toFixed(1)} km
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}
