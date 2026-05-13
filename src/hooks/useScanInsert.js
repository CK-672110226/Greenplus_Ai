// C-10: Supabase live data hook — insert scan result to scan_history
// Silently fails if Supabase is not configured (S-05 migration not yet run)

import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useSelector } from 'react-redux'

export function useScanInsert() {
  const session = useSelector(s => s.user.session)

  const insertScan = useCallback(async (scan) => {
    if (!session?.user?.id) return
    try {
      await supabase.from('scan_history').insert({
        user_id:       session.user.id,
        material_type: scan.materialType,
        grade:         scan.grade,
        weight_kg:     scan.weight,
        confidence:    scan.confidence,
        ai_source:     scan.source ?? 'mock',
      })
    } catch {
      // Supabase may not be configured yet — fail silently
    }
  }, [session])

  return insertScan
}
