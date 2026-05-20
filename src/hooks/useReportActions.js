import { supabase } from '../lib/supabase'

export function useReportActions() {
  async function submitReport({ claimedMaterial, aiMaterial, userId = null }) {
    try {
      const { error } = await supabase.from('user_reports').insert({
        reporter_id:      userId,
        claimed_material: claimedMaterial,
        ai_material:      aiMaterial ?? null,
      })
      if (error) throw error
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err?.message ?? 'ส่ง report ไม่สำเร็จ' }
    }
  }

  return { submitReport }
}
