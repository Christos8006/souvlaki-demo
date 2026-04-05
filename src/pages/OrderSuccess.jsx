import { useLocation, Link } from 'react-router-dom'
import useOrdersStore, { formatEtaLabel, formatEtaCustomerProminent } from '../store/ordersStore'

export default function OrderSuccess() {
  const { state } = useLocation()

  const orderId = state?.orderId
  const order = useOrdersStore((s) => s.getOrderByIdAnywhere(orderId))

  const orderType = state?.orderType || order?.orderType || 'delivery'
  const name = state?.name || order?.customer?.name || 'Πελάτη'
  const email = state?.email || order?.customer?.email || ''
  const total = state?.total ?? order?.total ?? 0
  const displayCode = state?.displayCode ?? order?.displayCode ?? '—'

  const isCompleted = order && order.status === 'completed'
  const isAccepted = order && order.status === 'accepted'
  const isPending = order && order.status === 'pending'
  const etaText = isAccepted && !isCompleted ? formatEtaLabel(order) : null
  const etaProminent =
    order && (isAccepted || isCompleted) ? formatEtaCustomerProminent(order) : null
  const etaContextLabel =
    orderType === 'delivery' ? 'Εκτιμώμενος χρόνος παράδοσης' : 'Εκτιμώμενος χρόνος παραλαβής'

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden mb-4">
          <div className={`h-2 ${isCompleted ? 'bg-emerald-600' : 'bg-green-500'}`} />

          <div className="p-8 text-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
                isCompleted ? 'bg-emerald-100' : 'bg-green-100'
              }`}
            >
              <svg
                className={`w-10 h-10 ${isCompleted ? 'text-emerald-600' : 'text-green-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-gray-800 mb-1">
              {isCompleted ? 'Η παραγγελία σας ολοκληρώθηκε!' : 'Η παραγγελία σας καταχωρήθηκε!'}
            </h1>
            <p className="text-gray-500 text-sm mb-1">
              Ευχαριστούμε, <span className="font-semibold text-gray-700">{name}</span>
            </p>
            {email && (
              <p className="text-xs text-gray-400 mb-4">
                {isCompleted ? (
                  <>
                    Ελέγξτε το <span className="font-medium text-gray-600">{email}</span> για την τελική
                    επιβεβαίωση από το κατάστημα.
                  </>
                ) : (
                  <>
                    Η απόδειξη στάλθηκε στο{' '}
                    <span className="font-medium text-gray-600">{email}</span>
                  </>
                )}
              </p>
            )}

            {isCompleted && (
              <div className="mb-5 text-left bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-5 py-5">
                <p className="font-black text-lg text-emerald-900 mb-2">
                  Επιβεβαίωση ολοκλήρωσης
                </p>
                {etaProminent && (
                  <div className="mb-4 rounded-xl bg-white/70 border border-emerald-200 px-4 py-3">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">
                      {etaContextLabel} (όπως είχε οριστεί)
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-950 tabular-nums">
                      {etaProminent}
                    </p>
                  </div>
                )}
                <p className="text-emerald-900 text-sm leading-relaxed">
                  Το κατάστημα ολοκλήρωσε την παραγγελία σας. Θα λάβετε (ή μόλις λάβατε) σχετικό email στο
                  {email ? (
                    <>
                      {' '}
                      <span className="font-bold">{email}</span>
                    </>
                  ) : (
                    ' email που δηλώσατε'
                  )}
                  .
                </p>
                <p className="text-emerald-800 text-sm mt-3">
                  {orderType === 'delivery'
                    ? 'Ευχαριστούμε που μας επιλέξατε — καλή σας όρεξη!'
                    : 'Ευχαριστούμε που παραλάβατε από το κατάστημά μας!'}
                </p>
              </div>
            )}

            {isPending && !isCompleted && (
              <div className="mb-5 text-left bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-sm text-amber-950">
                <p className="font-bold text-base mb-1">Αναμονή επιβεβαίωσης από το κατάστημα</p>
                <p className="text-amber-900 text-sm leading-relaxed">
                  Μείνετε σε αυτή τη σελίδα· μόλις εγκριθεί η παραγγελία, θα εμφανιστεί ο εκτιμώμενος χρόνος.
                  Όταν ολοκληρωθεί η παραγγελία, θα ενημερωθείτε εδώ και μέσω email.
                </p>
              </div>
            )}

            {isAccepted && !isCompleted && (
              <div className="mb-5 text-left bg-green-50 border-2 border-green-200 rounded-2xl px-5 py-5">
                <p className="font-black text-lg text-green-900 mb-2">
                  Η παραγγελία σας εγκρίθηκε.
                </p>
                {etaProminent && (
                  <div className="mb-4 rounded-xl bg-white/70 border border-green-200 px-4 py-4 text-center sm:text-left">
                    <p className="text-xs font-bold text-green-800 uppercase tracking-wide mb-1">
                      {etaContextLabel}
                    </p>
                    <p className="text-3xl sm:text-4xl font-black text-green-950 tabular-nums leading-tight">
                      {etaProminent}
                    </p>
                  </div>
                )}
                {!etaProminent && etaText && (
                  <p className="text-green-800 font-bold text-base mb-3">{etaText}</p>
                )}
                <p className="text-green-900 text-sm leading-relaxed">
                  {orderType === 'delivery'
                    ? 'Σε λίγα λεπτά θα είναι κοντά σας — κατευθυνόμαστε προς το σπίτι σας.'
                    : 'Σε λίγα λεπτά θα είναι έτοιμη για παραλαβή από το κατάστημα που επιλέξατε.'}
                </p>
              </div>
            )}

            {!order && (
              <p className="text-sm text-gray-500 mb-5">
                Ευχαριστούμε για την παραγγελία σας.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Αρ. Παραγγελίας</p>
                <p className="font-black text-gray-800 text-lg">#{displayCode}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Κατάσταση</p>
                <p className="font-bold text-gray-800 text-sm leading-tight">
                  {isCompleted
                    ? 'Ολοκληρώθηκε'
                    : isAccepted
                      ? 'Εγκρίθηκε'
                      : isPending
                        ? 'Εκκρεμεί επιβεβαίωση'
                        : 'Καταχωρήθηκε'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Σύνολο</p>
                <p className="font-black text-red-600 text-lg">{Number(total).toFixed(2)}€</p>
              </div>
              {etaProminent && (isAccepted || isCompleted) && (
                <div
                  className={`rounded-xl p-3 sm:col-span-3 border-2 ${
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <p
                    className={`text-xs font-bold mb-0.5 uppercase tracking-wide ${
                      isCompleted ? 'text-emerald-800' : 'text-green-800'
                    }`}
                  >
                    {etaContextLabel}
                  </p>
                  <p
                    className={`font-black text-xl sm:text-2xl tabular-nums ${
                      isCompleted ? 'text-emerald-950' : 'text-green-950'
                    }`}
                  >
                    {etaProminent}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-left text-xs text-blue-800">
              {isCompleted
                ? 'Η παραγγελία έκλεισε επιτυχώς. Για οποιοδήποτε θέμα, καλέστε μας.'
                : orderType === 'delivery'
                  ? 'Αν χρειαστεί κάτι, θα σας καλέσουμε στο τηλέφωνό σας.'
                  : 'Θα σας περιμένουμε στο κατάστημα.'}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Επιστροφή στην Αρχική
          </Link>
          <Link
            to="/menu"
            className="flex-1 text-center border-2 border-gray-200 text-gray-600 font-bold px-6 py-3 rounded-xl hover:border-red-300 transition-colors"
          >
            Νέα Παραγγελία
          </Link>
        </div>
      </div>
    </div>
  )
}
