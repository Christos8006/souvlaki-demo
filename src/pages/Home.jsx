import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import useShopSettingsStore from '../store/shopSettingsStore'
import { menuData, buildCatalog, productHasIngredientPicker } from '../utils/menuCatalog'
import ProductCustomizeModal from '../components/ProductCustomizeModal'

function Toast({ show }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-[0_16px_32px_rgba(22,163,74,0.35)] transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      Προστέθηκε στο καλάθι
    </div>
  )
}

export default function Home() {
  const orderingOpen = useShopSettingsStore((s) => s.orderingOpen)
  const productPrices = useShopSettingsStore((s) => s.productPrices)
  const soldOutIds = useShopSettingsStore((s) => s.soldOutIds)
  const catalog = useMemo(
    () => buildCatalog(menuData, productPrices, soldOutIds),
    [productPrices, soldOutIds]
  )
  const offers = catalog.find((c) => c.id === 'prosfores')?.items || []
  const featured = useMemo(
    () => [
      ...catalog.find((c) => c.id === 'pites')?.items.slice(0, 2) || [],
      ...catalog.find((c) => c.id === 'burgers')?.items.slice(0, 1) || [],
      ...catalog.find((c) => c.id === 'salates')?.items.slice(0, 1) || [],
    ],
    [catalog]
  )
  const addItem = useCartStore((s) => s.addItem)
  const [showToast, setShowToast] = useState(false)
  const [customizeProduct, setCustomizeProduct] = useState(null)
  const [customizeKey, setCustomizeKey] = useState(0)

  function handleAdd(item) {
    if (!orderingOpen || item.soldOut) return
    if (productHasIngredientPicker(item)) {
      setCustomizeKey((k) => k + 1)
      setCustomizeProduct(item)
      return
    }
    addItem(item, {})
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  function handleConfirmCustomize(customization) {
    if (!customizeProduct) return
    addItem(customizeProduct, customization)
    setCustomizeProduct(null)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <div>
      {customizeProduct && (
        <ProductCustomizeModal
          key={`${customizeProduct.id}-${customizeKey}`}
          product={customizeProduct}
          onClose={() => setCustomizeProduct(null)}
          onConfirm={handleConfirmCustomize}
        />
      )}
      <Toast show={showToast} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-red-700 via-red-600 to-red-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_70%_50%,white,transparent_60%)]" />
        <div className="absolute -top-10 right-[8%] h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-[10%] h-24 w-24 rounded-full bg-yellow-300/20 blur-2xl" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider shadow-[0_12px_26px_rgba(0,0,0,0.18)]">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  orderingOpen ? 'bg-green-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {orderingOpen ? 'Ανοιχτά · Delivery 30–45 λεπτά' : 'Online παραγγελίες προσωρινά κλειστές'}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 leading-tight">
              Ο Καλύτερος Γύρος<br />
              <span className="text-yellow-300">στην Πόλη</span>
            </h1>
            <p className="text-lg md:text-xl text-red-100 mb-8 max-w-xl">
              25 χρόνια παράδοσης γεύσης. Παραγγείλτε online και απολαύστε{' '}
              <span className="text-yellow-300 font-bold">-10% έκπτωση</span> σε όλα τα προϊόντα.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/menu"
                className="button-3d-light text-red-600 font-black px-8 py-4 rounded-2xl text-lg text-center"
              >
                Παραγγείλτε Τώρα
              </Link>
              <Link
                to="/menu"
                className="text-white font-bold px-8 py-4 rounded-2xl text-lg text-center border border-white/35 bg-white/8 backdrop-blur-sm shadow-[0_14px_28px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.24)] transition-all hover:-translate-y-0.5 hover:bg-white/12"
              >
                Δείτε το Μενού
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Online discount banner */}
      <div className="bg-yellow-400 text-yellow-900 py-3 text-center font-bold text-sm tracking-wide">
        Παραγγείλτε online και κερδίστε{' '}
        <span className="text-red-700">-10% έκπτωση</span> σε κάθε παραγγελία
      </div>

      {/* Order type quick select */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/menu"
            className="surface-3d surface-3d-hover flex items-center gap-4 rounded-2xl p-5 group"
          >
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-gray-800 text-lg group-hover:text-red-600 transition-colors">Delivery</h3>
              <p className="text-gray-500 text-sm">Στην πόρτα σας σε 30–45 λεπτά</p>
              <p className="text-red-600 text-xs font-semibold mt-1">Ελάχιστη παραγγελία 8€</p>
            </div>
          </Link>
          <Link
            to="/menu"
            className="surface-3d surface-3d-hover flex items-center gap-4 rounded-2xl p-5 group"
          >
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-gray-800 text-lg group-hover:text-red-600 transition-colors">Take Away</h3>
              <p className="text-gray-500 text-sm">Έτοιμο για παραλαβή σε 15 λεπτά</p>
              <p className="text-green-600 text-xs font-semibold mt-1">Χωρίς ελάχιστη παραγγελία</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Offers */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-red-600 rounded-full"></div>
          <h2 className="text-2xl font-black text-gray-800">Προσφορές</h2>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">-10% online</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className="surface-3d surface-3d-hover rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-red-600 to-red-700 h-2"></div>
              <div className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {offer.soldOut && (
                    <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                      Εξαντλήθηκε
                    </span>
                  )}
                  {offer.tag && (
                    <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {offer.tag}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{offer.name}</h3>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed">{offer.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 line-through text-xs">{offer.price.toFixed(2)}€</span>
                    <span className="text-red-600 font-black text-lg ml-1">{offer.onlinePrice.toFixed(2)}€</span>
                  </div>
                  <button
                    type="button"
                    disabled={!orderingOpen || offer.soldOut}
                    title={
                      offer.soldOut
                        ? 'Προσωρινά μη διαθέσιμο'
                        : !orderingOpen
                          ? 'Δεν δεχόμαστε παραγγελίες αυτή τη στιγμή'
                          : undefined
                    }
                    onClick={() => handleAdd(offer)}
                    className={`text-white w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-lg transition-colors touch-manipulation ${
                      orderingOpen && !offer.soldOut
                        ? 'button-3d-red cursor-pointer active:scale-95'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-red-600 rounded-full"></div>
            <h2 className="text-2xl font-black text-gray-800">Αγαπημένα</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {featured.map((item) => (
              <div
                key={item.id}
                className={`surface-3d surface-3d-hover rounded-2xl overflow-hidden ${item.soldOut ? 'opacity-80' : ''}`}
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 h-14 sm:h-16 border-b border-gray-100 relative">
                  {item.soldOut && (
                    <span className="absolute top-1 right-1 text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                      Εξαντλ.
                    </span>
                  )}
                </div>
                <div className="p-2.5 sm:p-3">
                  <h3 className="font-semibold text-gray-800 text-[11px] sm:text-xs leading-tight mb-2 line-clamp-2">{item.name}</h3>
                  <div className="flex items-center justify-between gap-1">
                    <div>
                      <span className="text-gray-400 line-through text-[10px] sm:text-xs">{item.price.toFixed(2)}€</span>
                      <span className="text-red-600 font-black text-xs sm:text-sm ml-0.5 sm:ml-1">{item.onlinePrice.toFixed(2)}€</span>
                    </div>
                    <button
                      type="button"
                      disabled={!orderingOpen || item.soldOut}
                      title={
                        item.soldOut
                          ? 'Προσωρινά μη διαθέσιμο'
                          : !orderingOpen
                            ? 'Δεν δεχόμαστε παραγγελίες αυτή τη στιγμή'
                            : undefined
                      }
                      onClick={() => handleAdd(item)}
                      className={`text-white w-9 h-9 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-sm transition-colors shrink-0 touch-manipulation ${
                        orderingOpen && !item.soldOut
                          ? 'button-3d-red cursor-pointer active:scale-95'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/menu"
              className="button-3d-red inline-flex items-center gap-2 text-white font-bold px-8 py-3 rounded-xl"
            >
              Δείτε όλο το Μενού
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-black text-gray-800 text-center mb-10">Γιατί να μας επιλέξετε</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            {
              icon: (
                <svg className="w-6 h-6 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: 'Ντόπια Κρέατα',
              desc: 'Φρέσκα από τοπικούς παραγωγούς',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: 'Γρήγορη Παράδοση',
              desc: '30–45 λεπτά στην πόρτα σας',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              ),
              title: '-10% Online',
              desc: 'Έκπτωση σε κάθε online παραγγελία',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ),
              title: '25 Χρόνια',
              desc: 'Εμπειρία και αγάπη για τη γεύση',
            },
          ].map((item) => (
            <div key={item.title} className="surface-3d surface-3d-hover rounded-2xl p-5 text-center">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h3>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
