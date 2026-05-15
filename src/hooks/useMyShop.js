import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

export function useMyShop() {
  const session = useSelector(s => s.user.session)
  const [shop, setShop]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    async function fetch() {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', session.user.id)
          .maybeSingle()

        if (!error && data) setShop(data)
      } catch {
        // Supabase not configured — fail silently
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [session])

  return { shop, loading }
}
