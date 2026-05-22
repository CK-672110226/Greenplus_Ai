import { supabase } from '../lib/supabase'

export function useOnboardingActions() {
  async function saveOnboarding(userId, shopData, profileUpdates) {
    try {
      const { error: shopErr } = await supabase.from('shops').upsert({
        owner_id: userId,
        ...shopData,
        status: 'pending',
      }, { onConflict: 'owner_id' })
      if (shopErr) throw shopErr

      const { error: profileErr } = await supabase
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', userId)
      if (profileErr) throw profileErr

      return { ok: true }
    } catch (err) {
      return { ok: false, error: err?.message ?? 'บันทึกไม่สำเร็จ' }
    }
  }

  return { saveOnboarding }
}
