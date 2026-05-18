import { supabase } from '../lib/supabase'

export function useOnboardingActions() {
  async function saveOnboarding(userId, shopData, profileUpdates) {
    const { error: shopErr } = await supabase.from('shops').upsert({
      owner_id: userId,
      ...shopData,
      status: 'pending',
    })
    if (shopErr) throw shopErr

    const { error: profileErr } = await supabase
      .from('user_profiles')
      .update(profileUpdates)
      .eq('id', userId)
    if (profileErr) throw profileErr
  }

  return { saveOnboarding }
}
