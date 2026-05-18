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

  async function flagPost(id, flagged) {
    const { error } = await supabase.from('marketplace_posts').update({ flagged }).eq('id', id)
    return { error: error?.message ?? null }
  }

  return { approveShop, rejectShop, flagPost }
}
