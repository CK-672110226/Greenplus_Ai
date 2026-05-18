import { supabase } from '../lib/supabase'

export function useReportActions() {
  async function submitReport({ claimedMaterial, aiMaterial, aiClean, userId = null }) {
    try {
      await supabase.from('user_reports').insert({
        reporter_id:      userId,
        claimed_material: claimedMaterial,
        ai_material:      aiMaterial ?? null,
        ai_clean:         aiClean   ?? null,
      })
    } catch { /* silent */ }
  }

  return { submitReport }
}
