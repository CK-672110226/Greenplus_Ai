import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

const HEARTBEAT_MS = 2 * 60 * 1000  // 2 minutes
const MAX_ERRORS   = 3               // stop pinging after this many consecutive failures

// Keeps last_seen up-to-date for any logged-in user.
// Mount once in AuthInitializer — no UI needed.
export function usePresence() {
  const session    = useSelector(s => s.user.session)
  const errorsRef  = useRef(0)

  useEffect(() => {
    if (!session?.user?.id) return
    errorsRef.current = 0  // reset counter when user changes / re-logs

    async function ping() {
      if (errorsRef.current >= MAX_ERRORS) return  // backed off — stop hammering DB

      const { error } = await supabase
        .from('user_profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', session.user.id)

      if (error) {
        errorsRef.current += 1
        if (import.meta.env.DEV) {
          console.warn(
            `[usePresence] ping failed (${errorsRef.current}/${MAX_ERRORS})` +
            (errorsRef.current >= MAX_ERRORS ? ' — pausing until re-login. Apply migration 022_user_last_seen on remote DB.' : ''),
            error.message,
          )
        }
      } else {
        errorsRef.current = 0
      }
    }

    ping()
    const id = setInterval(ping, HEARTBEAT_MS)
    return () => clearInterval(id)
  }, [session?.user?.id])
}
