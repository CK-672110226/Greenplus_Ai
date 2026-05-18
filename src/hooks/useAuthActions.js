import { useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAuthActions() {
  async function signIn(email, password, rememberMe = false) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) {
      if (rememberMe) localStorage.setItem('gp_remember', '1')
      else localStorage.removeItem('gp_remember')
      return { error: null, unverified: false }
    }
    if (error.message?.toLowerCase().includes('email not confirmed'))
      return { error: null, unverified: true }
    return { error: error.message, unverified: false }
  }

  async function signUp(email, password, role) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { pending_role: role } },
    })
    if (error?.message?.toLowerCase().includes('user already registered'))
      return { ...(await signIn(email, password)), alreadyRegistered: true }
    if (error) return { error: error.message, unverified: false }
    if (data.user && !data.user.confirmed_at) return { error: null, unverified: true }
    return { error: null, unverified: false }
  }

  async function signInWithGoogle(role) {
    localStorage.setItem('gp_pending_role', role)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return { error: error?.message ?? null }
  }

  async function sendPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    return { error: error?.message ?? null }
  }

  async function resendVerification(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    return { error: error?.message ?? null }
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error?.message ?? null }
  }

  const subscribeToRecovery = useCallback((onRecovery) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') onRecovery()
    })
    return () => subscription.unsubscribe()
  }, [])

  return { signIn, signUp, signInWithGoogle, sendPasswordReset, resendVerification, updatePassword, subscribeToRecovery }
}
