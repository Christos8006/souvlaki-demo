import { useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import useShopSettingsStore from '../store/shopSettingsStore'
import OrderLineCustomization from './OrderLineCustomization'

export default function CartDrawer() {
  const navigate = useNavigate()
  const orderingOpen = useShopSettingsStore((s) => s.orderingOpen)
  const isOpen = useCartStore((s) => s.isDrawerOpen)
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)
  const items = useCartStore((s) => s.items)
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const coupon = useCartStore((s) => s.coupon)
  const applyCoupon = useCartStore((s) => s.applyCoupon)
  const removeCoupon = useCartStore((s) => s.removeCoupon)

  const subtotal = items.reduce((sum, i) => sum + i.onlinePrice * i.qty, 0)
  const couponDiscount = coupon.applied && subtotal >= 20 ? coupon.value : 0
  const total = subtotal - couponDiscount
  const totalItems = items.reduce((sum, i) => sum + i.qty, 0)

  const handleCheckout = () => {
    if (!orderingOpen) return
    setDrawerOpen(false)
    navigate('/checkout')
  }

  const handleCoupon = () => {
    const code = prompt('Εισάγετε τον κωδικό κουπονιού:')
    if (code) applyCoupon(code.trim().toUpperCase())
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-red-600 text-white">
          <div>
            <h2 className="font-bold text-lg">Το Καλάθι μου</h2>
            <p className="text-red-100 text-xs">{totalItems} {totalItems === 1 ? 'προϊόν' : 'προϊόντα'}</p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm font-medium">Το καλάθι είναι άδειο</p>
              <button
                onClick={() => { setDrawerOpen(false); navigate('/menu') }}
                className="text-red-600 text-sm font-semibold hover:underline cursor-pointer"
              >
                Δείτε το μενού
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.lineId} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</p>
                  <OrderLineCustomization customization={item.customization} />
                  <p className="text-red-600 font-bold text-sm mt-0.5">
                    {(item.onlinePrice * item.qty).toFixed(2)}€
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQty(item.lineId, item.qty - 1)}
                    className="w-7 h-7 rounded-full bg-gray-200 hover:bg-red-100 flex items-center justify-center text-gray-700 font-bold text-sm transition-colors cursor-pointer"
                  >
                    &minus;
                  </button>
                  <span className="w-5 text-center font-bold text-sm">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.lineId, item.qty + 1)}
                    className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white font-bold text-sm transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.lineId)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-gray-50">
            {/* Coupon */}
            {coupon.applied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-green-700">Κουπόνι: {coupon.code}</p>
                  {subtotal >= 20
                    ? <p className="text-xs text-green-600">Έκπτωση -{coupon.value.toFixed(2)}€</p>
                    : <p className="text-xs text-orange-600">Απαιτείται παραγγελία 20€+</p>
                  }
                </div>
                <button onClick={removeCoupon} className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer">
                  Αφαίρεση
                </button>
              </div>
            ) : (
              <button
                onClick={handleCoupon}
                className="w-full text-sm text-red-600 border border-dashed border-red-300 rounded-lg py-2 hover:bg-red-50 transition-colors cursor-pointer font-medium"
              >
                + Εισαγωγή κωδικού κουπονιού
              </button>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Ελάχιστη παραγγελία</span>
              <span>8.00€</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600">
                <span>Έκπτωση κουπονιού</span>
                <span>-{couponDiscount.toFixed(2)}€</span>
              </div>
            )}
            <div className="flex items-center justify-between font-bold text-lg">
              <span>Σύνολο</span>
              <span className="text-red-600">{total.toFixed(2)}€</span>
            </div>
            {subtotal < 8 && (
              <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-2 text-center">
                Προσθέστε άλλα {(8 - subtotal).toFixed(2)}€ για delivery
              </p>
            )}
            {!orderingOpen && (
              <p className="text-xs font-bold text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                Το κατάστημα είναι εκτός λειτουργίας για online παραγγελίες — δεν είναι δυνατή η ολοκλήρωση.
              </p>
            )}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={subtotal < 8 || !orderingOpen}
              title={!orderingOpen ? 'Εκτός λειτουργίας' : undefined}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Ολοκλήρωση Παραγγελίας
            </button>
          </div>
        )}
      </div>
    </>
  )
}
