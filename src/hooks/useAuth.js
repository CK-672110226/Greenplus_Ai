import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setSession, setProfile, setLanguage, clearUser } from '../store/userSlice'
import { setOpenDays, setAcceptedMaterials } from '../store/buyerSlice'

async function fetchOrCreateProfile(user, dispatch) {
  try {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      if (data.deleted_at) {
        // Re-login after soft-delete → restore the account
        const role = localStorage.getItem('gp_pending_role') ?? data.role ?? 'user'
        localStorage.removeItem('gp_pending_role')
        const { data: restored } = await supabase
          .from('user_profiles')
          .update({ deleted_at: null, role })
          .eq('id', user.id)
          .select()
          .single()
        if (restored) {
          dispatch(setProfile(restored))
          if (restored.language_pref) dispatch(setLanguage(restored.language_pref))
          if (Array.isArray(restored.open_days)) dispatch(setOpenDays(restored.open_days))
          if (Array.isArray(restored.accepted_materials)) dispatch(setAcceptedMaterials(restored.accepted_materials))
        }
        return
      }
      dispatch(setProfile(data))
      if (data.language_pref) dispatch(setLanguage(data.language_pref))
      // open_days / accepted_materials exist after migration 008 — guard for older deployments
      if (Array.isArray(data.open_days)) dispatch(setOpenDays(data.open_days))
      if (Array.isArray(data.accepted_materials)) dispatch(setAcceptedMaterials(data.accepted_materials))
      return
    }

    // First-time Google OAuth user — create profile
    const role = localStorage.getItem('gp_pending_role') ?? 'user'
    localStorage.removeItem('gp_pending_role')
    const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'

    const { data: created } = await supabase
      .from('user_profiles')
      .insert({
        id:            user.id,
        role,
        display_name:  displayName,
        language_pref: 'th',
      })
      .select()
      .single()

    if (created) dispatch(setProfile(created))
  } catch {
    // Supabase not configured or network error — fail silently
  }
}

export function useAuth() {
  const dispatch = useDispatch()

  useEffect(() => {
    // getSession() resolves from the local cache synchronously, giving us the
    // initial session before the onAuthStateChange subscription fires.
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session))
      if (session) fetchOrCreateProfile(session.user, dispatch)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip INITIAL_SESSION — getSession() already dispatched it above.
      if (event === 'INITIAL_SESSION') return
      dispatch(setSession(session))
      if (session) fetchOrCreateProfile(session.user, dispatch)
      else dispatch(clearUser())
    })

    return () => subscription.unsubscribe()
  }, [dispatch])
}
