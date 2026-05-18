import { supabase } from '../lib/supabase'

export function useSettingsActions() {
  async function updatePrefs(userId, prefs) {
    if (!userId) return
    await supabase
      .from('user_profiles')
      .update({ notification_prefs: prefs })
      .eq('id', userId)
  }

  async function deleteAccount(userId) {
    await supabase
      .from('user_profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userId)
    await supabase.auth.signOut()
  }

  async function exportData(userId) {
    const [{ data: scans }, { data: bookings }] = await Promise.all([
      supabase.from('scan_history').select('*').eq('user_id', userId).order('scanned_at', { ascending: false }),
      supabase.from('bookings').select('*').eq('seller_id', userId).order('created_at', { ascending: false }),
    ])
    return { scans: scans ?? [], bookings: bookings ?? [] }
  }

  return { updatePrefs, deleteAccount, exportData }
}
