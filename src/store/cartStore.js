import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  normalizeCustomization,
  customizationKey,
  makeLineId,
} from '../utils/cartCustomization'

const VALID_COUPONS = {
  DRINK20: { value: 1.62, description: 'Δωρεάν αναψυκτικό (παραγγελία 20€+)' },
}

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      orderType: 'delivery',
      coupon: { code: null, applied: false, value: 0, description: '' },

      /**
       * @param {object} product
       * @param {object} [customization] { add, remove, notes }
       */
      addItem: (product, customization = {}) => {
        const norm = normalizeCustomization(customization)
        const extra = norm.extrasUnitPrice || 0
        const baseOnline = Number(product.onlinePrice) || 0
        const baseList = Number(product.price) || 0
        const lineProduct = {
          ...product,
          onlinePrice: Math.round((baseOnline + extra) * 100) / 100,
          price: Math.round((baseList + extra) * 100) / 100,
        }
        const items = get().items
        const key = customizationKey(norm)
        const existing = items.find(
          (i) =>
            i.id === product.id && customizationKey(i.customization || {}) === key
        )
        if (existing) {
          set({
            items: items.map((i) =>
              i.lineId === existing.lineId ? { ...i, qty: i.qty + 1 } : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                ...lineProduct,
                qty: 1,
                lineId: makeLineId(),
                customization: norm,
              },
            ],
          })
        }
      },

      removeItem: (lineId) => {
        set({ items: get().items.filter((i) => i.lineId !== lineId) })
      },

      updateQty: (lineId, qty) => {
        if (qty <= 0) {
          get().removeItem(lineId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.lineId === lineId ? { ...i, qty } : i
          ),
        })
      },

      clearCart: () =>
        set({
          items: [],
          coupon: { code: null, applied: false, value: 0, description: '' },
        }),

      setDrawerOpen: (open) => set({ isDrawerOpen: open }),

      setOrderType: (type) => set({ orderType: type }),

      applyCoupon: (code) => {
        const match = VALID_COUPONS[code]
        if (match) {
          set({
            coupon: {
              code,
              applied: true,
              value: match.value,
              description: match.description,
            },
          })
        } else {
          alert('Μη έγκυρος κωδικός κουπονιού.')
        }
      },

      removeCoupon: () =>
        set({
          coupon: { code: null, applied: false, value: 0, description: '' },
        }),
    }),
    {
      name: 'souvlaki-cart',
      version: 1,
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== 'object') return currentState
        const out = { ...currentState, ...persistedState }
        if (Array.isArray(out.items)) {
          out.items = out.items.map((i, idx) => ({
            ...i,
            lineId: i.lineId || `LEG-${i.id}-${idx}`,
            customization: normalizeCustomization(i.customization),
          }))
        }
        return out
      },
    }
  )
)

export default useCartStore
