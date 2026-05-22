import { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

export function useBookingGroup() {
  const session = useSelector(s => s.user.session)
  const [groupId,       setGroupId]       = useState(null)
  const [groupBookings, setGroupBookings] = useState([])  // { shopId, shopName, status, scheduledFor }
  const [secondsLeft,   setSecondsLeft]   = useState(null)
  const [phase,         setPhase]         = useState('idle')  // idle | waiting | complete | timeout
  const timerRef = useRef(null)
  const subRef   = useRef(null)

  // Create the booking group and associated bookings
  const createGroup = useCallback(async (shopSlots, activeItems) => {
    // shopSlots: [{ shop, scheduledFor: Date, materials: [...] }]
    if (!session?.user?.id || shopSlots.length === 0) return null

    // 1. Create the booking_group row
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const { data: group, error: gErr } = await supabase
      .from('booking_groups')
      .insert({ seller_id: session.user.id, expires_at: expiresAt })
      .select()
      .single()
    if (gErr || !group) return null

    const gid = group.id
    setGroupId(gid)
    setPhase('waiting')
    setSecondsLeft(600)  // 10 minutes

    // 2. Insert one booking per shop
    for (const slot of shopSlots) {
      const slotItems = activeItems.filter(i =>
        (slot.materials ?? []).includes(i.materialType)
      )
      if (slotItems.length === 0) continue
      const groups = {}
      slotItems.forEach(item => {
        if (!groups[item.materialType]) groups[item.materialType] = { weight_kg: 0 }
        groups[item.materialType].weight_kg += item.weight ?? 0
      })
      const rows = Object.entries(groups).map(([material_type, { weight_kg }]) => ({
        shop_id:          slot.shop.id,
        seller_id:        session.user.id,
        material_type,
        weight_kg,
        status:           'searching',
        pickup_mode:      'onDemand',
        pickup_lat:       null,
        pickup_lng:       null,
        booking_group_id: gid,
        scheduled_for:    slot.scheduledFor.toISOString(),
        expires_at:       expiresAt,
      }))
      await supabase.from('bookings').insert(rows)
    }

    // 3. Build initial groupBookings state
    setGroupBookings(shopSlots.map(s => ({
      shopId:       s.shop.id,
      shopName:     s.shop.name,
      status:       'searching',
      scheduledFor: s.scheduledFor,
    })))

    return gid
  }, [session])

  // Subscribe to realtime updates for bookings in this group
  useEffect(() => {
    if (!groupId) return

    async function subscribe() {
      const { data: existing } = await supabase
        .from('bookings')
        .select('shop_id, status, scheduled_for')
        .eq('booking_group_id', groupId)
      if (existing) {
        setGroupBookings(prev => prev.map(gb => {
          const match = existing.find(b => b.shop_id === gb.shopId)
          return match ? { ...gb, status: match.status } : gb
        }))
      }
    }
    subscribe()

    subRef.current = supabase
      .channel(`booking_group_${groupId}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'bookings',
        filter: `booking_group_id=eq.${groupId}`,
      }, payload => {
        setGroupBookings(prev => prev.map(gb =>
          gb.shopId === payload.new.shop_id
            ? { ...gb, status: payload.new.status }
            : gb
        ))
      })
      .subscribe()

    return () => {
      if (subRef.current) supabase.removeChannel(subRef.current)
    }
  }, [groupId])

  // Countdown timer
  useEffect(() => {
    if (phase !== 'waiting') return
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          setPhase('timeout')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  // Check completion
  useEffect(() => {
    if (phase !== 'waiting' || groupBookings.length === 0) return
    const allDone = groupBookings.every(gb =>
      gb.status === 'accepted' || gb.status === 'rejected' || gb.status === 'timeout'
    )
    const anyAccepted = groupBookings.some(gb => gb.status === 'accepted')
    if (!allDone) return
    async function resolve() {
      if (anyAccepted) {
        setPhase('complete')
      } else {
        setPhase('timeout')
      }
      clearInterval(timerRef.current)
    }
    resolve()
  }, [groupBookings, phase])

  async function cancelGroup() {
    if (!groupId) return
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('booking_group_id', groupId)
    await supabase
      .from('booking_groups')
      .update({ status: 'cancelled' })
      .eq('id', groupId)
    setPhase('idle')
    setGroupId(null)
    setGroupBookings([])
    setSecondsLeft(null)
  }

  function reset() {
    clearInterval(timerRef.current)
    if (subRef.current) supabase.removeChannel(subRef.current)
    setGroupId(null)
    setGroupBookings([])
    setSecondsLeft(null)
    setPhase('idle')
  }

  return { createGroup, groupBookings, secondsLeft, phase, cancelGroup, reset }
}
