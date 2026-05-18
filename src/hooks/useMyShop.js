import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { useQuery } from './useQuery'

export function useMyShop() {
  const userId = useSelector(s => s.user.session?.user?.id)

  const fetchShop = useCallback(async () => {
    if (!userId) return null
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle()
    if (error) throw error
    return data
  }, [userId])

  const { data: shop, loading, error } = useQuery(fetchShop)
  return { shop, loading, error }
}
