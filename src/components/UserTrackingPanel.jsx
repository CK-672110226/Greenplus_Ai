import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { haversineKm } from '../utils/haversine'
import { toast } from 'sonner'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import { useRealtimeLogistics } from '../hooks/useRealtimeLogistics'
import { clearActiveBooking } from '../store/logisticsSlice'

function pinIcon(fill) {
  return new L.DivIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5 0 23.1 12.5 41 12.5 41S25 23.1 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${fill}" stroke="#333" stroke-width="1"/><circle cx="12.5" cy="12.5" r="4.5" fill="rgba(255,255,255,0.75)"/></svg>`,
    iconSize:    [25, 41],
    iconAnchor:  [12, 41],
    popupAnchor: [1, -34],
  })
}

const riderIcon = pinIcon('#22c55e')
const userIcon  = pinIcon('#3b82f6')

function PulsingDot() {
  return (
    <span className="relative inline-flex h-3 w-3 mr-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--orange)] opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--orange)]" />
    </span>
  )
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`font-data text-[20px] bg-transparent border-none cursor-pointer transition-colors ${
            star <= value ? 'text-[var(--green-ink)]' : 'text-[var(--ink-4)]'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export function UserTrackingPanel() {
  const dispatch      = useDispatch()
  const { activeBooking, riderLocation } = useRealtimeLogistics()

  const [ratingValue,   setRatingValue]   = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  const booking = activeBooking
  const status  = booking?.status

  async function handleCancel() {
    if (!booking?.id) return
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id)
    if (error) { toast.error('Failed to cancel'); return }
    dispatch(clearActiveBooking())
    toast('Pickup cancelled')
  }

  function handleDone() {
    dispatch(clearActiveBooking())
  }

  // Nothing to show
  if (!booking || !['searching', 'accepted', 'arrived', 'completed'].includes(status)) {
    return null
  }

  // ── searching ─────────────────────────────────────────────────────────────
  if (status === 'searching') {
    return (
      <div className="border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] p-4 bg-[var(--paper)] mb-4">
        <div className="flex items-center mb-1">
          <PulsingDot />
          <span className="font-data text-[11px] uppercase tracking-wider text-[var(--orange)]">
            Searching for Rider...
          </span>
        </div>
        <p className="font-body text-[13px] text-[var(--ink-2)] mb-4">
          Your basket is ready for pickup.
        </p>
        <button
          className="px-4 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] font-data text-[11px] uppercase tracking-wider cursor-pointer"
          onClick={handleCancel}
        >
          Cancel request
        </button>
      </div>
    )
  }

  // ── accepted ──────────────────────────────────────────────────────────────
  if (status === 'accepted') {
    const hasMap = riderLocation != null && booking.pickup_lat != null

    return (
      <div className="border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] p-4 bg-[var(--paper)] mb-4">
        <div className="font-data text-[11px] uppercase tracking-wider text-[var(--green-ink)] mb-2">
          Rider Found
        </div>
        <div className="font-brand text-[17px] mb-1">
          {booking.buyer_name ?? 'Scrap Collector'} · {booking.buyer_rating != null ? '★'.repeat(Math.round(booking.buyer_rating)) : ''}
        </div>
        {riderLocation && booking.pickup_lat && (
          <div className="font-data text-[11px] text-[var(--ink-3)] mb-3">
            ETA: ~{Math.round(
              (haversineKm(
                riderLocation.lat, riderLocation.lng,
                booking.pickup_lat, booking.pickup_lng
              ) / 30) * 60
            )} minutes
          </div>
        )}

        {hasMap ? (
          <div className="border-[1.5px] border-[var(--ink-4)] mb-4" style={{ height: 180 }}>
            <MapContainer
              center={[booking.pickup_lat, booking.pickup_lng]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              <Marker position={[booking.pickup_lat, booking.pickup_lng]} icon={userIcon}>
                <Popup>Your location</Popup>
              </Marker>
              <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
                <Popup>Rider</Popup>
              </Marker>
            </MapContainer>
          </div>
        ) : (
          <div className="border-[1.5px] border-dashed border-[var(--ink-4)] p-3 mb-4 font-data text-[11px] text-[var(--ink-3)] text-center">
            Map unavailable — waiting for rider GPS
          </div>
        )}

        <button
          className="px-4 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] font-data text-[11px] uppercase tracking-wider cursor-pointer"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    )
  }

  // ── arrived ───────────────────────────────────────────────────────────────
  if (status === 'arrived') {
    return (
      <div className="border-[1.5px] border-[var(--green-ink)] shadow-[2px_2px_0_var(--green-ink)] p-4 bg-[var(--green-soft)] mb-4">
        <div className="font-data text-[11px] uppercase tracking-wider text-[var(--green-ink)] mb-1">
          Rider Has Arrived
        </div>
        <p className="font-body text-[13px] text-[var(--ink-2)]">
          Please meet {booking.buyer_name ?? 'the collector'} at your door.
          They will verify your items.
        </p>
      </div>
    )
  }

  // ── completed ─────────────────────────────────────────────────────────────
  if (status === 'completed') {
    const kg  = booking.actual_weight ?? '?'
    const val = booking.actual_value  ?? '?'
    const alreadyRated = booking.rider_rating != null

    async function handleRatingChange(star) {
      setRatingValue(star)
      if (!booking?.id) return
      const { error } = await supabase
        .from('bookings')
        .update({ rider_rating: star })
        .eq('id', booking.id)
      if (error) {
        toast.error('Failed to save rating')
      } else {
        setRatingSubmitted(true)
        toast.success('Rating saved — thank you!')
      }
    }

    return (
      <div className="border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] p-4 bg-[var(--paper)] mb-4">
        <div className="font-data text-[11px] uppercase tracking-wider text-[var(--green-ink)] mb-1">
          Completed
        </div>
        <p className="font-brand text-[16px] mb-4">
          {kg} kg collected · ฿{val} earned
        </p>

        {!alreadyRated && !ratingSubmitted && (
          <div className="flex flex-col gap-2 mb-4">
            <span className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-3)]">
              Rate your rider
            </span>
            <StarRating value={ratingValue} onChange={handleRatingChange} />
          </div>
        )}

        {(alreadyRated || ratingSubmitted) && (
          <div className="flex flex-col gap-1 mb-4">
            <span className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-3)]">
              Your rating
            </span>
            <span className="font-data text-[18px] text-[var(--green-ink)]">
              {'★'.repeat(alreadyRated ? booking.rider_rating : ratingValue)}
              {'☆'.repeat(5 - (alreadyRated ? booking.rider_rating : ratingValue))}
            </span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            className="px-4 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] font-data text-[11px] uppercase tracking-wider cursor-pointer"
            onClick={() => toast('Receipt coming soon')}
          >
            View receipt
          </button>
          <button
            className="px-4 py-2 bg-[var(--ink)] text-[var(--paper)] font-data text-[11px] uppercase tracking-wider cursor-pointer border-none"
            onClick={handleDone}
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return null
}
