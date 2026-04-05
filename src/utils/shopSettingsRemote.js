import { getSupabaseClient } from './supabaseClient'

function normalizeSnapshot(raw) {
  return {
    orderingOpen: typeof raw?.orderingOpen === 'boolean' ? raw.orderingOpen : !!raw?.ordering_open,
    productPrices:
      raw?.productPrices && typeof raw.productPrices === 'object' && !Array.isArray(raw.productPrices)
        ? raw.productPrices
        : raw?.product_prices && typeof raw.product_prices === 'object' && !Array.isArray(raw.product_prices)
          ? raw.product_prices
          : {},
    soldOutIds:
      raw?.soldOutIds && typeof raw.soldOutIds === 'object' && !Array.isArray(raw.soldOutIds)
        ? raw.soldOutIds
        : raw?.sold_out_ids && typeof raw.sold_out_ids === 'object' && !Array.isArray(raw.sold_out_ids)
          ? raw.sold_out_ids
          : {},
  }
}

export async function fetchRemoteShopSettings() {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase.rpc('get_shop_settings')
  if (error) throw error

  const row = Array.isArray(data) ? data[0] : data
  return normalizeSnapshot(row)
}

export async function saveRemoteShopSettings(snapshot) {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const { error } = await supabase.rpc('save_shop_settings', {
    p_ordering_open: !!snapshot.orderingOpen,
    p_product_prices: snapshot.productPrices || {},
    p_sold_out_ids: snapshot.soldOutIds || {},
  })

  if (error) throw error
  return true
}
