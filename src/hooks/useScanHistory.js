import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

const EMPTY = { scans: [], loading: false, totalKg: 0, totalValue: 0, error: null }

export function useScanHistory() {
  const session = useSelector(s => s.user.session)
  const userId  = session?.user?.id ?? null
  const [state, setState] = useState({ ...EMPTY, loading: !!userId })

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    async function load() {
      setState(prev => ({ ...prev, loading: true }))
      try {
        const [{ data: agg }, { data: rows }] = await Promise.all([
          supabase
            .from('scan_history')
            .select('weight_kg, calculated_value, price_per_kg')
            .eq('user_id', userId),
          supabase
            .from('scan_history')
            .select('id, material_type, weight_kg, calculated_value, scanned_at')
            .eq('user_id', userId)
            .order('scanned_at', { ascending: false })
            .limit(10),
        ])

        if (cancelled) return

        const totalKg = (agg ?? []).reduce((sum, r) => sum + (r.weight_kg ?? 0), 0)
        const totalValue = (agg ?? []).reduce((sum, r) => {
          const v = r.calculated_value ?? (r.weight_kg ?? 0) * (r.price_per_kg ?? 0)
          return sum + v
        }, 0)
        setState({ scans: rows ?? [], loading: false, totalKg, totalValue })
      } catch (err) {
        if (!cancelled) setState({ ...EMPTY, error: err?.message ?? 'โหลดประวัติไม่สำเร็จ' })
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  return state
}
