import { supabase } from '../lib/supabase'

export function useShopPricingActions() {
  async function savePricing(shopId, rows) {
    try {
      await supabase.from('shop_pricing').upsert(rows, { onConflict: 'shop_id,material_type' })
    } catch { /* Supabase not configured — fail silently */ }
  }

  return { savePricing }
}
