import { useState, useRef, useEffect, useMemo } from 'react'
import useCartStore from '../store/cartStore'
import useShopSettingsStore from '../store/shopSettingsStore'
import { menuData, buildCatalog, productHasIngredientPicker } from '../utils/menuCatalog'
import ProductCustomizeModal from '../components/ProductCustomizeModal'

function ProductRow({ item, onAdd, addedId, orderingDisabled }) {
  const isAdded = addedId === item.id
  const soldOut = !!item.soldOut
  const cannotOrder = orderingDisabled || soldOut

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors ${soldOut ? 'opacity-75' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h3>
          {soldOut && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-amber-100 text-amber-800">
              Εξαντλήθηκε
            </span>
          )}
          {item.tag && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
              item.tag === 'Bestseller' ? 'bg-red-100 text-red-600' :
              item.tag === 'Popular' ? 'bg-orange-100 text-orange-600' :
              item.tag === 'Vegan' ? 'bg-green-100 text-green-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {item.tag}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-gray-400 text-xs mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
        )}
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto">
        <div className="text-left sm:text-right">
          <div className="text-gray-400 line-through text-xs">{item.price.toFixed(2)}€</div>
          <div className="text-red-600 font-black text-sm">{item.onlinePrice.toFixed(2)}€</div>
        </div>
        <button
          type="button"
          disabled={cannotOrder}
          title={
            soldOut
              ? 'Προσωρινά μη διαθέσιμο'
              : orderingDisabled
                ? 'Δεν δεχόμαστε παραγγελίες αυτή τη στιγμή'
                : undefined
          }
          onClick={() => !cannotOrder && onAdd(item)}
          className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all shrink-0 touch-manipulation ${
            cannotOrder
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isAdded
                ? 'bg-green-500 text-white scale-95 cursor-pointer active:scale-95'
                : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105 cursor-pointer active:scale-95'
          }`}
        >
          {isAdded ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : '+'}
        </button>
      </div>
    </div>
  )
}

export default function Menu() {
  const orderingOpen = useShopSettingsStore((s) => s.orderingOpen)
  const productPrices = useShopSettingsStore((s) => s.productPrices)
  const soldOutIds = useShopSettingsStore((s) => s.soldOutIds)
  const catalog = useMemo(
    () => buildCatalog(menuData, productPrices, soldOutIds),
    [productPrices, soldOutIds]
  )
  const addItem = useCartStore((s) => s.addItem)
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)
  const cartItems = useCartStore((s) => s.items)
  const [addedId, setAddedId] = useState(null)
  const [customizeProduct, setCustomizeProduct] = useState(null)
  const [customizeKey, setCustomizeKey] = useState(0)
  const [activeCategory, setActiveCategory] = useState(catalog[0]?.id ?? menuData[0].id)
  const [search, setSearch] = useState('')
  const sectionRefs = useRef({})
  const isScrolling = useRef(false)

  const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0)
  const totalPrice = cartItems.reduce((sum, i) => sum + i.onlinePrice * i.qty, 0)

  function handleAdd(item) {
    if (!orderingOpen || item.soldOut) return
    if (productHasIngredientPicker(item)) {
      setCustomizeKey((k) => k + 1)
      setCustomizeProduct(item)
      return
    }
    addItem(item, {})
    setAddedId(item.id)
    setTimeout(() => setAddedId(null), 1200)
  }

  function handleConfirmCustomize(customization) {
    if (!customizeProduct) return
    addItem(customizeProduct, customization)
    setAddedId(customizeProduct.id)
    setCustomizeProduct(null)
    setTimeout(() => setAddedId(null), 1200)
  }

  function scrollToCategory(id) {
    isScrolling.current = true
    setActiveCategory(id)
    const el = sectionRefs.current[id]
    if (el) {
      const offset = 130
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
      setTimeout(() => { isScrolling.current = false }, 800)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling.current) return
      const offset = 160
      let current = catalog[0]?.id
      for (const cat of catalog) {
        const el = sectionRefs.current[cat.id]
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= offset) current = cat.id
        }
      }
      if (current) setActiveCategory(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [catalog])

  const filtered = search.trim()
    ? catalog.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : catalog

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-28 md:pb-6">
      {customizeProduct && (
        <ProductCustomizeModal
          key={`${customizeProduct.id}-${customizeKey}`}
          product={customizeProduct}
          onClose={() => setCustomizeProduct(null)}
          onConfirm={handleConfirmCustomize}
        />
      )}
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Μενού</h1>
          <p className="text-gray-500 text-sm">
            Όλες οι τιμές με{' '}
            <span className="text-red-600 font-semibold">-10% online έκπτωση</span>
            {!orderingOpen && (
              <span className="block mt-2 text-red-700 font-bold text-xs">
                Προσωρινά δεν είναι δυνατή η προσθήκη στο καλάθι — το κατάστημα είναι εκτός λειτουργίας για online παραγγελίες.
              </span>
            )}
          </p>
        </div>
        <div className="sm:ml-auto relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Αναζήτηση προϊόντος..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Mobile category tabs */}
      <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 scroll-smooth touch-pan-x -mx-1 px-1">
        {catalog.map((cat) => (
          <button
            key={cat.id}
            onClick={() => scrollToCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-48 lg:w-52 shrink-0">
          <div className="sticky top-20 lg:top-24 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-red-600 text-white text-xs font-bold px-4 py-2.5 uppercase tracking-wider">
              Κατηγορίες
            </div>
            <nav className="py-2">
              {catalog.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-left transition-colors cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-red-50 text-red-600 border-r-2 border-red-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeCategory === cat.id ? 'bg-red-600' : 'bg-gray-300'}`} />
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Product list */}
        <main className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>Δεν βρέθηκαν αποτελέσματα για &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            filtered.map((cat) => (
              <section
                key={cat.id}
                ref={(el) => { sectionRefs.current[cat.id] = el }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-red-100">
                  <h2 className="text-lg font-black text-gray-800">{cat.label}</h2>
                  <span className="text-gray-400 text-xs ml-auto">{cat.items.length} προϊόντα</span>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-1">
                  {cat.items.map((item) => (
                    <ProductRow
                      key={item.id}
                      item={item}
                      onAdd={handleAdd}
                      addedId={addedId}
                      orderingDisabled={!orderingOpen || item.soldOut}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </main>
      </div>

      {/* Floating cart bar (mobile) */}
      {totalItems > 0 && (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="md:hidden fixed bottom-4 left-3 right-3 sm:left-4 sm:right-4 bg-red-600 text-white rounded-2xl px-5 py-3.5 min-h-12 font-bold shadow-xl flex items-center justify-between z-30 cursor-pointer hover:bg-red-700 transition-colors touch-manipulation"
          style={{ marginBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
          <span>Προβολή Καλαθιού</span>
          <span className="font-black">{totalPrice.toFixed(2)}€</span>
        </button>
      )}
    </div>
  )
}
