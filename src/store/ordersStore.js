import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  notifyOrdersChanged,
  readUnifiedOrders,
  createUnifiedOrder,
  acceptUnifiedOrder,
  completeUnifiedOrder,
} from '../utils/orderSync'

function generateOrderId() {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function todayKey() {
  return new Date().toDateString()
}

function normalizeOrder(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: String(raw.id || generateOrderId()),
    displayCode: Number(raw.displayCode || 0),
    createdAt: raw.createdAt || new Date().toISOString(),
    status: raw.status || 'pending',
    etaMinutes: raw.etaMinutes != null ? Number(raw.etaMinutes) : null,
    etaRange: raw.etaRange ?? null,
    etaNote: raw.etaNote ?? null,
    acceptedAt: raw.acceptedAt ?? null,
    completedAt: raw.completedAt ?? null,
    orderType: raw.orderType || 'delivery',
    customer: raw.customer && typeof raw.customer === 'object' ? raw.customer : {},
    items: Array.isArray(raw.items) ? raw.items : [],
    subtotal: Number(raw.subtotal ?? 0),
    couponDiscount: Number(raw.couponDiscount ?? 0),
    deliveryCost: Number(raw.deliveryCost ?? 0),
    total: Number(raw.total ?? 0),
    coupon: raw.coupon ?? null,
    dayKey: String(raw.dayKey || todayKey()),
    historyDayKey: raw.historyDayKey ?? null,
    archivedAt: raw.archivedAt ?? null,
  }
}

function deriveOrdersState(allOrdersRaw) {
  const allOrders = (Array.isArray(allOrdersRaw) ? allOrdersRaw : [])
    .map(normalizeOrder)
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const today = todayKey()
  const orders = allOrders.filter((o) => o.dayKey === today)
  const orderHistory = allOrders.filter((o) => o.dayKey !== today)

  return {
    allOrders,
    orders,
    orderHistory,
    ordersDayKey: today,
  }
}

function optimisticAccept(order, { etaMinutes, etaNote, etaRange }) {
  const minutes = etaMinutes != null && etaMinutes !== '' ? Number(etaMinutes) : null
  const note = (etaNote && String(etaNote).trim()) || null
  const range =
    etaRange && ['20-35', '30-45', '40-55'].includes(etaRange) ? etaRange : null

  return {
    ...order,
    status: 'accepted',
    etaRange: range,
    etaMinutes: range == null && Number.isFinite(minutes) && minutes > 0 ? minutes : null,
    etaNote: note,
    acceptedAt: new Date().toISOString(),
  }
}

const useOrdersStore = create(
  persist(
    (set, get) => ({
      allOrders: [],
      orders: [],
      ordersDayKey: todayKey(),
      orderHistory: [],

      checkDailyReset: () => {
        set((s) => deriveOrdersState(s.allOrders))
      },

      addOrder: async (payload) => {
        const incoming = {
          ...payload,
          dayKey: todayKey(),
        }

        const remoteOrder = await createUnifiedOrder(incoming)
        if (remoteOrder) {
          set((s) => deriveOrdersState([remoteOrder, ...s.allOrders.filter((o) => o.id !== remoteOrder.id)]))
          return { id: remoteOrder.id, displayCode: remoteOrder.displayCode }
        }

        const existing = get().orders
        const displayCode = Math.max(1000, ...existing.map((o) => o.displayCode || 0)) + 1
        const id = generateOrderId()
        const order = normalizeOrder({
          id,
          displayCode,
          createdAt: new Date().toISOString(),
          status: 'pending',
          etaMinutes: null,
          etaRange: null,
          etaNote: null,
          acceptedAt: null,
          completedAt: null,
          ...incoming,
        })
        set((s) => deriveOrdersState([order, ...s.allOrders]))
        notifyOrdersChanged()
        return { id, displayCode }
      },

      acceptOrder: async (id, opts) => {
        const before = get().allOrders
        set((s) =>
          deriveOrdersState(
            s.allOrders.map((o) => (o.id === id ? optimisticAccept(o, opts) : o))
          )
        )
        try {
          const saved = await acceptUnifiedOrder(id, opts)
          if (!saved) notifyOrdersChanged()
        } catch (err) {
          console.error('Failed to accept order:', err)
          set(deriveOrdersState(before))
        }
      },

      completeOrder: async (id) => {
        const before = get().allOrders
        set((s) =>
          deriveOrdersState(
            s.allOrders.map((o) =>
              o.id === id ? { ...o, status: 'completed', completedAt: new Date().toISOString() } : o
            )
          )
        )
        try {
          const saved = await completeUnifiedOrder(id)
          if (!saved) notifyOrdersChanged()
        } catch (err) {
          console.error('Failed to complete order:', err)
          set(deriveOrdersState(before))
        }
      },

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      getOrderByIdAnywhere: (id) => {
        if (!id) return undefined
        return get().allOrders.find((o) => o.id === id)
      },
    }),
    {
      name: 'souvlaki-orders',
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== 'object') return currentState
        const s = persistedState.state || persistedState
        const combined = Array.isArray(s.allOrders)
          ? s.allOrders
          : [...(Array.isArray(s.orders) ? s.orders : []), ...(Array.isArray(s.orderHistory) ? s.orderHistory : [])]
        return { ...currentState, ...deriveOrdersState(combined) }
      },
    }
  )
)

export async function syncOrdersFromPersistedStorage() {
  try {
    const incoming = await readUnifiedOrders()
    if (incoming == null) return
    const next = deriveOrdersState(incoming)
    const cur = useOrdersStore.getState()
    if (
      JSON.stringify(cur.allOrders || []) === JSON.stringify(next.allOrders || []) &&
      JSON.stringify(cur.orderHistory || []) === JSON.stringify(next.orderHistory || [])
    ) {
      return
    }
    useOrdersStore.setState(next)
  } catch (err) {
    console.error('Failed to sync orders:', err)
  }
}

export function formatEtaLabel(order) {
  if (!order) return null
  if (order.etaNote) return order.etaNote
  if (order.etaRange) {
    const [a, b] = order.etaRange.split('-')
    return `Περίπου σε ${a}–${b} λεπτά`
  }
  if (order.etaMinutes != null && order.etaMinutes > 0) {
    return `Περίπου σε ${order.etaMinutes} λεπτά`
  }
  if (order.status === 'accepted') return 'Η παραγγελία σας εγκρίθηκε'
  return null
}

/** Εμφάνιση στον πελάτη: ξεκάθαρο εύρος λεπτών (π.χ. 20 – 35) ή σημείωση / μονό νούμερο */
export function formatEtaCustomerProminent(order) {
  if (!order) return null
  if (order.etaNote) {
    const t = String(order.etaNote).trim()
    return t || null
  }
  if (order.etaRange) {
    const parts = order.etaRange.split('-').map((x) => x.trim())
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0]} – ${parts[1]} λεπτά`
    }
  }
  if (order.etaMinutes != null && order.etaMinutes > 0) {
    return `~${order.etaMinutes} λεπτά`
  }
  return null
}

export default useOrdersStore
