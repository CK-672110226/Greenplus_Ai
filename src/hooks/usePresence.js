import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

const HEARTBEAT_MS = 2 * 60 * 1000  // 2 minutes

// Keeps last_seen up-to-date for any logged-in user.
// Mount once in AuthInitializer (or useAuth) — no UI needed.
export function usePresence() {
  const session = useSelector(s => s.user.session)

  useEffect(() => {
    if (!session?.user?.id) return

    async function ping() {
      const { error } = await supabase
        .from('user_profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', session.user.id)
      if (error && import.meta.env.DEV) {
        console.warn('[usePresence] last_seen update failed — check migration 022_user_last_seen is applied:', error.message)
      }
    }

    ping()
    const id = setInterval(ping, HEARTBEAT_MS)
    return () => clearInterval(id)
  }, [session?.user?.id])
}
