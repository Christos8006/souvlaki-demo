import { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import useOrdersStore, { formatEtaLabel, syncOrdersFromPersistedStorage } from '../store/ordersStore'
import useShopSettingsStore from '../store/shopSettingsStore'
import { subscribeOrdersRemote } from '../utils/orderSync'
import { playDoorbell } from '../utils/doorbell'
import {
  pingAdminAlive,
  clearAdminPingOnUnload,
} from '../utils/adminPresence'
import {
  openOrderCompleteEmailDraft,
  copyOrderCompleteEmailText,
} from '../utils/orderCompleteEmail'
import AdminMenuProducts from './AdminMenuProducts'
import OrderLineCustomization from '../components/OrderLineCustomization'
import { ADMIN_BRAND_LABEL } from '../config/branding'

const ETA_RANGES = [
  { key: '20-35', label: '20 – 35 λεπτά' },
  { key: '30-45', label: '30 – 45 λεπτά' },
  { key: '40-55', label: '40 – 55 λεπτά' },
]

/** Κλασικός διακόπτης ON/OFF για online παραγγελίες */
function SiteOrderingSwitch({ orderingOpen, onRequestToggle }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Παραγγελίες site
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={orderingOpen}
        aria-label={
          orderingOpen
            ? 'Site ανοιχτό — πατήστε για κλείσιμο παραγγελιών'
            : 'Site κλειστό — πατήστε για άνοιγμα παραγγελιών'
        }
        onClick={onRequestToggle}
        className={`flex h-9 w-[3.25rem] shrink-0 items-center rounded-full p-1 transition-colors duration-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
          orderingOpen ? 'justify-end bg-green-500' : 'justify-start bg-slate-600'
        }`}
      >
        <span className="h-7 w-7 rounded-full bg-white shadow-md ring-1 ring-black/10" />
      </button>
      <span
        className={`text-[10px] font-black tracking-tight ${
          orderingOpen ? 'text-green-400' : 'text-amber-400/90'
        }`}
      >
        {orderingOpen ? 'ON' : 'OFF'}
      </span>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Εκκρεμεί', className: 'bg-amber-100 text-amber-800' },
    accepted: { label: 'Αποδεκτή', className: 'bg-green-100 text-green-800' },
    completed: { label: 'Ολοκληρώθηκε', className: 'bg-gray-100 text-gray-600' },
  }
  const s = map[status] || map.pending
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.className}`}>
      {s.label}
    </span>
  )
}

/** Κάρτα ~800×1200 — πρώτα περίληψη (πάτημα), μετά χρόνοι παράδοσης */
function OrderAcceptCard({ order, mode, onAcceptRange, onDismiss }) {
  const startExpanded = mode === 'manual'
  const [expanded, setExpanded] = useState(startExpanded)

  useEffect(() => {
    setExpanded(startExpanded)
  }, [order.id, startExpanded])

  if (!order) return null

  const typeLabel = order.orderType === 'delivery' ? 'Delivery' : 'Take Away'

  const summaryBlock = (compact) => (
    <div className={compact ? 'text-center border-b border-slate-700/80 pb-3 mb-3' : ''}>
      <p className="text-red-400 font-black uppercase tracking-[0.2em] text-xs sm:text-sm mb-2 text-center">
        Νέα παραγγελία
      </p>
      <h2
        className={`font-black text-center leading-none mb-2 text-white ${
          compact ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl md:text-7xl'
        }`}
      >
        #{order.displayCode}
      </h2>
      <p className={`font-bold text-slate-200 text-center ${compact ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
        {order.customer?.name}
      </p>
      <p className={`text-slate-400 text-center ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
        {order.total?.toFixed(2)}€ · {typeLabel}
      </p>
    </div>
  )

  const itemsList = (
    <ul className="text-sm sm:text-base text-slate-300 space-y-2 border border-slate-700/60 rounded-xl p-3 bg-slate-950/50">
      {order.items?.map((line, idx) => (
        <li
          key={line.lineId || `${line.id}-${idx}`}
          className="flex flex-col gap-1 border-b border-slate-700/40 last:border-0 pb-2 last:pb-0"
        >
          <div className="flex justify-between gap-2">
            <span className="min-w-0 font-medium">
              {line.qty}× {line.name}
            </span>
            <span className="shrink-0 font-semibold text-white">
              {(line.onlinePrice * line.qty).toFixed(2)}€
            </span>
          </div>
          <OrderLineCustomization customization={line.customization} variant="admin" />
        </li>
      ))}
    </ul>
  )

  const addressBlock = (
    <div className="text-sm text-slate-400 mt-3 space-y-1">
      <p>
        <span className="text-slate-500 font-bold uppercase text-[10px]">Πελάτης · </span>
        {order.customer?.phone}
      </p>
      {order.orderType === 'delivery' ? (
        <p>{order.customer?.address}</p>
      ) : (
        <p>{order.customer?.store}</p>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/50 pointer-events-auto" aria-hidden />

      <div
        className="relative pointer-events-auto w-full max-w-[800px] max-h-[min(100dvh-1.5rem,1200px)] min-h-0 flex flex-col bg-slate-900 text-white rounded-2xl border-4 border-red-500 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-accept-title"
      >
        {!expanded ? (
          <button
            type="button"
            id="order-accept-title"
            onClick={() => setExpanded(true)}
            className="flex flex-col flex-1 min-h-0 text-left overflow-y-auto p-5 sm:p-7 cursor-pointer touch-manipulation active:bg-slate-800/50 transition-colors"
          >
            {summaryBlock(false)}
            <div className="flex-1 min-h-0 overflow-y-auto mt-4 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Προϊόντα</p>
              {itemsList}
              {addressBlock}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700 text-center">
              <p className="text-amber-300 font-black text-base sm:text-lg">
                Πατήστε για να επιλέξετε χρόνο παράδοσης
              </p>
              <p className="text-slate-500 text-xs mt-2">Η λίστα παραγγελιών παραμένει ορατή πίσω</p>
            </div>
          </button>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 max-h-[min(100dvh-1.5rem,1200px)]">
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-700">
              {summaryBlock(true)}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5">
              <p className="text-slate-500 text-center text-sm font-semibold mb-4">
                Εκτιμώμενος χρόνος για τον πελάτη
              </p>
              <div className="space-y-3 max-w-xl mx-auto">
                {ETA_RANGES.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onAcceptRange(key)}
                    className="w-full min-h-14 py-4 rounded-xl text-lg sm:text-2xl font-black bg-red-600 hover:bg-red-500 active:scale-[0.99] border-2 border-red-400 shadow-lg cursor-pointer touch-manipulation"
                  >
                    Αποδοχή — {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="shrink-0 p-4 border-t border-slate-800 bg-slate-950/80">
              {mode === 'queue' && (
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="w-full mb-2 py-3 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer touch-manipulation"
                >
                  Πίσω στην περίληψη
                </button>
              )}
              <button
                type="button"
                onClick={onDismiss}
                className="w-full min-h-12 py-3 rounded-xl text-base font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer touch-manipulation"
              >
                {mode === 'queue' ? 'Αργότερα (εκκρεμεί)' : 'Κλείσιμο'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ConfirmOrderingChangeModal({ nextOrderingOpen, onConfirm, onCancel }) {
  if (nextOrderingOpen === null) return null
  return (
    <div
      className="fixed inset-0 z-[450] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ordering-confirm-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Κλείσιμο"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full p-5 sm:p-6 border border-slate-200 mt-auto sm:mt-0">
        <h2 id="ordering-confirm-title" className="text-lg font-black text-slate-900 mb-2">
          Είστε σίγουροι;
        </h2>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          {nextOrderingOpen ? (
            <>
              Θα <strong className="text-slate-800">ανοίξει</strong> το site για online παραγγελίες. Οι πελάτες θα
              μπορούν να παραγγείλουν.
            </>
          ) : (
            <>
              Θα <strong className="text-slate-800">κλείσει</strong> το site για online παραγγελίες. Οι πελάτες δεν
              θα μπορούν να προσθέτουν στο καλάθι.
            </>
          )}
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto min-h-11 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 cursor-pointer touch-manipulation"
          >
            Όχι, ακύρωση
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto min-h-11 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm cursor-pointer touch-manipulation"
          >
            Ναι, συνέχεια
          </button>
        </div>
      </div>
    </div>
  )
}

function HistoryOrderCard({ order }) {
  const [open, setOpen] = useState(false)
  const dayLabel = order.historyDayKey || '—'
  const etaText = formatEtaLabel(order)

  return (
    <li className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-wrap items-center justify-between gap-2 p-4 text-left hover:bg-slate-50 cursor-pointer"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl font-black text-slate-900">#{order.displayCode}</span>
          <StatusBadge status={order.status} />
          <span className="text-xs text-slate-500 font-medium">
            Ημέρα: {dayLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-black text-red-600">{order.total?.toFixed(2)}€</span>
          <span className="text-slate-400 text-sm">{open ? '▼' : '▶'}</span>
        </div>
      </button>
      <div className="px-4 pb-1 text-xs text-slate-500">
        {new Date(order.createdAt).toLocaleString('el-GR', { dateStyle: 'short', timeStyle: 'short' })}
        {' · '}
        {order.customer?.name}
        {' · '}
        {order.orderType === 'delivery' ? 'Delivery' : 'Take Away'}
      </div>
      {open && (
        <div className="p-4 pt-2 border-t border-slate-100 text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Πελάτης</p>
            <p className="text-slate-700">{order.customer?.phone}</p>
            <p className="text-slate-700">{order.customer?.email}</p>
            {order.orderType === 'delivery' ? (
              <p className="text-slate-600 mt-1">{order.customer?.address}</p>
            ) : (
              <p className="text-slate-600 mt-1">{order.customer?.store}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Προϊόντα</p>
            <ul className="space-y-2">
              {order.items?.map((line, idx) => (
                <li
                  key={`${order.id}-${line.lineId || line.id}-${idx}`}
                  className="text-slate-700 border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                >
                  <div className="flex justify-between gap-2">
                    <span>
                      {line.qty}× {line.name}
                    </span>
                    <span className="font-medium shrink-0">
                      {(line.onlinePrice * line.qty).toFixed(2)}€
                    </span>
                  </div>
                  <OrderLineCustomization customization={line.customization} variant="admin" />
                </li>
              ))}
            </ul>
            {etaText && (
              <p className="text-xs text-green-700 mt-2 font-semibold">
                Χρόνος: {etaText}
              </p>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

export default function AdminOrders({ onLogout }) {
  const orders = useOrdersStore((s) => s.orders)
  const orderHistory = useOrdersStore((s) => s.orderHistory)
  const acceptOrder = useOrdersStore((s) => s.acceptOrder)
  const completeOrder = useOrdersStore((s) => s.completeOrder)
  const checkDailyReset = useOrdersStore((s) => s.checkDailyReset)
  const orderingOpen = useShopSettingsStore((s) => s.orderingOpen)
  const setOrderingOpen = useShopSettingsStore((s) => s.setOrderingOpen)

  const [manualAcceptId, setManualAcceptId] = useState(null)
  const [alertQueue, setAlertQueue] = useState([])
  const [highlightId, setHighlightId] = useState(null)
  const [adminTab, setAdminTab] = useState('today')
  const [historyQuery, setHistoryQuery] = useState('')
  const [pendingOrderingOpen, setPendingOrderingOpen] = useState(null)

  const seenOrderIdsRef = useRef(null)
  const itemRefs = useRef({})

  useEffect(() => {
    checkDailyReset()
    const iv = setInterval(() => checkDailyReset(), 60000)
    return () => clearInterval(iv)
  }, [checkDailyReset])

  useEffect(() => {
    void syncOrdersFromPersistedStorage()
    return subscribeOrdersRemote(syncOrdersFromPersistedStorage)
  }, [])

  useEffect(() => {
    pingAdminAlive()
    const iv = setInterval(pingAdminAlive, 8000)
    const onLeave = () => clearAdminPingOnUnload()
    window.addEventListener('beforeunload', onLeave)
    return () => {
      clearInterval(iv)
      window.removeEventListener('beforeunload', onLeave)
      onLeave()
    }
  }, [])

  useEffect(() => {
    if (seenOrderIdsRef.current === null) {
      seenOrderIdsRef.current = new Set(orders.map((o) => o.id))
      return
    }
    const seen = seenOrderIdsRef.current
    const newcomers = orders.filter(
      (o) => o.status === 'pending' && !seen.has(o.id)
    )
    newcomers.forEach((o) => seen.add(o.id))

    if (newcomers.length === 0) return

    playDoorbell()
    setAlertQueue((prev) => [...prev, ...newcomers.map((o) => o.id)])
    setHighlightId(newcomers[0].id)
    setTimeout(() => setHighlightId(null), 15000)
  }, [orders])

  const sorted = useMemo(() => {
    const pending = orders
      .filter((o) => o.status === 'pending')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const accepted = orders
      .filter((o) => o.status === 'accepted')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const completed = orders
      .filter((o) => o.status === 'completed')
      .sort((a, b) => {
        const ta = new Date(a.completedAt || a.createdAt).getTime()
        const tb = new Date(b.completedAt || b.createdAt).getTime()
        return ta - tb
      })
    return [...pending, ...accepted, ...completed]
  }, [orders])

  const overlayOrderId = manualAcceptId || alertQueue[0] || null
  const overlayOrder = overlayOrderId
    ? orders.find((o) => o.id === overlayOrderId)
    : null
  const overlayMode = manualAcceptId ? 'manual' : 'queue'

  function handleAcceptRange(etaRange) {
    const id = overlayOrderId
    if (!id) return
    acceptOrder(id, { etaRange })
    setManualAcceptId((m) => (m === id ? null : m))
    setAlertQueue((q) => q.filter((x) => x !== id))
  }

  function handleOverlayDismiss() {
    const id = overlayOrderId
    if (!id) return
    setManualAcceptId((m) => (m === id ? null : m))
    setAlertQueue((q) => q.filter((x) => x !== id))
  }

  useLayoutEffect(() => {
    if (!highlightId) return
    const id = highlightId
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        itemRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    })
  }, [highlightId, sorted])

  return (
    <div className="min-h-screen bg-slate-100">
      <ConfirmOrderingChangeModal
        nextOrderingOpen={pendingOrderingOpen}
        onCancel={() => setPendingOrderingOpen(null)}
        onConfirm={() => {
          if (pendingOrderingOpen !== null) setOrderingOpen(pendingOrderingOpen)
          setPendingOrderingOpen(null)
        }}
      />
      {overlayOrder && overlayOrder.status === 'pending' && (
        <OrderAcceptCard
          order={overlayOrder}
          mode={overlayMode}
          onAcceptRange={handleAcceptRange}
          onDismiss={handleOverlayDismiss}
        />
      )}

      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-black tracking-wide text-amber-400/95 uppercase mb-1">
                {ADMIN_BRAND_LABEL}
              </p>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Διαχείριση
              </p>
              <h1 className="text-xl font-black">Παραγγελίες</h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      orderingOpen ? 'bg-green-400 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  Ζωντανή ενημέρωση · παραγγελίες από site:{' '}
                  {orderingOpen ? 'ανοιχτό' : 'κλειστό (εκτός λειτουργίας)'}
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Νέα ημέρα = καθαρή ενεργή λίστα · όλες οι παλιές αποθηκεύονται στο Ιστορικό
              </p>
            </div>
            <SiteOrderingSwitch
              orderingOpen={orderingOpen}
              onRequestToggle={() => setPendingOrderingOpen(!orderingOpen)}
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-700/50 sm:border-t-0 sm:pt-0 sm:mt-3">
            <button
              type="button"
              onClick={() => playDoorbell()}
              className="text-xs font-semibold text-slate-300 hover:text-white border border-slate-600 px-3 py-2 rounded-lg transition-colors cursor-pointer touch-manipulation min-h-10"
            >
              Δοκιμή ήχου
            </button>
            {typeof onLogout === 'function' && (
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-semibold text-slate-300 hover:text-white border border-slate-600 px-3 py-2 rounded-lg transition-colors cursor-pointer touch-manipulation min-h-10"
              >
                Αποσύνδεση
              </button>
            )}
            <Link
              to="/"
              className="text-sm font-semibold text-slate-300 hover:text-white border border-slate-600 px-4 py-2 rounded-lg transition-colors text-center touch-manipulation min-h-10 inline-flex items-center"
            >
              Επιστροφή στο site
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24 sm:pb-8">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth touch-pan-x">
          <button
            type="button"
            onClick={() => setAdminTab('today')}
            className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-black transition-colors cursor-pointer touch-manipulation min-h-11 ${
              adminTab === 'today'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-red-300'
            }`}
          >
            Σημερινές ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('history')}
            className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-black transition-colors cursor-pointer touch-manipulation min-h-11 ${
              adminTab === 'history'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-red-300'
            }`}
          >
            Ιστορικό ({orderHistory.length})
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('products')}
            className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-black transition-colors cursor-pointer touch-manipulation min-h-11 ${
              adminTab === 'products'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-red-300'
            }`}
          >
            Προϊόντα & τιμές
          </button>
        </div>

        {adminTab === 'products' ? (
          <AdminMenuProducts />
        ) : adminTab === 'history' ? (
          <div>
            <p className="text-sm text-slate-600 mb-3">
              Όλες οι παραγγελίες από προηγούμενες ημέρες (και όσες είχαν μείνει στην ενεργή λίστα στο τέλος της ημέρας).
            </p>
            <input
              type="search"
              value={historyQuery}
              onChange={(e) => setHistoryQuery(e.target.value)}
              placeholder="Αναζήτηση με όνομα, #κωδικό, τηλέφωνο..."
              className="w-full max-w-md border border-slate-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:border-red-400"
            />
            <HistoryTabContent orderHistory={orderHistory} query={historyQuery} />
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">Δεν υπάρχουν παραγγελίες σήμερα</p>
            <p className="text-sm">Οι νέες παραγγελίες ανοίγουν πλήρη οθόνη με ήχο.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wide">
              Σειρά: εκκρεμείς → αποδεκτές → ολοκληρωμένες (κάτω)
            </p>
            <ul className="space-y-4">
              {sorted.map((order) => (
                <li
                  key={order.id}
                  ref={(el) => {
                    itemRefs.current[order.id] = el
                  }}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-[box-shadow,ring] duration-300 ${
                    highlightId === order.id
                      ? 'border-red-500 ring-4 ring-red-500/40 shadow-xl'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/80">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-2xl font-black text-slate-900">
                        #{order.displayCode}
                      </span>
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleString('el-GR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-red-600">{order.total.toFixed(2)}€</p>
                      <p className="text-xs text-slate-500 uppercase font-semibold">
                        {order.orderType === 'delivery' ? 'Delivery' : 'Take Away'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Πελάτης</p>
                      <p className="font-semibold text-slate-800">{order.customer.name}</p>
                      <p className="text-slate-600">{order.customer.phone}</p>
                      <p className="text-slate-600">{order.customer.email}</p>
                      {order.orderType === 'delivery' ? (
                        <p className="text-slate-600 mt-1">
                          {order.customer.address}
                          {order.customer.floor ? `, ${order.customer.floor}` : ''}
                        </p>
                      ) : (
                        <p className="text-slate-600 mt-1">{order.customer.store}</p>
                      )}
                      {order.customer.notes && (
                        <p className="text-amber-800 text-xs mt-2 bg-amber-50 border border-amber-100 rounded-lg p-2">
                          {order.customer.notes}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Προϊόντα</p>
                      <ul className="space-y-2">
                        {order.items.map((line, idx) => (
                          <li
                            key={`${order.id}-${line.lineId || line.id}-${idx}`}
                            className="text-slate-700 border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                          >
                            <div className="flex justify-between gap-2">
                              <span>
                                {line.qty}× {line.name}
                              </span>
                              <span className="font-medium shrink-0">
                                {(line.onlinePrice * line.qty).toFixed(2)}€
                              </span>
                            </div>
                            <OrderLineCustomization customization={line.customization} variant="admin" />
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-slate-500 mt-2">
                        Πληρωμή:{' '}
                        {order.customer.payment === 'card' ? 'Κάρτα στην παράδοση' : 'Μετρητά'}
                      </p>
                      {order.coupon?.code && (
                        <p className="text-xs text-green-700 mt-1">Κουπόνι: {order.coupon.code}</p>
                      )}
                    </div>
                  </div>

                  {order.status === 'accepted' && (
                    <div className="px-4 pb-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
                        <span className="font-bold">Χρόνος για πελάτη: </span>
                        {formatEtaLabel(order)}
                      </div>
                    </div>
                  )}

                  <div className="px-4 pb-4 flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => setManualAcceptId(order.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm cursor-pointer"
                      >
                        Αποδοχή &amp; χρόνος
                      </button>
                    )}
                    {order.status === 'accepted' && (
                      <button
                        type="button"
                        onClick={() => completeOrder(order.id)}
                        title="Κλείνει την παραγγελία στη λίστα — χωρίς άνοιγμα email/browser"
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm cursor-pointer touch-manipulation"
                      >
                        Ολοκλήρωση
                      </button>
                    )}
                    {(order.status === 'accepted' || order.status === 'completed') &&
                      order.customer?.email?.trim() ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openOrderCompleteEmailDraft(order)}
                          title="Μπορεί να ανοίξει πρόγραμμα email ή νέα καρτέλα, αν έτσι είναι ρυθμισμένο το σύστημα (mailto)"
                          className="border-2 border-slate-600 bg-white hover:bg-slate-50 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-sm cursor-pointer touch-manipulation"
                        >
                          Πρόχειρο email
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await copyOrderCompleteEmailText(order)
                            if (ok) {
                              window.alert(
                                'Αντιγράφηκε το κείμενο (προς / θέμα / μήνυμα). Επικολλήστε στο email σας — χωρίς άνοιγμα browser.'
                              )
                            }
                          }}
                          className="border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2.5 rounded-xl text-sm cursor-pointer touch-manipulation"
                        >
                          Αντιγραφή μηνύματος
                        </button>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

function HistoryTabContent({ orderHistory, query }) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return orderHistory
    return orderHistory.filter((o) => {
      const hay = [
        String(o.displayCode),
        o.customer?.name,
        o.customer?.phone,
        o.customer?.email,
        o.historyDayKey,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q) || hay.split(/\s+/).some((w) => w.startsWith(q))
    })
  }, [orderHistory, query])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const o of filtered) {
      const key = o.historyDayKey || 'Άγνωστη ημερομηνία'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(o)
    }
    const keys = [...map.keys()].sort((a, b) => {
      if (a === 'Άγνωστη ημερομηνία') return 1
      if (b === 'Άγνωστη ημερομηνία') return -1
      return new Date(b) - new Date(a)
    })
    return keys.map((day) => ({
      day,
      orders: map.get(day).sort(
        (x, y) => new Date(y.createdAt) - new Date(x.createdAt)
      ),
    }))
  }, [filtered])

  if (orderHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
        <p className="font-semibold text-slate-700">Δεν υπάρχει ακόμα ιστορικό</p>
        <p className="text-sm mt-1">
          Με την αλλαγή ημέρας, οι παραγγελίες της προηγούμενης ημέρας μεταφέρονται εδώ αυτόματα.
        </p>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <p className="text-slate-500 text-sm">Δεν βρέθηκαν αποτελέσματα για την αναζήτησή σας.</p>
    )
  }

  return (
    <div className="space-y-8">
      {grouped.map(({ day, orders: dayOrders }) => (
        <section key={day}>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3">
            {day}
            <span className="text-slate-400 font-semibold normal-case ml-2">
              ({dayOrders.length} παραγγελίες)
            </span>
          </h2>
          <ul className="space-y-2">
            {dayOrders.map((order) => (
              <HistoryOrderCard key={order.id} order={order} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
