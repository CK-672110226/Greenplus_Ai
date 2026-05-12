import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setSession, setProfile, clearUser } from '../store/userSlice'

async function fetchProfile(userId, dispatch) {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (data) dispatch(setProfile(data))
}

export function useAuth() {
  const dispatch = useDispatch()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session))
      if (session) fetchProfile(session.user.id, dispatch)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session))
      if (session) fetchProfile(session.user.id, dispatch)
      else dispatch(clearUser())
    })

    return () => subscription.unsubscribe()
  }, [dispatch])
}
