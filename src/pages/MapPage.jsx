import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useT } from '../hooks/useT'
import { WASTE_ITEMS, localName } from '../data/wasteItems'
import { useSelector } from 'react-redux'
import 'leaflet/dist/leaflet.css'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SHOPS = [
  {
    id: 1,
    name: 'เฮียอ้วน รีไซเคิล',
    lat: 18.7955, lng: 98.9963,
    accepts: ['aluminum_can', 'pet_bottle_clear', 'mixed_plastic'],
    distanceKm: 1.2,
  },
  {
    id: 2,
    name: 'แม่น้อย ของเก่า',
    lat: 18.7810, lng: 98.9880,
    accepts: ['copper', 'glass', 'aluminum_can'],
    distanceKm: 2.5,
  },
  {
    id: 3,
    name: 'ร้านบุญชู',
    lat: 18.7920, lng: 98.9780,
    accepts: ['cardboard', 'newspaper', 'mixed_plastic'],
    distanceKm: 0.8,
  },
  {
    id: 4,
    name: 'กรีน พอยท์ CM',
    lat: 18.8040, lng: 98.9950,
    accepts: ['pet_bottle_clear', 'aluminum_can', 'cardboard', 'newspaper', 'copper'],
    distanceKm: 3.1,
  },
  {
    id: 5,
    name: 'ไบโอ ออยล์ CMU',
    lat: 18.7991, lng: 98.9528,
    accepts: ['cooking_oil'],
    distanceKm: 5.6,
  },
]

const MATERIAL_FILTERS = ['all', ...Object.keys(WASTE_ITEMS)]

export function MapPage() {
  const t           = useT()
  const language    = useSelector(s => s.user.language)
  const [filter, setFilter] = useState('all')

  const visible = filter === 'all'
    ? SHOPS
    : SHOPS.filter(s => s.accepts.includes(filter))

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.mapTitle ?? t.map}</h1>

      {/* Filter bar */}
      <div className="w-full max-w-2xl flex gap-2 flex-wrap">
        {MATERIAL_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              'px-3 py-1 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)]',
              filter === f
                ? 'bg-[var(--ink)] text-[var(--paper)]'
                : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]',
            ].join(' ')}
          >
            {f === 'all' ? t.filterAll : localName(f, language)}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="w-full max-w-2xl" style={{ height: 420, border: '1.5px solid var(--ink)' }}>
        <MapContainer
          center={[18.7883, 98.9853]}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
    </main>
  )
}
