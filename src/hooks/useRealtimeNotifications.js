import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { addNotification, setNotifications } from '../store/notificationSlice'
import { useMyShop } from './useMyShop'

export function useRealtimeNotifications() {
  const dispatch = useDispatch()
  const session  = useSelector(s => s.user.session)
  const profile  = useSelector(s => s.user.profile)
  const { shop } = useMyShop()

  // Load persisted notifications from Supabase on mount
  useEffect(() => {
    if (!session?.user?.id) return
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) {
          dispatch(setNotifications(data.map(n => ({
            id:        n.id,
            type:      n.type,
            title:     n.title,
            body:      n.body,
            read:      n.read,
            createdAt: n.created_at,
          }))))
        }
      })
  }, [session, dispatch])

  // Subscribe to new bookings for this buyer's shop
  useEffect(() => {
    if (!session?.user?.id || profile?.role !== 'buyer' || !shop?.id) return

    const channel = supabase
      .channel(`buyer-bookings-${shop.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `shop_id=eq.${shop.id}`,
      }, async (payload) => {
        const b = payload.new
        const notif = {
          user_id: session.user.id,
          type:    'new_order',
          title:   'New booking request',
          body:    `${b.material_type} · ${b.weight_kg}kg`,
        }
        const { data } = await supabase
          .from('notifications')
          .insert(notif)
          .select('id')
          .single()
        dispatch(addNotification({ ...notif, id: data?.id ?? String(Date.now()) }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session, profile, shop, dispatch])
}
