import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

export function useMyBookings({ limit = 10 } = {}) {
  const session  = useSelector(s => s.user.session)
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const uid = session?.user?.id
    async function load() {
      if (!uid) { setLoading(false); return }
      const { data } = await supabase
        .from('bookings')
        .select('id, material_type, weight_kg, status, created_at, shops(name)')
        .eq('seller_id', uid)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (data) {
        setBookings(data.map(b => ({
          id:        b.id,
          material:  b.material_type,
          kg:        b.weight_kg,
          status:    b.status,
          shopName:  b.shops?.name ?? '—',
          createdAt: b.created_at,
        })))
      }
      setLoading(false)
    }
    load()
    if (!uid) return

    const channel = supabase
      .channel(`my-bookings-${uid}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'bookings',
        filter: `seller_id=eq.${uid}`,
      }, payload => {
        setBookings(prev =>
          prev.map(b => b.id === payload.new.id ? { ...b, status: payload.new.status } : b)
        )
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session, limit])

  return { bookings, loading }
}
