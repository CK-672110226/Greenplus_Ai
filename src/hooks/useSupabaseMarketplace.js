// Fetch active marketplace posts from Supabase
// Returns { posts, loading, addPost, removePost }

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

export function useSupabaseMarketplace() {
  const session = useSelector(s => s.user.session)
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from('marketplace_posts')
          .select('*, user:user_id(display_name)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (!error && data) {
          setPosts(data.map(p => ({
            id:          p.id,
            materialType: p.material_type,
            grade:        p.grade,
            qty:          p.quantity_kg,
            pricePerKg:   p.price_per_kg,
            shop:         p.user?.display_name ?? '',
            flagged:      p.flagged ?? false,
            distanceKm:   null,
          })))
        }
      } catch {
        // Supabase not configured — fail silently
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const addPost = useCallback(async (payload) => {
    if (!session?.user?.id) return
    try {
      const { data, error } = await supabase
        .from('marketplace_posts')
        .insert({
          user_id:      session.user.id,
          material_type: payload.materialType,
          grade:         payload.grade,
          quantity_kg:   payload.qty,
          price_per_kg:  payload.pricePerKg,
          status:        'active',
        })
        .select('*, user:user_id(display_name)')
        .single()

      if (!error && data) {
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
      }
    } catch {
      // fail silently
    }
  }, [session])

  const removePost = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('marketplace_posts')
        .update({ status: 'removed' })
        .eq('id', id)
      if (!error) {
        setPosts(prev => prev.filter(p => p.id !== id))
      }
    } catch {
      // fail silently
    }
  }, [])

  return { posts, loading, addPost, removePost }
}
