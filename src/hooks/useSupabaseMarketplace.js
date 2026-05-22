import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

function mapPost(p, shopHours = {}) {
  return {
    id:            p.id,
    postType:      p.post_type ?? 'sell',
    title:         p.title ?? null,
    description:   p.description ?? null,
    materialType:  p.material_type,
    materialTypes: Array.isArray(p.material_types) && p.material_types.length > 0
      ? p.material_types
      : (p.material_type ? [p.material_type] : []),
    qty:           p.quantity_kg,
    pricePerKg:    p.price_per_kg,
    shop:          p.user?.display_name ?? '',
    contact:       p.contact ?? '',
    image_url:     p.image_url ?? null,
    flagged:       p.flagged ?? false,
    distanceKm:    null,
    opensAt:       shopHours[p.user_id]?.opensAt ?? null,
    closesAt:      shopHours[p.user_id]?.closesAt ?? null,
    createdAt:     p.created_at,
  }
}

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
          const userIds = [...new Set(data.map(p => p.user_id).filter(Boolean))]
          let shopHours = {}
          if (userIds.length > 0) {
            const { data: shops } = await supabase
              .from('shops')
              .select('owner_id, opens_at, closes_at')
              .in('owner_id', userIds)
            if (shops) shops.forEach(s => {
              shopHours[s.owner_id] = { opensAt: s.opens_at, closesAt: s.closes_at }
            })
          }
          setPosts(data.map(p => mapPost(p, shopHours)))
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
          user_id:        session.user.id,
          post_type:      payload.postType ?? 'sell',
          title:          payload.title || null,
          description:    payload.description || null,
          material_type:  payload.materialTypes?.[0] ?? payload.materialType ?? null,
          material_types: payload.materialTypes ?? [],
          quantity_kg:    payload.qty || null,
          price_per_kg:   payload.pricePerKg || null,
          contact:        payload.contact || null,
          image_url:      payload.image_url || null,
          status:         'active',
        })
        .select('*, user:user_id(display_name)')
        .single()

      if (insertErr) throw insertErr
      setPosts(prev => [mapPost(data), ...prev])
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
