import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { notifyShopSettingsChanged, readPersistedShopSlice } from '../utils/shopSettingsSync'

function normPrices(a, b) {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {})
}

const useShopSettingsStore = create(
  persist(
    (set) => ({
      /** true = το site δέχεται online παραγγελίες */
      orderingOpen: true,
      /** @type {Record<string, { price: number; onlinePrice: number }>} */
      productPrices: {},
      /** @type {Record<string, true>} */
      soldOutIds: {},
      setOrderingOpen: (value) => {
        set({ orderingOpen: !!value })
        notifyShopSettingsChanged()
      },
      setProductPricesForItem: (id, price, onlinePrice) => {
        const key = String(id)
        const p = Number(price)
        const op = Number(onlinePrice)
        if (!Number.isFinite(p) || !Number.isFinite(op) || p < 0 || op < 0) return
        set((s) => ({
          productPrices: { ...s.productPrices, [key]: { price: p, onlinePrice: op } },
        }))
        notifyShopSettingsChanged()
      },
      clearProductPriceOverride: (id) => {
        const key = String(id)
        set((s) => {
          const next = { ...s.productPrices }
          delete next[key]
          return { productPrices: next }
        })
        notifyShopSettingsChanged()
      },
      setSoldOut: (id, value) => {
        const key = String(id)
        set((s) => {
          const next = { ...s.soldOutIds }
          if (value) next[key] = true
          else delete next[key]
          return { soldOutIds: next }
        })
        notifyShopSettingsChanged()
      },
    }),
    { name: 'souvlaki-shop' }
  )
)

export function syncShopSettingsFromStorage() {
  const incoming = readPersistedShopSlice()
  if (incoming === null) return
  const state = useShopSettingsStore.getState()
  const next = {}
  if (state.orderingOpen !== incoming.orderingOpen) {
    next.orderingOpen = incoming.orderingOpen
  }
  if (!normPrices(state.productPrices, incoming.productPrices)) {
    next.productPrices = incoming.productPrices
  }
  if (!normPrices(state.soldOutIds, incoming.soldOutIds)) {
    next.soldOutIds = incoming.soldOutIds
  }
  if (Object.keys(next).length) useShopSettingsStore.setState(next)
}

export default useShopSettingsStore
