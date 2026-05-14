import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useT } from '../hooks/useT'
import { WASTE_ITEMS, localName } from '../data/wasteItems'
import { useShops } from '../hooks/useShops'
import { useGPS } from '../hooks/useGPS'
import { useSelector } from 'react-redux'
import 'leaflet/dist/leaflet.css'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon   from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
})

const userIcon = new L.Icon({
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
  iconRetinaUrl: markerIcon2x,
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
  className:     'leaflet-user-icon',
})

const MATERIAL_FILTERS = ['all', ...Object.keys(WASTE_ITEMS)]
const DEFAULT_CENTER   = [18.7883, 98.9853]

function ChangeView({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { animate: true, duration: 1 })
  }, [center, zoom, map])
  return null
}

const pillBase     = 'font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] transition-colors cursor-pointer bg-transparent'
const pillActive   = 'bg-[var(--ink)] text-[var(--paper)]'
const pillInactive = 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]'

export function MapPage() {
  const t        = useT()
  const language = useSelector(s => s.user.language)
  const darkMode = useSelector(s => s.user.darkMode)
  const [filter, setFilter] = useState('all')
  const { shops, loading }  = useShops()
  const gps = useGPS()

  useEffect(() => {
    gps.request()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const userCenter = gps.lat && gps.lng ? [gps.lat, gps.lng] : null
  const mapCenter  = userCenter ?? DEFAULT_CENTER
  const mapZoom    = userCenter ? 14 : 13

  const visible = (filter === 'all' ? shops : shops.filter(s => (s.accepts ?? []).includes(filter)))
    .filter(s => s.lat != null && s.lng != null)

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.mapTitle ?? t.map}</h1>

      {/* GPS status strip */}
      <div className="w-full max-w-5xl flex items-center gap-3">
        {gps.loading && (
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest animate-pulse">
            Getting location…
          </span>
        )}
        {!gps.loading && !userCenter && (
          <>
            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
              {gps.error ? 'Location unavailable' : 'Location not set'}
            </span>
            <button
              onClick={gps.request}
              className="font-data text-[11px] uppercase tracking-widest px-3 py-1 border-[1.5px] border-[var(--ink)] bg-transparent hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors cursor-pointer"
            >
              {t.useMyLocation ?? 'Use my location'}
            </button>
          </>
        )}
        {userCenter && (
          <span className="font-data text-[11px] text-[var(--green-ink)] uppercase tracking-widest">
            ✓ {t.useMyLocation ?? 'Location acquired'}
          </span>
        )}
      </div>

      {/* Grid: sidebar filters on desktop, flat row on mobile */}
      <div className="w-full max-w-5xl flex flex-col md:grid md:grid-cols-[180px_1fr] md:gap-6 md:items-start gap-5">

        {/* Desktop filter sidebar */}
        <aside className="hidden md:flex md:flex-col gap-1.5 sticky top-4 self-start">
          <p className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest m-0">Material</p>
          {MATERIAL_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[pillBase, 'w-full px-3 py-1.5 text-left', filter === f ? pillActive : pillInactive].join(' ')}
            >
              {f === 'all' ? t.filterAll : localName(f, language)}
            </button>
          ))}
        </aside>

        {/* Right column — mobile chips + map */}
        <div className="flex flex-col gap-4">

          {/* Mobile filter chips */}
          <div className="md:hidden flex gap-2 flex-wrap">
            {MATERIAL_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[pillBase, 'px-3 py-1', filter === f ? pillActive : pillInactive].join(' ')}
              >
                {f === 'all' ? t.filterAll : localName(f, language)}
              </button>
            ))}
          </div>

          {loading && (
            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest animate-pulse">
              Loading shops…
            </span>
          )}

          {/* Map container */}
          <div
            className="w-full h-[55vw] max-h-[480px] min-h-[260px] border-[1.5px] border-[var(--ink)]"
            style={{ position: 'relative', zIndex: 0, overflow: 'hidden' }}
          >
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '100%' }}
            >
              <ChangeView center={userCenter} zoom={15} />
              <TileLayer
                attribution={darkMode
                  ? '&copy; <a href="https://carto.com/">CARTO</a>'
                  : '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'}
                url={darkMode
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
              />

              {userCenter && (
                <Marker position={userCenter} icon={userIcon}>
                  <Popup>
                    <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
                      {language === 'th' ? 'คุณอยู่ที่นี่' : 'You are here'}
                    </div>
                  </Popup>
                </Marker>
              )}

              {visible.map(shop => (
                <Marker key={shop.id} position={[shop.lat, shop.lng]}>
                  <Popup>
                    <div style={{ fontFamily: 'monospace', minWidth: 180 }}>
                      <strong style={{ fontSize: 14 }}>{shop.name}</strong>
                      {shop.distanceKm != null && (
                        <div style={{ fontSize: 12, marginTop: 4, color: '#555' }}>
                          {shop.distanceKm} {t.kmAway}
                        </div>
                      )}
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        <em>{t.shopAccepts}:</em>{' '}
                        {(shop.accepts ?? []).map(a => localName(a, language)).join(', ')}
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: 'var(--green)', display: 'block', marginTop: 6 }}
                      >
                        {t.directions}
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {!loading && visible.length === 0 && (
            <p className="font-body text-[15px] text-[var(--ink-3)]">{t.noShopsNear}</p>
          )}
        </div>
      </div>
    </main>
  )
}
