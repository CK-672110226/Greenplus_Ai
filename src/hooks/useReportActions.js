import { supabase } from '../lib/supabase'

export function useReportActions() {
  async function submitReport({ claimedMaterial, aiMaterial, aiClean }) {
    try {
      await supabase.from('user_reports').insert({
        reporter_id:      null,
        claimed_material: claimedMaterial,
        ai_material:      aiMaterial ?? null,
        ai_clean:         aiClean ?? null,
      })
    } catch { /* silent */ }
  }

  return { submitReport }
}
