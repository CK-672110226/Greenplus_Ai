import { supabase } from '../lib/supabase'

export function useSettingsActions() {
  async function updatePrefs(userId, prefs) {
    if (!userId) return { ok: false, error: 'Not authenticated' }
    const { error } = await supabase
      .from('user_profiles')
      .update({ notification_prefs: prefs })
      .eq('id', userId)
    return { ok: !error, error: error?.message ?? null }
  }

  async function deleteAccount(userId) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) throw error
      await supabase.auth.signOut()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err?.message ?? 'ลบบัญชีไม่สำเร็จ' }
    }
  }

  async function exportData(userId) {
    try {
      const [{ data: scans, error: e1 }, { data: bookings, error: e2 }] = await Promise.all([
        supabase.from('scan_history').select('*').eq('user_id', userId).order('scanned_at', { ascending: false }),
        supabase.from('bookings').select('*').eq('seller_id', userId).order('created_at', { ascending: false }),
      ])
      if (e1 || e2) throw e1 ?? e2
      return { ok: true, data: { scans: scans ?? [], bookings: bookings ?? [] } }
    } catch (err) {
      return { ok: false, error: err?.message ?? 'ส่งออกข้อมูลไม่สำเร็จ', data: { scans: [], bookings: [] } }
    }
  }

  return { updatePrefs, deleteAccount, exportData }
}
