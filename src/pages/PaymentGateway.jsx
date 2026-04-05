import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import {
  getOnlinePaymentRedirectUrl,
  getPaymentMethodLabel,
} from '../utils/paymentOptions'

export default function PaymentGateway() {
  const { state } = useLocation()
  const order = state?.order || null
  const paymentMethod = state?.paymentMethod || ''
  const redirectUrl = getOnlinePaymentRedirectUrl(paymentMethod, order)

  useEffect(() => {
    if (!redirectUrl) return
    const timer = window.setTimeout(() => {
      window.location.href = redirectUrl
    }, 900)
    return () => window.clearTimeout(timer)
  }, [redirectUrl])

  if (!order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center">
          <h1 className="text-2xl font-black text-gray-800 mb-3">Δεν βρέθηκε πληρωμή</h1>
          <p className="text-gray-500 mb-6">Δεν υπάρχουν στοιχεία online πληρωμής για αυτή τη σελίδα.</p>
          <Link to="/menu" className="inline-block bg-red-600 text-white font-bold px-6 py-3 rounded-xl">
            Επιστροφή στο Μενού
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="h-2 bg-red-600" />
        <div className="p-8">
          <p className="text-xs font-black uppercase tracking-wide text-red-600 mb-2">Ασφαλής πληρωμή</p>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Μετάβαση σε πληρωμή</h1>
          <p className="text-gray-600 mb-6">
            Παραγγελία <span className="font-black text-gray-800">#{order.displayCode}</span> · {order.total?.toFixed(2)}€
          </p>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 mb-6">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Τρόπος πληρωμής</p>
            <p className="text-lg font-black text-gray-900">{getPaymentMethodLabel(paymentMethod)}</p>
          </div>

          {redirectUrl ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Γίνεται προώθηση στον ασφαλή πάροχο πληρωμών. Αν δεν ανοίξει αυτόματα, πατήστε το κουμπί πιο κάτω.
              </p>
              <a
                href={redirectUrl}
                className="inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl"
              >
                Συνέχεια στην πληρωμή
              </a>
            </>
          ) : (
            <>
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                Δεν έχει συνδεθεί ακόμη εξωτερικός πάροχος online πληρωμών. Η παραγγελία καταχωρήθηκε, αλλά για
                αληθινό Apple Pay / Visa / Google Pay χρειάζεται payment gateway.
              </p>
              <Link
                to="/order-success"
                state={{
                  orderId: order.id,
                  displayCode: order.displayCode,
                  orderType: order.orderType,
                  name: order.customer?.name,
                  email: order.customer?.email,
                  total: order.total,
                }}
                className="inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl"
              >
                Συνέχεια στην επιβεβαίωση
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
