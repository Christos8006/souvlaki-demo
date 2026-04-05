export const PAYMENT_OPTIONS = [
  { id: 'cash', label: 'Μετρητά', description: 'Πληρωμή με μετρητά κατά την παράδοση ή παραλαβή' },
  { id: 'pos', label: 'Κάρτα στην παράδοση', description: 'POS στον διανομέα ή στο κατάστημα' },
  { id: 'visa_mastercard', label: 'Visa / Mastercard', description: 'Online πληρωμή με κάρτα' },
  { id: 'apple_pay', label: 'Apple Pay', description: 'Γρήγορη online πληρωμή από iPhone / Safari' },
  { id: 'google_pay', label: 'Google Pay', description: 'Γρήγορη online πληρωμή από Android / Chrome' },
]

const ONLINE_PAYMENT_METHOD_IDS = new Set(['visa_mastercard', 'apple_pay', 'google_pay'])

export function isOnlinePaymentMethod(method) {
  return ONLINE_PAYMENT_METHOD_IDS.has(String(method))
}

export function getPaymentMethodLabel(method) {
  return PAYMENT_OPTIONS.find((opt) => opt.id === method)?.label || 'Άγνωστος τρόπος πληρωμής'
}

export function getOnlinePaymentRedirectUrl(method, order) {
  const base = import.meta.env.VITE_ONLINE_PAYMENT_URL
  if (typeof base !== 'string' || !base.trim()) return null

  const url = new URL(base)
  url.searchParams.set('method', String(method || ''))
  url.searchParams.set('orderId', String(order?.id || ''))
  url.searchParams.set('displayCode', String(order?.displayCode || ''))
  url.searchParams.set('amount', String(order?.total || ''))
  url.searchParams.set('email', String(order?.customer?.email || ''))
  return url.toString()
}
