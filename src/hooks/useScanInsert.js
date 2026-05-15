import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useSelector } from 'react-redux'
import { pricePerKg } from '../data/wasteItems'

export function useScanInsert() {
  const session = useSelector(s => s.user.session)

  const insertScan = useCallback(async (scan) => {
    if (!session?.user?.id) return
    const clean       = scan.clean ?? scan.stage2Pass ?? true
    const grade       = clean ? 'A' : 'C'
    const unitPrice   = pricePerKg(scan.materialType, clean)
    const calcValue   = unitPrice * (scan.weight ?? 0)
    try {
      await supabase.from('scan_history').insert({
        user_id:          session.user.id,
        material_type:    scan.materialType,
        grade,
        weight_kg:        scan.weight ?? null,
        price_per_kg:     unitPrice,
        calculated_value: calcValue,
        confidence:       scan.confidence ?? null,
        ai_source:        scan.source ?? 'unknown',
      })
    } catch {
      // Supabase may not be configured yet — fail silently
    }
  }, [session])

  return insertScan
}
