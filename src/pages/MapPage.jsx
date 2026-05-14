import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useT } from '../hooks/useT'
import { WASTE_ITEMS, localName } from '../data/wasteItems'
import { SHOPS } from '../data/shops'
import { useSelector } from 'react-redux'
import 'leaflet/dist/leaflet.css'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const MATERIAL_FILTERS = ['all', ...Object.keys(WASTE_ITEMS)]

const pillBase = 'font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] transition-colors'
const pillActive = 'bg-[var(--ink)] text-[var(--paper)]'
const pillInactive = 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]'

export function MapPage() {
  const t        = useT()
  const language = useSelector(s => s.user.language)
  const darkMode = useSelector(s => s.user.darkMode)
  const [filter, setFilter] = useState('all')

  const visible = filter === 'all'
    ? SHOPS
    : SHOPS.filter(s => s.accepts.includes(filter))

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.mapTitle ?? t.map}</h1>

      {/* Grid: sidebar filters on desktop, flat row on mobile */}
      <div className="w-full max-w-5xl flex flex-col md:grid md:grid-cols-[180px_1fr] md:gap-6 md:items-start gap-5">

        {/* Desktop filter sidebar */}
        <aside className="hidden md:flex md:flex-col gap-1.5 sticky top-4 self-start">
          <p className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest m-0">Material</p>
          {MATERIAL_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                pillBase,
                'w-full px-3 py-1.5 text-left',
                filter === f ? pillActive : pillInactive,
              ].join(' ')}
            >
              {f === 'all' ? t.filterAll : localName(f, language)}
            </button>
          ))}
        </aside>

        {/* Mobile filter bar */}
        <div className="md:hidden flex gap-2 flex-wrap">
          {MATERIAL_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                pillBase,
                'px-3 py-1',
                filter === f ? pillActive : pillInactive,
              ].join(' ')}
            >
              {f === 'all' ? t.filterAll : localName(f, language)}
            </button>
          ))}
        </div>

        {/* Map + empty state — right column on desktop */}
        <div className="flex flex-col gap-4">
          <div className="w-full h-[55vw] max-h-[480px] min-h-[260px] border-[1.5px] border-[var(--ink)]">
            <MapContainer
              center={[18.7883, 98.9853]}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution={darkMode
                  ? '&copy; <a href="https://carto.com/">CARTO</a>'
                  : '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'}
                url={darkMode
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
              />
              {visible.map(shop => (
                <Marker key={shop.id} position={[shop.lat, shop.lng]}>
                  <Popup>
                    <div style={{ fontFamily: 'var(--font-data, monospace)', minWidth: 180 }}>
                      <strong style={{ fontSize: 14 }}>{shop.name}</strong>
                      <div style={{ fontSize: 12, marginTop: 4, color: '#555' }}>
                        {shop.distanceKm} {t.kmAway}
                      </div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        <em>{t.shopAccepts}:</em>{' '}
                        {shop.accepts.map(a => localName(a, language)).join(', ')}
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

          {visible.length === 0 && (
            <p className="font-body text-[15px] text-[var(--ink-3)]">{t.noShopsNear}</p>
          )}
        </div>

      </div>
    </main>
  )
}
