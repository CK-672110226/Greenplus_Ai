import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { pricePerKg } from '../data/wasteItems'
import { setProfile } from '../store/userSlice'

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
  const dispatch = useDispatch()
  const session  = useSelector(s => s.user.session)
  const profile  = useSelector(s => s.user.profile)

  const insertScan = useCallback(async (scan) => {
    if (!session?.user?.id) return
    const clean     = scan.clean ?? scan.stage2Pass ?? true
    const grade     = clean ? 'A' : 'C'
    const unitPrice = pricePerKg(scan.materialType, clean)
    const calcValue = unitPrice * (scan.weight ?? 0)
    const gps       = await getGPS()
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
        lat:              gps?.lat ?? null,
        lng:              gps?.lng ?? null,
      })
      // Award eco-points: 10 pts/kg, minimum 1 pt per scan
      const earned = Math.max(1, Math.round((scan.weight ?? 0) * 10))
      const { data: newTotal } = await supabase.rpc('increment_eco_points', {
        user_id_param: session.user.id,
        points_param:  earned,
      })
      if (newTotal != null && profile) {
        dispatch(setProfile({ ...profile, eco_points: newTotal }))
      }
    } catch {
      // Supabase may not be configured yet — fail silently
    }
  }, [session, profile, dispatch])

  return insertScan
}
