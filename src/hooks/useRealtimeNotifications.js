import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { addNotification } from '../store/notificationSlice'

export function useRealtimeNotifications() {
  const dispatch = useDispatch()
  const session = useSelector(s => s.user.session)
  const profile = useSelector(s => s.user.profile)

  useEffect(() => {
    if (!session?.user?.id || profile?.role !== 'buyer') return

    const channel = supabase
      .channel('buyer-bookings')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
      }, (payload) => {
        const b = payload.new
        dispatch(addNotification({
          type: 'new_order',
          title: 'New booking request',
          body: `${b.material_type} · ${b.weight_kg}kg`,
        }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session, profile, dispatch])
}
