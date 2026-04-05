import { hasSupabase } from './supabaseClient'
import { fetchRemoteShopSettings, saveRemoteShopSettings } from './shopSettingsRemote'

export const SHOP_SETTINGS_STORAGE_KEY = 'souvlaki-shop'
const BC_NAME = 'souvlaki-shop-sync'

let channel = null

function getChannel() {
  if (typeof BroadcastChannel === 'undefined') return null
  if (!channel) channel = new BroadcastChannel(BC_NAME)
  return channel
}

export function notifyShopSettingsChanged() {
  if (hasSupabase) return
  queueMicrotask(() => {
    try {
      getChannel()?.postMessage({ type: 'shop-updated', t: Date.now() })
    } catch {
      /* ignore */
    }
  })
}

export function readPersistedShopSlice() {
  try {
    const raw = localStorage.getItem(SHOP_SETTINGS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const s = parsed?.state
    if (!s || typeof s.orderingOpen !== 'boolean') return null
    const productPrices =
      s.productPrices && typeof s.productPrices === 'object' && !Array.isArray(s.productPrices)
        ? s.productPrices
        : {}
    const soldOutIds =
      s.soldOutIds && typeof s.soldOutIds === 'object' && !Array.isArray(s.soldOutIds)
        ? s.soldOutIds
        : {}
    return { orderingOpen: s.orderingOpen, productPrices, soldOutIds }
  } catch {
    return null
  }
}

export async function readUnifiedShopSettings() {
  if (hasSupabase) return fetchRemoteShopSettings()
  return readPersistedShopSlice()
}

export async function persistUnifiedShopSettings(snapshot) {
  if (hasSupabase) return saveRemoteShopSettings(snapshot)
  notifyShopSettingsChanged()
  return true
}

/**
 * @param {() => void} onUpdate
 * @returns {() => void}
 */
export function subscribeShopSettingsRemote(onUpdate) {
  const run = () => onUpdate()

  if (hasSupabase) {
    run()
    const poll = setInterval(run, 2500)
    const onVisible = () => {
      if (document.visibilityState === 'visible') run()
    }
    window.addEventListener('focus', run)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(poll)
      window.removeEventListener('focus', run)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }

  const onStorage = (e) => {
    if (e.key === SHOP_SETTINGS_STORAGE_KEY && e.newValue) run()
  }
  window.addEventListener('storage', onStorage)

  const ch = getChannel()
  const onBc = () => run()
  ch?.addEventListener('message', onBc)

  const pollMs = 500
  const poll = setInterval(run, pollMs)

  return () => {
    window.removeEventListener('storage', onStorage)
    ch?.removeEventListener('message', onBc)
    clearInterval(poll)
  }
}
