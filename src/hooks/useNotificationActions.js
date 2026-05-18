import { supabase } from '../lib/supabase'

export function useNotificationActions() {
  async function markRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }

  async function dismissNotification(id) {
    await supabase.from('notifications').delete().eq('id', id)
  }

  async function markAllRead(userId) {
    if (!userId) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId)
  }

  return { markRead, dismissNotification, markAllRead }
}
