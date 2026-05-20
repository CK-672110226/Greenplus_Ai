import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { pricePerKg } from '../data/wasteItems'

function getGPS() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()  => resolve(null),
      { timeout: 3000, maximumAge: 60000 },
    )
  })
}

export function useScanInsert() {
  const session = useSelector(s => s.user.session)

  const insertScan = useCallback(async (scan) => {
    if (!session?.user?.id) return
    const clean     = scan.clean ?? scan.stage2Pass ?? true
    const grade     = clean ? 'A' : 'C'
    const unitPrice = pricePerKg(scan.materialType, clean)
    const calcValue = unitPrice * (scan.weight ?? 0)
    const gps       = await getGPS()
    try {
      const { error } = await supabase.from('scan_history').insert({
        user_id:          session.user.id,
        material_type:    scan.materialType,
        grade,
        weight_kg:        scan.weight ?? null,
        price_per_kg:     unitPrice,
        calculated_value: calcValue,
        confidence:       scan.confidence ?? null,
        ai_source:        scan.source ?? 'unknown',
        lat:              gps?.lat ?? null,
        lng:              gps?.lng ?? null,
      })
      if (error) throw error
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err?.message ?? 'บันทึก scan ไม่สำเร็จ' }
    }
  }, [session])

  return insertScan
}
