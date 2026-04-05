import { useState, useEffect } from 'react'

const COUPON_CODE = 'DRINK20'
const STORAGE_KEY = 'gyros-welcome-seen'

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'success'
  const [form, setForm] = useState({ name: '', email: '' })
  const [errors, setErrors] = useState({})
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      const timer = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  function close() {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
      localStorage.setItem(STORAGE_KEY, '1')
    }, 250)
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Υποχρεωτικό πεδίο'
    if (!form.email.trim()) e.email = 'Υποχρεωτικό πεδίο'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Μη έγκυρο email'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    // In a real app: POST to backend to send email
    // Here we simulate sending and show the coupon
    setStep('success')
    localStorage.setItem(STORAGE_KEY, '1')
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-250 ${closing ? 'opacity-0' : 'opacity-100'}`}
        onClick={close}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-250 ${closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      >
        {/* Top bar */}
        <div className="bg-red-600 px-6 pt-6 pb-5 text-white relative">
          <button
            onClick={close}
            className="absolute top-3 right-3 text-red-200 hover:text-white transition-colors p-1 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-red-200 text-xs font-semibold uppercase tracking-widest mb-1">Αποκλειστική Προσφορά</p>
          <h2 className="text-2xl font-black leading-tight">
            Εγγραφείτε &amp; κερδίστε<br />δωρεάν αναψυκτικό
          </h2>
          <p className="text-red-100 text-sm mt-2">
            Σε παραγγελία άνω των <strong>20€</strong>
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <p className="text-gray-500 text-sm">
                Αφήστε το όνομα και το email σας και θα σας στείλουμε αμέσως τον κωδικό κουπονιού.
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Όνομα</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: '' })) }}
                  placeholder="π.χ. Νίκος Παπαδόπουλος"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((er) => ({ ...er, email: '' })) }}
                  placeholder="example@email.com"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Λήψη Κουπονιού
              </button>

              <p className="text-xs text-gray-400 text-center">
                Δεν στέλνουμε spam. Μπορείτε να διαγραφείτε οποτεδήποτε.
              </p>
            </form>
          ) : (
            <div className="text-center py-2">
              {/* Success check */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-xl font-black text-gray-800 mb-1">
                Ο κωδικός σας είναι έτοιμος!
              </h3>
              <p className="text-gray-500 text-sm mb-5">
                Σας στείλαμε email στο <strong>{form.email}</strong> με τον κωδικό κουπονιού.
              </p>

              {/* Coupon box */}
              <div className="bg-red-50 border-2 border-dashed border-red-300 rounded-xl p-4 mb-5">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Κωδικός Κουπονιού</p>
                <p className="text-3xl font-black text-red-600 tracking-widest">{COUPON_CODE}</p>
                <p className="text-xs text-gray-500 mt-1">1 δωρεάν αναψυκτικό &mdash; παραγγελία 20€+</p>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Αντιγράψτε τον κωδικό και χρησιμοποιήστε τον κατά την παραγγελία σας.
              </p>

              <button
                onClick={close}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Ξεκινήστε την Παραγγελία
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
