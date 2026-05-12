import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setSession, setProfile, clearUser } from '../store/userSlice'

async function fetchOrCreateProfile(user, dispatch) {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (data) {
    dispatch(setProfile(data))
    return
  }

  // First-time Google OAuth user — create profile automatically
  const role = localStorage.getItem('gp_pending_role') ?? 'user'
  localStorage.removeItem('gp_pending_role')
  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? ''

  const { data: newProfile } = await supabase
    .from('user_profiles')
    .insert({
      id: user.id,
      role,
      display_name: displayName,
      language_pref: 'th',
      eco_points: 0,
    })
    .select()
    .single()

  if (newProfile) dispatch(setProfile(newProfile))
}

export function useAuth() {
  const dispatch = useDispatch()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session))
      if (session) fetchOrCreateProfile(session.user, dispatch)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session))
      if (session) fetchOrCreateProfile(session.user, dispatch)
      else dispatch(clearUser())
    })

    return () => subscription.unsubscribe()
  }, [dispatch])
}
