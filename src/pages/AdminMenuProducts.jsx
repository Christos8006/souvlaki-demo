import { useEffect, useMemo, useState } from 'react'
import { menuData } from '../utils/menuCatalog'
import useShopSettingsStore from '../store/shopSettingsStore'
import { isOwnerAuthenticated, ownerLogin, ownerLogout } from '../utils/ownerAuth'
import OwnerSiteStats from '../components/OwnerSiteStats'

function round2(n) {
  return Math.round(Number(n) * 100) / 100
}

function AdminProductRow({ baseItem }) {
  const productPrices = useShopSettingsStore((s) => s.productPrices)
  const soldOutIds = useShopSettingsStore((s) => s.soldOutIds)
  const setProductPricesForItem = useShopSettingsStore((s) => s.setProductPricesForItem)
  const clearProductPriceOverride = useShopSettingsStore((s) => s.clearProductPriceOverride)
  const setSoldOut = useShopSettingsStore((s) => s.setSoldOut)

  const id = String(baseItem.id)
  const ov = productPrices[id]
  const effectivePrice = ov ? ov.price : baseItem.price
  const effectiveOnline = ov ? ov.onlinePrice : baseItem.onlinePrice
  const soldOut = !!soldOutIds[id]
  const hasOverride = !!ov

  const [p, setP] = useState(() => String(effectivePrice))
  const [op, setOp] = useState(() => String(effectiveOnline))

  useEffect(() => {
    setP(String(effectivePrice))
    setOp(String(effectiveOnline))
  }, [effectivePrice, effectiveOnline])

  const syncInputs = () => {
    setP(String(effectivePrice))
    setOp(String(effectiveOnline))
  }

  const savePrices = () => {
    const np = parseFloat(String(p).replace(',', '.'))
    const nop = parseFloat(String(op).replace(',', '.'))
    if (!Number.isFinite(np) || !Number.isFinite(nop) || np < 0 || nop < 0) {
      syncInputs()
      return
    }
    if (
      round2(np) === round2(baseItem.price) &&
      round2(nop) === round2(baseItem.onlinePrice)
    ) {
      clearProductPriceOverride(baseItem.id)
    } else {
      setProductPricesForItem(baseItem.id, np, nop)
    }
    syncInputs()
  }

  return (
    <div className="border border-slate-200 rounded-xl p-3 sm:p-4 bg-white flex flex-col gap-3">
      <div className="min-w-0">
        <p className="font-bold text-slate-900 text-sm leading-snug">{baseItem.name}</p>
        {baseItem.tag ? (
          <span className="inline-block mt-1 text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {baseItem.tag}
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2 md:items-end">
        <label className="md:col-span-3 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Κανονική (€)</span>
          <input
            type="text"
            inputMode="decimal"
            value={p}
            onChange={(e) => setP(e.target.value)}
            className="min-h-11 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
          />
        </label>
        <label className="md:col-span-3 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Online (€)</span>
          <input
            type="text"
            inputMode="decimal"
            value={op}
            onChange={(e) => setOp(e.target.value)}
            className="min-h-11 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
          />
        </label>
        <div className="sm:col-span-2 md:col-span-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={savePrices}
            className="min-h-11 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold cursor-pointer touch-manipulation"
          >
            Αποθήκευση τιμών
          </button>
          {hasOverride ? (
            <button
              type="button"
              onClick={() => {
                clearProductPriceOverride(baseItem.id)
                setP(String(baseItem.price))
                setOp(String(baseItem.onlinePrice))
              }}
              className="min-h-11 px-4 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer touch-manipulation"
            >
              Επαναφορά menu
            </button>
          ) : null}
        </div>
      </div>
      <label className="flex items-center gap-3 cursor-pointer touch-manipulation min-h-11">
        <input
          type="checkbox"
          checked={soldOut}
          onChange={(e) => setSoldOut(baseItem.id, e.target.checked)}
          className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
        />
        <span className="text-sm font-semibold text-slate-700">Εξαντλήθηκε — κρυφό από πελάτες</span>
      </label>
    </div>
  )
}

export default function AdminMenuProducts() {
  const [query, setQuery] = useState('')
  const [ownerUnlocked, setOwnerUnlocked] = useState(() => isOwnerAuthenticated())
  const [ownerPwd, setOwnerPwd] = useState('')
  const [ownerErr, setOwnerErr] = useState('')

  useEffect(() => {
    if (!isOwnerAuthenticated()) setOwnerUnlocked(false)
  }, [])

  function handleOwnerSubmit(e) {
    e.preventDefault()
    setOwnerErr('')
    if (ownerLogin(ownerPwd)) {
      setOwnerUnlocked(true)
      setOwnerPwd('')
      return
    }
    setOwnerErr('Λάθος κωδικός ιδιοκτήτη. Μόνο το αφεντικό μπορεί να αλλάξει τιμές και διαθεσιμότητα.')
    setOwnerPwd('')
  }

  function handleLockOwnerSection() {
    ownerLogout()
    setOwnerUnlocked(false)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return menuData
    return menuData
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q))
        ),
      }))
      .filter((cat) => cat.items.length > 0)
  }, [query])

  if (!ownerUnlocked) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-xl p-6 sm:p-8">
          <h2 className="text-lg font-black text-center mb-1">Κωδικός ιδιοκτήτη</h2>
          <p className="text-sm text-slate-400 text-center mb-6 leading-relaxed">
            Οι υπάλληλοι βλέπουν παραγγελίες με τον κανονικό κωδικό διαχείρισης. Για{' '}
            <strong className="text-slate-200">τιμές</strong>, <strong className="text-slate-200">επαναφορά menu</strong>{' '}
            και <strong className="text-slate-200">«εξαντλήθηκε»</strong> χρειάζεται ο{' '}
            <strong className="text-amber-200">ξεχωριστός κωδικός του αφεντικού</strong> (άλλος από τον κωδικό
            εισόδου admin).
          </p>
          <form onSubmit={handleOwnerSubmit} className="space-y-4">
            <div>
              <label htmlFor="owner-pwd" className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                Κωδικός ιδιοκτήτη
              </label>
              <input
                id="owner-pwd"
                type="password"
                autoComplete="new-password"
                value={ownerPwd}
                onChange={(e) => {
                  setOwnerPwd(e.target.value)
                  setOwnerErr('')
                }}
                className="w-full bg-slate-950 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 min-h-11"
                placeholder="Μόνο για ιδιοκτήτη"
              />
              {ownerErr && <p className="text-red-400 text-sm mt-2">{ownerErr}</p>}
            </div>
            <button
              type="submit"
              className="w-full min-h-12 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black py-3 rounded-xl transition-colors cursor-pointer touch-manipulation"
            >
              Ξεκλείδωμα τιμών & διαθεσιμότητας
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
        <div className="flex-1 space-y-3">
          <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 font-medium leading-relaxed">
            <strong className="font-black">Περιοχή ιδιοκτήτη.</strong> Μετά τη δουλειά, πατήστε κλείδωμα ώστε οι
            υπάλληλοι να μην αλλάζουν κατά λάθος τιμές.
          </p>
          <p className="text-sm text-slate-600">
            Οι αλλαγές εμφανίζονται σε όλες τις συσκευές μέσω Supabase. Τα στατιστικά δεξιά τραβιούνται επίσης από
            Supabase και τα βλέπει μόνο όποιος ξεκλειδώσει με τον κωδικό ιδιοκτήτη.
          </p>
        </div>
        <div className="w-full lg:w-auto lg:min-w-[22rem] space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleLockOwnerSection}
              className="shrink-0 min-h-11 px-4 py-2.5 rounded-xl border-2 border-slate-700 bg-slate-800 text-white text-sm font-black hover:bg-slate-700 cursor-pointer touch-manipulation w-full sm:w-auto"
            >
              Κλείδωμα (υπάλληλοι)
            </button>
          </div>
          <OwnerSiteStats />
        </div>
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Αναζήτηση προϊόντος..."
        className="w-full max-w-md border border-slate-200 rounded-xl px-4 py-3 text-sm mb-6 focus:outline-none focus:border-red-400 min-h-11"
      />
      <div className="space-y-8">
        {filtered.map((cat) => (
          <section key={cat.id}>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3 flex flex-wrap items-center gap-2">
              <span>{cat.label}</span>
              <span className="text-slate-400 font-semibold normal-case text-xs">
                ({cat.items.length} προϊόντα)
              </span>
            </h2>
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {cat.items.map((item) => (
                <li key={item.id}>
                  <AdminProductRow baseItem={item} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-slate-500 text-sm py-8">Δεν βρέθηκαν προϊόντα.</p>
      ) : null}
    </div>
  )
}
