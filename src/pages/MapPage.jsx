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

/* ── Custom shop pin using L.divIcon ─────────────────────────── */
function makeShopIcon(matches) {
  if (matches) {
    return L.divIcon({
      className: '',
      iconSize:   [22, 22],
      iconAnchor: [11, 11],
      popupAnchor:[0, -13],
      html: `<span style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px">
               <span class="map-ping" style="position:absolute;inset:0;border-radius:50%;background:#22C55E"></span>
               <span style="position:relative;width:13px;height:13px;border-radius:50%;background:#22C55E;border:1.5px solid #1A1A1A"></span>
             </span>`,
    })
  }
  return L.divIcon({
    className: '',
    iconSize:   [13, 13],
    iconAnchor: [6, 6],
    popupAnchor:[0, -9],
    html: `<span style="display:inline-block;width:13px;height:13px;border-radius:50%;background:#B8B8B8;border:1.5px solid #1A1A1A"></span>`,
  })
}

/* ── Open/closed from shop.opens_at / shop.closes_at (HH:MM UTC+7) */
function isShopOpen(shop) {
  if (!shop.opens_at || !shop.closes_at) return null
  const now  = new Date()
  const utc7 = new Date(now.getTime() + 7 * 3600 * 1000)
  const hhmm = utc7.toISOString().slice(11, 16)
  return hhmm >= shop.opens_at && hhmm < shop.closes_at
}

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
  const t          = useT()
  const language   = useSelector(s => s.user.language)
  const darkMode   = useSelector(s => s.user.darkMode)
  const basket     = useSelector(s => s.waste?.basket ?? [])
  const [filter, setFilter] = useState('all')
  const { shops, loading }  = useShops()
  const gps = useGPS()
  const { request: requestGPS } = gps

  const basketMaterials = new Set(basket.filter(i => !i.skipped).map(i => i.materialType))

  useEffect(() => {
    requestGPS()
  }, [requestGPS])

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
            <div className="flex flex-col gap-2">
              <div className="h-4 w-32 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
              <div className="h-[55vw] max-h-[480px] min-h-[260px] bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
            </div>
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
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url={darkMode
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
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

              {visible.map(shop => {
                const matches = (shop.accepts ?? []).some(a => basketMaterials.has(a))
                const openStatus = isShopOpen(shop)
                return (
                  <Marker key={shop.id} position={[shop.lat, shop.lng]} icon={makeShopIcon(matches)}>
                    <Popup>
                      <div style={{ fontFamily: 'monospace', minWidth: 180 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <strong style={{ fontSize: 14 }}>{shop.name}</strong>
                          {openStatus !== null && (
                            <span style={{ fontSize: 10, padding: '1px 5px', background: openStatus ? '#22C55E' : '#E53E3E', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                              {openStatus ? 'open' : 'closed'}
                            </span>
                          )}
                        </div>
                        {shop.opens_at && shop.closes_at && (
                          <div style={{ fontSize: 11, marginTop: 3, color: '#7A7A7A' }}>
                            {shop.opens_at} – {shop.closes_at}
                          </div>
                        )}
                        {shop.distanceKm != null && (
                          <div style={{ fontSize: 12, marginTop: 4, color: '#555' }}>
                            {shop.distanceKm} {t.kmAway}
                          </div>
                        )}
                        {matches && basketMaterials.size > 0 && (
                          <div style={{ fontSize: 11, marginTop: 4, color: '#0F7A3A', fontWeight: 600 }}>
                            {language === 'th' ? 'รับวัสดุในตะกร้าของคุณ' : 'Accepts your basket items'}
                          </div>
                        )}
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          <em>{t.shopAccepts}:</em>{' '}
                          {(shop.accepts ?? []).map(a => localName(a, language)).join(', ')}
                        </div>
                        <button
                          onClick={() => window.open(`https://maps.google.com/maps?daddr=${shop.lat},${shop.lng}`, '_blank')}
                          style={{ fontSize: 12, color: '#22C55E', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 6, display: 'block' }}
                        >
                          {t.directions} →
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
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
