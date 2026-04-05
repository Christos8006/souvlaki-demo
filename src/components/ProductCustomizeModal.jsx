import { useMemo, useState } from 'react'
import { normalizeCustomization } from '../utils/cartCustomization'

function toggleInSet(set, id) {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

/** Εμφανίζεται μόνο όταν υπάρχει product· χρησιμοποιήστε key στο parent για καθαρή φόρμα κάθε φορά. */
export default function ProductCustomizeModal({ product, onClose, onConfirm }) {
  const opts = product?.ingredientOptions
  const bases = opts?.baseIngredients ?? []
  const extras = opts?.extras ?? []

  const [excludedBaseIds, setExcludedBaseIds] = useState(() => new Set())
  const [selectedExtraIds, setSelectedExtraIds] = useState(() => new Set())
  const [notes, setNotes] = useState('')

  const { payload, lineTotal } = useMemo(() => {
    const baseExcludedIds = [...excludedBaseIds].map(String).sort()
    const extrasSelectedIds = [...selectedExtraIds].map(String).sort()
    let extrasUnitPrice = 0
    for (const e of extras) {
      if (selectedExtraIds.has(e.id)) {
        const p = Number(e.price)
        if (Number.isFinite(p)) extrasUnitPrice += p
      }
    }
    extrasUnitPrice = Math.round(extrasUnitPrice * 100) / 100
    const displayWithout = bases
      .filter((b) => excludedBaseIds.has(b.id))
      .map((b) => b.label)
      .join(', ')
    const displayExtras = extras
      .filter((e) => selectedExtraIds.has(e.id))
      .map((e) => {
        const p = Number(e.price)
        return Number.isFinite(p) && p > 0 ? `${e.label} (+${p.toFixed(2)}€)` : e.label
      })
      .join(', ')
    const baseOnline = Number(product?.onlinePrice) || 0
    const norm = normalizeCustomization({
      picks: { baseExcludedIds, extrasSelectedIds },
      extrasUnitPrice,
      displayWithout,
      displayExtras,
      notes: notes.trim(),
    })
    return {
      payload: norm,
      lineTotal: Math.round((baseOnline + extrasUnitPrice) * 100) / 100,
    }
  }, [
    bases,
    extras,
    excludedBaseIds,
    selectedExtraIds,
    notes,
    product?.onlinePrice,
  ])

  if (!product) return null

  function handleSubmit(e) {
    e.preventDefault()
    onConfirm(payload)
    onClose()
  }

  const allBasesIncluded = bases.length === 0 || excludedBaseIds.size === 0

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 cursor-default"
        aria-label="Κλείσιμο"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] flex flex-col border border-gray-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customize-product-title"
      >
        <div className="shrink-0 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
          <h2 id="customize-product-title" className="text-lg font-black text-gray-900 leading-tight">
            {product.name}
          </h2>
          <p className="text-sm text-red-600 font-bold mt-1">
            {lineTotal.toFixed(2)}€
            {payload.extrasUnitPrice > 0 && (
              <span className="text-gray-500 font-normal text-xs ml-2">
                (βάση {product.onlinePrice?.toFixed(2)}€ + εξτρά {payload.extrasUnitPrice.toFixed(2)}€)
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Πατήστε τα βασικά για να τα αφαιρέσετε. «Όλα τα βασικά» επαναφέρει την πλήρη σύνθεση. Τα εξτρά είναι πιο κάτω.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 space-y-4">
            {bases.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Βασικά υλικά</span>
                  <button
                    type="button"
                    onClick={() => setExcludedBaseIds(new Set())}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors touch-manipulation ${
                      allBasesIncluded
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Όλα τα βασικά
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bases.map((b) => {
                    const on = !excludedBaseIds.has(b.id)
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setExcludedBaseIds((s) => toggleInSet(s, b.id))}
                        className={`text-sm font-semibold px-3 py-2 rounded-xl border transition-all touch-manipulation ${
                          on
                            ? 'border-red-200 bg-red-50 text-red-800'
                            : 'border-gray-200 bg-gray-100 text-gray-500 line-through decoration-gray-400'
                        }`}
                      >
                        {on ? b.label : `Χωρίς ${b.label}`}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {extras.length > 0 && (
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Εξτρά υλικά</span>
                <ul className="space-y-2">
                  {extras.map((ex) => {
                    const checked = selectedExtraIds.has(ex.id)
                    const p = Number(ex.price)
                    const priceLabel = Number.isFinite(p) && p > 0 ? `+${p.toFixed(2)}€` : ''
                    return (
                      <li key={ex.id}>
                        <label className="flex items-center gap-3 cursor-pointer touch-manipulation py-1.5 rounded-lg hover:bg-gray-50 px-1 -mx-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setSelectedExtraIds((s) => toggleInSet(s, ex.id))}
                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="flex-1 text-sm font-medium text-gray-800">{ex.label}</span>
                          {priceLabel && (
                            <span className="text-xs font-bold text-red-600 tabular-nums">{priceLabel}</span>
                          )}
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            <label className="block">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Σύντομη σημείωση (προαιρετικά)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                maxLength={200}
                placeholder="π.χ. καλά ψημένο, χωρίς αλάτι στο ψωμί..."
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none"
              />
            </label>
          </div>
          <div className="shrink-0 flex gap-2 p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-11 py-3 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-white cursor-pointer touch-manipulation"
            >
              Άκυρο
            </button>
            <button
              type="submit"
              className="flex-1 min-h-11 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black cursor-pointer touch-manipulation"
            >
              Προσθήκη στο καλάθι
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
