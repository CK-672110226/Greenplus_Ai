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

  const { data: created } = await supabase
    .from('user_profiles')
    .insert({
      id:            user.id,
      role:          'user',
      display_name:  user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
      language_pref: 'th',
      eco_points:    0,
    })
    .select()
    .single()

  if (created) dispatch(setProfile(created))
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
