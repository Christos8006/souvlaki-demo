import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { notifyOrdersChanged, readPersistedOrdersSlice } from '../utils/orderSync'

function generateOrderId() {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function todayKey() {
  return new Date().toDateString()
}

const useOrdersStore = create(
  persist(
    (set, get) => ({
      orders: [],
      ordersDayKey: '',
      orderHistory: [],

      checkDailyReset: () => {
        const today = todayKey()
        const { ordersDayKey, orders, orderHistory } = get()
        if (!ordersDayKey) {
          set({ ordersDayKey: today })
          return
        }
        if (ordersDayKey !== today) {
          const archived =
            orders.length > 0
              ? orders.map((o) => ({
                  ...o,
                  historyDayKey: ordersDayKey,
                  archivedAt: new Date().toISOString(),
                }))
              : []
          set({
            orders: [],
            ordersDayKey: today,
            orderHistory: [...archived, ...(orderHistory || [])],
          })
          notifyOrdersChanged()
        }
      },

      addOrder: (payload) => {
        get().checkDailyReset()
        const existing = get().orders
        const displayCode =
          Math.max(1000, ...existing.map((o) => o.displayCode || 0)) + 1
        const id = generateOrderId()
        const order = {
          id,
          displayCode,
          createdAt: new Date().toISOString(),
          status: 'pending',
          etaMinutes: null,
          etaRange: null,
          etaNote: null,
          acceptedAt: null,
          completedAt: null,
          ...payload,
        }
        set({ orders: [order, ...existing] })
        notifyOrdersChanged()
        return { id, displayCode }
      },

      /**
       * @param {object} opts
       * @param {string} [opts.etaRange] '20-35' | '30-45' | '40-55'
       * @param {number|null} [opts.etaMinutes] παλιά ροή
       * @param {string|null} [opts.etaNote]
       */
      acceptOrder: (id, { etaMinutes, etaNote, etaRange }) => {
        const minutes = etaMinutes != null && etaMinutes !== '' ? Number(etaMinutes) : null
        const note = (etaNote && String(etaNote).trim()) || null
        const range =
          etaRange && ['20-35', '30-45', '40-55'].includes(etaRange) ? etaRange : null
        set({
          orders: get().orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status: 'accepted',
                  etaRange: range,
                  etaMinutes:
                    range == null && Number.isFinite(minutes) && minutes > 0 ? minutes : null,
                  etaNote: note,
                  acceptedAt: new Date().toISOString(),
                }
              : o
          ),
        })
        notifyOrdersChanged()
      },

      completeOrder: (id) => {
        set({
          orders: get().orders.map((o) =>
            o.id === id
              ? { ...o, status: 'completed', completedAt: new Date().toISOString() }
              : o
          ),
        })
        notifyOrdersChanged()
      },

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      /** Ενεργές παραγγελίες ή ιστορικό (για σελίδα επιτυχίας πελάτη) */
      getOrderByIdAnywhere: (id) => {
        if (!id) return undefined
        return (
          get().orders.find((o) => o.id === id) ??
          (get().orderHistory || []).find((o) => o.id === id)
        )
      },
    }),
    { name: 'souvlaki-orders' }
  )
)

/** Συγχρονισμός καρτελών: φόρτωση τελευταίας κατάστασης από localStorage (μετά από admin / άλλη καρτέλα) */
export function syncOrdersFromPersistedStorage() {
  const incoming = readPersistedOrdersSlice()
  if (incoming === null) return
  const cur = useOrdersStore.getState()
  const snap = {
    orders: cur.orders,
    orderHistory: cur.orderHistory || [],
    ordersDayKey: cur.ordersDayKey || '',
  }
  if (JSON.stringify(snap) === JSON.stringify(incoming)) return
  useOrdersStore.setState({
    orders: incoming.orders,
    orderHistory: incoming.orderHistory,
    ordersDayKey: incoming.ordersDayKey,
  })
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
