import { hasSupabase } from './supabaseClient'
import {
  fetchRemoteOrders,
  createRemoteOrder,
  acceptRemoteOrder,
  completeRemoteOrder,
} from './ordersRemote'

export const ORDERS_STORAGE_KEY = 'souvlaki-orders'
const BC_NAME = 'souvlaki-orders-sync'

let channel = null

function getChannel() {
  if (typeof BroadcastChannel === 'undefined') return null
  if (!channel) channel = new BroadcastChannel(BC_NAME)
  return channel
}

/** Καλείται μετά από κάθε αλλαγή παραγγελιών ώστε άλλες καρτέλες να διαβάσουν το localStorage */
export function notifyOrdersChanged() {
  if (hasSupabase) return
  queueMicrotask(() => {
    try {
      getChannel()?.postMessage({ type: 'orders-updated', t: Date.now() })
    } catch {
      /* ignore */
    }
  })
}

/** Διαβάζει τις παραγγελίες όπως τις αποθηκεύει το zustand persist */
export function readOrdersFromStorage() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const orders = parsed?.state?.orders
    return Array.isArray(orders) ? orders : null
  } catch {
    return null
  }
}

/** Πλήρες slice για συγχρονισμό καρτελών (σημερινές + ιστορικό) */
export function readPersistedOrdersSlice() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const s = parsed?.state
    if (!s) return null
    return {
      orders: Array.isArray(s.orders) ? s.orders : [],
      orderHistory: Array.isArray(s.orderHistory) ? s.orderHistory : [],
      ordersDayKey: typeof s.ordersDayKey === 'string' ? s.ordersDayKey : '',
    }
  } catch {
    return null
  }
}

export async function readUnifiedOrders() {
  if (hasSupabase) return fetchRemoteOrders()
  const local = readPersistedOrdersSlice()
  if (!local) return null
  return [...(local.orders || []), ...(local.orderHistory || [])]
}

export async function createUnifiedOrder(payload) {
  if (hasSupabase) return createRemoteOrder(payload)
  return null
}

export async function acceptUnifiedOrder(id, opts) {
  if (hasSupabase) return acceptRemoteOrder(id, opts)
  return false
}

export async function completeUnifiedOrder(id) {
  if (hasSupabase) return completeRemoteOrder(id)
  return false
}

/**
 * @param {() => void} onUpdate — καλείται όταν πιθανώς άλλαξαν δεδομένα
 * @returns {() => void} cleanup
 */
export function subscribeOrdersRemote(onUpdate) {
  const run = () => {
    onUpdate()
  }

  if (hasSupabase) {
    run()
    const poll = setInterval(run, 2000)
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
    if (e.key === ORDERS_STORAGE_KEY && e.newValue) run()
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
