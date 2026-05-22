import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setProfile } from '../store/userSlice'

const AVATAR_BUCKET = 'avatars'

export function useProfileActions() {
  const dispatch = useDispatch()
  const session  = useSelector(s => s.user.session)
  const [saving, setSaving] = useState(false)

  async function updateProfile(patch) {
    if (!session?.user?.id) return { ok: false, error: 'Not authenticated' }
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(patch)
        .eq('id', session.user.id)
        .select()
        .single()
      if (error) throw error
      dispatch(setProfile(data))
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err?.message }
    } finally {
      setSaving(false)
    }
  }

  async function uploadAvatar(file) {
    if (!session?.user?.id) return { ok: false, error: 'Not authenticated' }
    setSaving(true)
    try {
      const ext  = file.name.split('.').pop().toLowerCase()
      const path = `${session.user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
      return await updateProfile({ avatar_url: `${publicUrl}?t=${Date.now()}` })
    } catch (err) {
      return { ok: false, error: err?.message }
    } finally {
      setSaving(false)
    }
  }

  return { saving, updateProfile, uploadAvatar }
}
