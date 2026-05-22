import { supabase } from '../lib/supabase'

export function useAdminActions() {
  async function approveShop(id) {
    const { error } = await supabase.from('shops').update({ status: 'active' }).eq('id', id)
    return { error: error?.message ?? null }
  }

  async function rejectShop(id) {
    const { error } = await supabase.from('shops').update({ status: 'rejected' }).eq('id', id)
    return { error: error?.message ?? null }
  }

  async function banShop(id) {
    const { error } = await supabase.from('shops').update({ status: 'banned' }).eq('id', id)
    return { error: error?.message ?? null }
  }

  async function unbanShop(id) {
    const { error } = await supabase.from('shops').update({ status: 'active' }).eq('id', id)
    return { error: error?.message ?? null }
  }

  async function flagPost(id, flagged) {
    const { error } = await supabase.from('marketplace_posts').update({ flagged }).eq('id', id)
    return { error: error?.message ?? null }
  }

  async function banUser(id) {
    const { error } = await supabase.from('user_profiles').update({ is_banned: true }).eq('id', id)
    return { error: error?.message ?? null }
  }

  async function unbanUser(id) {
    const { error } = await supabase.from('user_profiles').update({ is_banned: false }).eq('id', id)
    return { error: error?.message ?? null }
  }

  async function updateShop(id, patch) {
    const { error } = await supabase.from('shops').update(patch).eq('id', id)
    return { error: error?.message ?? null }
  }

  async function updateUser(id, patch) {
    const { error } = await supabase.from('user_profiles').update(patch).eq('id', id)
    return { error: error?.message ?? null }
  }

  return { approveShop, rejectShop, banShop, unbanShop, flagPost, banUser, unbanUser, updateShop, updateUser }
}
