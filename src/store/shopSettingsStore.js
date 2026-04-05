import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  notifyShopSettingsChanged,
  readUnifiedShopSettings,
  persistUnifiedShopSettings,
} from '../utils/shopSettingsSync'

function norm(a, b) {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {})
}

function normalizeSnapshot(raw) {
  return {
    orderingOpen: typeof raw?.orderingOpen === 'boolean' ? raw.orderingOpen : true,
    productPrices:
      raw?.productPrices && typeof raw.productPrices === 'object' && !Array.isArray(raw.productPrices)
        ? raw.productPrices
        : {},
    soldOutIds:
      raw?.soldOutIds && typeof raw.soldOutIds === 'object' && !Array.isArray(raw.soldOutIds)
        ? raw.soldOutIds
        : {},
  }
}

async function saveCurrentSnapshot() {
  const s = useShopSettingsStore.getState()
  try {
    await persistUnifiedShopSettings({
      orderingOpen: s.orderingOpen,
      productPrices: s.productPrices,
      soldOutIds: s.soldOutIds,
    })
  } catch (err) {
    console.error('Failed to save shop settings:', err)
  }
}

const useShopSettingsStore = create(
  persist(
    (set) => ({
      orderingOpen: true,
      productPrices: {},
      soldOutIds: {},
      setOrderingOpen: (value) => {
        set({ orderingOpen: !!value })
        notifyShopSettingsChanged()
        void saveCurrentSnapshot()
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
        void saveCurrentSnapshot()
      },
      clearProductPriceOverride: (id) => {
        const key = String(id)
        set((s) => {
          const next = { ...s.productPrices }
          delete next[key]
          return { productPrices: next }
        })
        notifyShopSettingsChanged()
        void saveCurrentSnapshot()
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
        void saveCurrentSnapshot()
      },
    }),
    { name: 'souvlaki-shop' }
  )
)

export async function syncShopSettingsFromStorage() {
  try {
    const incoming = normalizeSnapshot(await readUnifiedShopSettings())
    const state = useShopSettingsStore.getState()
    const next = {}
    if (state.orderingOpen !== incoming.orderingOpen) {
      next.orderingOpen = incoming.orderingOpen
    }
    if (!norm(state.productPrices, incoming.productPrices)) {
      next.productPrices = incoming.productPrices
    }
    if (!norm(state.soldOutIds, incoming.soldOutIds)) {
      next.soldOutIds = incoming.soldOutIds
    }
    if (Object.keys(next).length) useShopSettingsStore.setState(next)
  } catch (err) {
    console.error('Failed to sync shop settings:', err)
  }
}

export default useShopSettingsStore
