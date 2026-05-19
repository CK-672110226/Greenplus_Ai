import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ONLINE_WINDOW_MIN  = 5    // "online" = last_seen within 5 min
const WEIGHT_OUTLIER_KG  = 100  // single booking flagged if above this
const RAPID_BOOKING_N    = 3    // bookings from same user within 1 hour
const CANCEL_THRESHOLD   = 2    // cancelled bookings per user per 24h

function minutesAgo(n) {
  return new Date(Date.now() - n * 60_000).toISOString()
}

export function useSystemMonitor() {
  const [shopStatus,    setShopStatus]    = useState({ open: 0, closed: 0, list: [] })
  const [userActivity,  setUserActivity]  = useState({ online: 0, total: 0, list: [] })
  const [driverStatus,  setDriverStatus]  = useState({ online: 0, total: 0, list: [] })
  const [anomalies,     setAnomalies]     = useState([])
  const [loading,       setLoading]       = useState(true)
  const [refreshedAt,   setRefreshedAt]   = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)

    const onlineThreshold = minutesAgo(ONLINE_WINDOW_MIN)
    const hourAgo         = minutesAgo(60)
    const dayAgo          = minutesAgo(24 * 60)

    const [
      { data: shopRows },
      { data: profileRows },
      { data: recentBookings },
      { data: cancelledBookings },
      { data: ghostOnDemand },
      { data: staleGroups },
    ] = await Promise.all([
      // Shop open/closed status
      supabase.from('shops').select('id, name, is_open, owner_id, lat, lng'),
      // All profiles for user/driver activity
      supabase.from('user_profiles').select('id, display_name, role, is_online, is_driver, last_seen'),
      // Recent bookings for rapid-booking detection
      supabase
        .from('bookings')
        .select('id, seller_id, weight_kg, created_at, status, pickup_mode, pickup_lat')
        .gte('created_at', hourAgo),
      // Cancelled bookings in last 24h
      supabase
        .from('bookings')
        .select('id, seller_id, status, created_at')
        .eq('status', 'cancelled')
        .gte('created_at', dayAgo),
      // On-demand bookings with no GPS
      supabase
        .from('bookings')
        .select('id, seller_id, created_at, pickup_mode')
        .eq('pickup_mode', 'onDemand')
        .is('pickup_lat', null)
        .gte('created_at', dayAgo),
      // Booking groups still "searching" past their expiry
      supabase
        .from('booking_groups')
        .select('id, seller_id, created_at, expires_at')
        .eq('status', 'searching')
        .lt('expires_at', new Date().toISOString()),
    ])

    // ── Shop status ──────────────────────────────────────────
    const shops = shopRows ?? []
    setShopStatus({
      open:   shops.filter(s => s.is_open).length,
      closed: shops.filter(s => !s.is_open).length,
      list:   shops,
    })

    // ── User / Driver activity ───────────────────────────────
    const profiles = profileRows ?? []
    const regularUsers = profiles.filter(p => p.role === 'user')
    const drivers      = profiles.filter(p => p.is_driver || p.role === 'buyer')

    setUserActivity({
      online: regularUsers.filter(p => p.last_seen >= onlineThreshold).length,
      total:  regularUsers.length,
      list:   regularUsers.sort((a, b) => (b.last_seen ?? '').localeCompare(a.last_seen ?? '')),
    })
    setDriverStatus({
      online: drivers.filter(p => p.is_online).length,
      total:  drivers.length,
      list:   drivers,
    })

    // ── Anomaly detection ─────────────────────────────────────
    const flags = []

    // 1. Rapid bookings (>N from same user in 1 hour)
    const bookings   = recentBookings ?? []
    const byUser     = {}
    bookings.forEach(b => {
      byUser[b.seller_id] = (byUser[b.seller_id] ?? 0) + 1
    })
    Object.entries(byUser).forEach(([uid, count]) => {
      if (count > RAPID_BOOKING_N) {
        const p = profiles.find(x => x.id === uid)
        flags.push({
          id:       `rapid-${uid}`,
          type:     'rapid_booking',
          severity: 'high',
          uid,
          label:    `${p?.display_name ?? uid.slice(0, 8)} — ${count} bookings in 1 hr`,
        })
      }
    })

    // 2. Weight outliers
    bookings.forEach(b => {
      if ((b.weight_kg ?? 0) > WEIGHT_OUTLIER_KG) {
        const p = profiles.find(x => x.id === b.seller_id)
        flags.push({
          id:       `weight-${b.id}`,
          type:     'weight_outlier',
          severity: 'medium',
          uid:      b.seller_id,
          label:    `${p?.display_name ?? '—'} — ${b.weight_kg} kg in one booking`,
        })
      }
    })

    // 3. High cancellation rate
    const cancelByUser = {}
    ;(cancelledBookings ?? []).forEach(b => {
      cancelByUser[b.seller_id] = (cancelByUser[b.seller_id] ?? 0) + 1
    })
    Object.entries(cancelByUser).forEach(([uid, count]) => {
      if (count > CANCEL_THRESHOLD) {
        const p = profiles.find(x => x.id === uid)
        flags.push({
          id:       `cancel-${uid}`,
          type:     'high_cancellation',
          severity: 'medium',
          uid,
          label:    `${p?.display_name ?? uid.slice(0, 8)} — cancelled ${count} times in 24 hr`,
        })
      }
    })

    // 4. Ghost on-demand (no GPS coordinates)
    ;(ghostOnDemand ?? []).forEach(b => {
      const p = profiles.find(x => x.id === b.seller_id)
      flags.push({
        id:       `ghost-${b.id}`,
        type:     'ghost_ondemand',
        severity: 'low',
        uid:      b.seller_id,
        label:    `${p?.display_name ?? '—'} — on-demand booking with no GPS`,
      })
    })

    // 5. Stale booking groups (timeout not resolved)
    ;(staleGroups ?? []).forEach(g => {
      flags.push({
        id:       `stale-${g.id}`,
        type:     'stale_group',
        severity: 'low',
        uid:      g.seller_id,
        label:    `Booking group expired without resolution (created ${new Date(g.created_at).toLocaleTimeString()})`,
      })
    })

    setAnomalies(flags)
    setRefreshedAt(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    async function init() { await refresh() }
    init()
    const id = setInterval(() => { refresh() }, 30_000)  // auto-refresh every 30s
    return () => clearInterval(id)
  }, [refresh])

  return { shopStatus, userActivity, driverStatus, anomalies, loading, refreshedAt, refresh, onlineThresholdMs: ONLINE_WINDOW_MIN * 60_000 }
}
