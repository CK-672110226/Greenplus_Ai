import { supabase } from '../lib/supabase'

export function useShopPricingActions() {
  async function savePricing(shopId, rows) {
    const { error } = await supabase.from('shop_pricing').upsert(rows, { onConflict: 'shop_id,material_type' })
    if (error) throw error
  }

  return { savePricing }
}
