import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

export function useDriverAssignment() {
  const session = useSelector(s => s.user.session)
  const [myAssignments, setMyAssignments] = useState([])

  // Shop: list all is_driver users with load count for a given date
  const fetchAvailableDrivers = useCallback(async (date) => {
    const { data: drivers } = await supabase
      .from('user_profiles')
      .select('id, display_name, driver_vehicle')
      .eq('is_driver', true)
    if (!drivers?.length) return []

    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
    const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999)

    const { data: slots } = await supabase
      .from('bookings')
      .select('assigned_driver_id')
      .in('driver_assignment_status', ['invited', 'accepted'])
      .gte('scheduled_for', dayStart.toISOString())
      .lte('scheduled_for', dayEnd.toISOString())

    const loadMap = {}
    ;(slots ?? []).forEach(b => {
      if (b.assigned_driver_id) loadMap[b.assigned_driver_id] = (loadMap[b.assigned_driver_id] ?? 0) + 1
    })

    return drivers.map(d => ({ ...d, todayLoad: loadMap[d.id] ?? 0 }))
  }, [])

  // Shop: assign driver to a booking (with ±30-min conflict guard)
  const assignDriver = useCallback(async (bookingId, driverId, scheduledFor) => {
    if (scheduledFor) {
      const t    = new Date(scheduledFor)
      const tMin = new Date(t.getTime() - 30 * 60_000).toISOString()
      const tMax = new Date(t.getTime() + 30 * 60_000).toISOString()

      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id')
        .eq('assigned_driver_id', driverId)
        .in('driver_assignment_status', ['invited', 'accepted'])
        .neq('id', bookingId)
        .gte('scheduled_for', tMin)
        .lte('scheduled_for', tMax)

      if (conflicts?.length) return { conflict: true, error: null }
    }

    const { error } = await supabase
      .from('bookings')
      .update({ assigned_driver_id: driverId, driver_assignment_status: 'invited' })
      .eq('id', bookingId)

    return { conflict: false, error }
  }, [])

  // Driver: accept or reject an assignment
  const respondToAssignment = useCallback(async (bookingId, accept) => {
    const { error } = await supabase
      .from('bookings')
      .update({ driver_assignment_status: accept ? 'accepted' : 'rejected' })
      .eq('id', bookingId)
    return { ok: !error, error: error?.message ?? null }
  }, [])

  // Driver: load + subscribe to own assignments
  useEffect(() => {
    if (!session?.user?.id) return
    let channel

    async function load() {
      const { data } = await supabase
        .from('bookings')
        .select('id, material_type, weight_kg, scheduled_for, driver_assignment_status, status, pickup_lat, pickup_lng, shops(id, name)')
        .eq('assigned_driver_id', session.user.id)
        .in('driver_assignment_status', ['invited', 'accepted'])
        .order('scheduled_for', { ascending: true })
      setMyAssignments(data ?? [])
    }

    load()

    channel = supabase
      .channel(`driver-assign-${session.user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `assigned_driver_id=eq.${session.user.id}`,
      }, () => { load() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session])

  return { fetchAvailableDrivers, assignDriver, respondToAssignment, myAssignments }
}
