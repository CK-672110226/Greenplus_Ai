// Fetch active marketplace posts from Supabase
// Returns { posts, loading, error, addPost, removePost }

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

export function useSupabaseMarketplace() {
  const session = useSelector(s => s.user.session)
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error: fetchErr } = await supabase
          .from('marketplace_posts')
          .select('*, user:user_id(display_name)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (fetchErr) throw fetchErr
        if (data) {
          setPosts(data.map(p => ({
            id:           p.id,
            materialType: p.material_type,
            grade:        p.grade,
            qty:          p.quantity_kg,
            pricePerKg:   p.price_per_kg,
            shop:         p.user?.display_name ?? '',
            flagged:      p.flagged ?? false,
            distanceKm:   null,
          })))
        }
      } catch (err) {
        setError(err?.message ?? 'โหลด marketplace ไม่สำเร็จ')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const addPost = useCallback(async (payload) => {
    if (!session?.user?.id) return { ok: false, error: 'ยังไม่ได้เข้าสู่ระบบ' }
    try {
      const { data, error: insertErr } = await supabase
        .from('marketplace_posts')
        .insert({
          user_id:       session.user.id,
          material_type: payload.materialType,
          grade:         payload.grade,
          quantity_kg:   payload.qty,
          price_per_kg:  payload.pricePerKg,
          status:        'active',
        })
        .select('*, user:user_id(display_name)')
        .single()

      if (insertErr) throw insertErr
      setPosts(prev => [{
        id:           data.id,
        materialType: data.material_type,
        grade:        data.grade,
        qty:          data.quantity_kg,
        pricePerKg:   data.price_per_kg,
        shop:         data.user?.display_name ?? payload.shop ?? '',
        flagged:      false,
        distanceKm:   null,
      }, ...prev])
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err?.message ?? 'โพสต์ไม่สำเร็จ' }
    }
  }, [session])

  const removePost = useCallback(async (id) => {
    const prev = posts.find(p => p.id === id)
    setPosts(p => p.filter(x => x.id !== id))
    try {
      const { error: updateErr } = await supabase
        .from('marketplace_posts')
        .update({ status: 'removed' })
        .eq('id', id)
      if (updateErr) throw updateErr
      return { ok: true }
    } catch (err) {
      if (prev) setPosts(p => [prev, ...p])
      return { ok: false, error: err?.message ?? 'ลบโพสต์ไม่สำเร็จ' }
    }
  }, [posts])

  return { posts, loading, error, addPost, removePost }
}
