import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import useOrdersStore from '../store/ordersStore'
import useShopSettingsStore from '../store/shopSettingsStore'
import OrderLineCustomization from '../components/OrderLineCustomization'

const stores = [
  'Ασκληπιού 27 — Πλατεία Ταχυδρομείου',
  'Αεροδρομίου 63 — Νέα Σμύρνη',
  'Φιλελλήνων 34 — Φρούριο',
  'Ηρώων Πολυτεχνείου 17Α — 1η Στρατιά',
  'Ρούσβελτ 25 — Κέντρο',
]

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const orderType = useCartStore((s) => s.orderType)
  const setOrderType = useCartStore((s) => s.setOrderType)
  const coupon = useCartStore((s) => s.coupon)
  const applyCoupon = useCartStore((s) => s.applyCoupon)
  const removeCoupon = useCartStore((s) => s.removeCoupon)
  const addOrder = useOrdersStore((s) => s.addOrder)
  const orderingOpen = useShopSettingsStore((s) => s.orderingOpen)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    floor: '',
    store: stores[0],
    payment: 'cash',
    notes: '',
    couponInput: '',
  })
  const [errors, setErrors] = useState({})
  const [couponMsg, setCouponMsg] = useState('')

  const subtotal = items.reduce((sum, i) => sum + i.onlinePrice * i.qty, 0)
  const couponDiscount = coupon.applied && subtotal >= 20 ? coupon.value : 0
  const deliveryCost = orderType === 'delivery' && subtotal >= 8 && subtotal < 15 ? 1.50 : 0
  const finalTotal = subtotal - couponDiscount + deliveryCost

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Υποχρεωτικό πεδίο'
    if (!form.email.trim()) e.email = 'Υποχρεωτικό πεδίο'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Μη έγκυρη διεύθυνση email'
    if (!form.phone.trim()) e.phone = 'Υποχρεωτικό πεδίο'
    else if (!/^[\d\s+\-()]{10,}$/.test(form.phone)) e.phone = 'Μη έγκυρο τηλέφωνο'
    if (orderType === 'delivery' && !form.address.trim()) e.address = 'Υποχρεωτικό πεδίο'
    return e
  }

  function handleCouponApply() {
    if (!form.couponInput.trim()) return
    const code = form.couponInput.trim().toUpperCase()
    const VALID = { DRINK20: { value: 1.62, description: 'Δωρεάν αναψυκτικό' } }
    if (VALID[code]) {
      applyCoupon(code)
      setCouponMsg('success')
    } else {
      setCouponMsg('error')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!orderingOpen) return
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const lineItems = items.map((i) => ({
      id: i.id,
      lineId: i.lineId,
      name: i.name,
      qty: i.qty,
      onlinePrice: i.onlinePrice,
      customization: i.customization || { add: '', remove: '', notes: '' },
    }))

    let orderId
    let displayCode
    try {
      const created = await addOrder({
        orderType,
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          floor: form.floor.trim(),
          store: form.store,
          payment: form.payment,
          notes: form.notes.trim(),
        },
        items: lineItems,
        subtotal,
        couponDiscount,
        deliveryCost,
        total: finalTotal,
        coupon: coupon.applied
          ? { code: coupon.code, description: coupon.description }
          : null,
      })
      orderId = created.id
      displayCode = created.displayCode
    } catch (err) {
      console.error('Order submit failed:', err)
      alert('Η παραγγελία δεν στάλθηκε. Ελέγξτε τη σύνδεση και δοκιμάστε ξανά.')
      return
    }

    clearCart()
    navigate('/order-success', {
      state: {
        orderId,
        displayCode,
        orderType,
        name: form.name,
        email: form.email,
        estimatedTime: orderType === 'delivery' ? '30–45 λεπτά' : '15 λεπτά',
        total: finalTotal,
      },
    })
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Το καλάθι είναι άδειο</h2>
        <p className="text-gray-500 mb-6">Προσθέστε προϊόντα από το μενού για να συνεχίσετε</p>
        <Link to="/menu" className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-colors">
          Δείτε το Μενού
        </Link>
      </div>
    )
  }

  if (!orderingOpen) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-gray-800 mb-2">Εκτός λειτουργίας</h2>
        <p className="text-gray-600 mb-2 leading-relaxed">
          Δεν είναι δυνατή η ολοκλήρωση παραγγελίας μέσω του site αυτή τη στιγμή. Το κατάστημα έχει κλείσει τις
          online παραγγελίες.
        </p>
        <p className="text-sm text-gray-500 mb-8">Καλέστε μας τηλεφωνικά αν χρειάζεστε βοήθεια.</p>
        <Link
          to="/menu"
          className="inline-block bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-colors"
        >
          Επιστροφή στο Μενού
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-800 mb-6">Ολοκλήρωση Παραγγελίας</h1>

      {/* Order type toggle */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Τρόπος Παραλαβής</p>
        <div className="flex rounded-xl overflow-hidden border border-gray-200 w-full sm:w-auto sm:inline-flex">
          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm transition-colors cursor-pointer ${
              orderType === 'delivery' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Delivery
          </button>
          <button
            type="button"
            onClick={() => setOrderType('takeaway')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm transition-colors cursor-pointer border-l border-gray-200 ${
              orderType === 'takeaway' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Take Away
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {orderType === 'delivery'
            ? 'Εκτιμώμενος χρόνος παράδοσης: 30–45 λεπτά'
            : 'Έτοιμο για παραλαβή σε περίπου 15 λεπτά'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">

            <h2 className="font-bold text-gray-800 text-base border-b pb-3">
              Στοιχεία {orderType === 'delivery' ? 'Παράδοσης' : 'Παραλαβής'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Όνομα" required error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Το όνομά σας"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                />
              </Field>

              <Field label="Τηλέφωνο" required error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="69XXXXXXXX"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                />
              </Field>
            </div>

            <Field label="Email" required error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="example@email.com"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
              />
              <p className="text-xs text-gray-400 mt-1">Θα σας στείλουμε την απόδειξη της παραγγελίας στο email σας</p>
            </Field>

            {orderType === 'delivery' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Διεύθυνση" required error={errors.address}>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      placeholder="Οδός και αριθμός"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors ${errors.address ? 'border-red-400' : 'border-gray-200'}`}
                    />
                  </Field>
                </div>
                <Field label="Όροφος">
                  <input
                    type="text"
                    value={form.floor}
                    onChange={(e) => set('floor', e.target.value)}
                    placeholder="π.χ. 2ος"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  />
                </Field>
              </div>
            ) : (
              <Field label="Κατάστημα Παραλαβής">
                <select
                  value={form.store}
                  onChange={(e) => set('store', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 bg-white"
                >
                  {stores.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            )}

            {/* Payment */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Τρόπος Πληρωμής</p>
              <div className="flex gap-3">
                {[
                  { id: 'cash', label: 'Μετρητά' },
                  { id: 'card', label: 'Κάρτα στην παράδοση' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => set('payment', opt.id)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors cursor-pointer ${
                      form.payment === opt.id
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon */}
            {!coupon.applied ? (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Κωδικός Κουπονιού</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.couponInput}
                    onChange={(e) => { set('couponInput', e.target.value.toUpperCase()); setCouponMsg('') }}
                    placeholder="π.χ. DRINK20"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={handleCouponApply}
                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Εφαρμογή
                  </button>
                </div>
                {couponMsg === 'error' && (
                  <p className="text-red-500 text-xs mt-1">Μη έγκυρος κωδικός κουπονιού</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-green-700">Κουπόνι εφαρμόστηκε: {coupon.code}</p>
                  <p className="text-xs text-green-600">{coupon.description}</p>
                </div>
                <button type="button" onClick={removeCoupon} className="text-xs text-red-500 font-semibold cursor-pointer hover:text-red-700">
                  Αφαίρεση
                </button>
              </div>
            )}

            {/* Notes */}
            <Field label="Σχόλια / Οδηγίες">
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="π.χ. χωρίς κρεμμύδι, κουδούνι δεν λειτουργεί..."
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none"
              />
            </Field>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl text-base transition-colors mt-2 cursor-pointer"
            >
              Υποβολή Παραγγελίας
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Σύνοψη Παραγγελίας</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.lineId} className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-tight">{item.name}</p>
                    <p className="text-xs text-gray-400">x{item.qty}</p>
                    <OrderLineCustomization customization={item.customization} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 shrink-0">
                    {(item.onlinePrice * item.qty).toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Υποσύνολο</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Κουπόνι ({coupon.code})</span>
                  <span>-{couponDiscount.toFixed(2)}€</span>
                </div>
              )}
              {orderType === 'delivery' && (
                <div className="flex justify-between text-gray-500">
                  <span>Κόστος delivery</span>
                  <span className={deliveryCost === 0 ? 'text-green-600 font-semibold' : ''}>
                    {deliveryCost === 0 ? 'Δωρεάν' : `${deliveryCost.toFixed(2)}€`}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-black text-lg border-t pt-2 mt-2">
                <span>Σύνολο</span>
                <span className="text-red-600">{finalTotal.toFixed(2)}€</span>
              </div>
            </div>
            {orderType === 'delivery' && subtotal < 15 && subtotal >= 8 && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                Δωρεάν delivery για παραγγελίες άνω των 15€
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
