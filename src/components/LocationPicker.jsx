import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon   from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
})

function MapClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function LocationPicker({ lat = 18.7883, lng = 98.9853, onChange }) {
  return (
    <div>
      <div className="border-[1.5px] border-[var(--ink)]" style={{ height: 280 }}>
        <MapContainer center={[lat, lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='© <a href="https://carto.com">CARTO</a>'
          />
          <Marker position={[lat, lng]} />
          <MapClickHandler onChange={onChange} />
        </MapContainer>
      </div>
      <p className="font-data text-[10px] text-[var(--ink-3)] mt-1 m-0">
        Tap the map to move your shop pin. Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
      </p>
    </div>
  )
}
