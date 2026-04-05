/**
 * Πρόχειρο μήνυμα email προς τον πελάτη μετά την ολοκλήρωση (χωρίς backend).
 * Το mailto ΔΕΝ πρέπει να γίνεται με window.location.href — ξεφορτώνει το SPA και
 * σε κάποια συστήματα ανοίγει νέα καρτέλα (π.χ. Brave) ως χειριστής mailto.
 */

import { formatCustomizationLines } from './cartCustomization'

function buildDraft(order) {
  const to = order?.customer?.email?.trim() || ''
  const name = order.customer?.name || 'Πελάτη'
  const code = order.displayCode ?? '—'
  const total = typeof order.total === 'number' ? order.total.toFixed(2) : String(order.total ?? '')
  const type = order.orderType === 'delivery' ? 'Delivery' : 'Take Away'

  const subject = `Παραγγελία #${code} – Ολοκληρώθηκε | Γύρος Σπίτι`

  const itemsBlock =
    Array.isArray(order.items) && order.items.length > 0
      ? [
          '',
          'Προϊόντα (με τις επιλογές σας):',
          ...order.items.map((line) => {
            const lines = [
              `• ${line.qty}× ${line.name} — ${(Number(line.onlinePrice) * line.qty).toFixed(2)}€`,
            ]
            formatCustomizationLines(line.customization).forEach(({ label, text }) => {
              lines.push(`    ${label}: ${text}`)
            })
            return lines.join('\n')
          }),
        ].join('\n')
      : ''

  const body = [
    `Αγαπητέ/ή ${name},`,
    '',
    `Η παραγγελία σας με αριθμό #${code} ολοκληρώθηκε.`,
    `Τύπος: ${type} · Σύνολο: ${total}€`,
    itemsBlock,
    '',
    'Σας ευχαριστούμε πολύ που μας προτιμήσατε. Καλή σας όρεξη!',
    '',
    'Με εκτίμηση,',
    'Γύρος Σπίτι',
  ].join('\n')

  const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  return { to, subject, body, href }
}

/** Ανοίγει mailto χωρίς να αλλάζει η τρέχουσα καρτέλα του admin. */
export function openOrderCompleteEmailDraft(order) {
  const { to, href } = buildDraft(order)
  if (!to) {
    window.alert('Δεν υπάρχει διεύθυνση email πελάτη για αποστολή.')
    return false
  }

  try {
    const a = document.createElement('a')
    a.href = href
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch {
    window.open(href, '_blank', 'noopener,noreferrer')
  }
  return true
}

/** Αντιγραφή κειμένου χωρίς mailto — ιδανικό αν το Brave ανοίγει αντί για Outlook κ.λπ. */
export async function copyOrderCompleteEmailText(order) {
  const { to, subject, body } = buildDraft(order)
  if (!to) {
    window.alert('Δεν υπάρχει διεύθυνση email πελάτη.')
    return false
  }

  const text = `Προς: ${to}\nΘέμα: ${subject}\n\n${body}`

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fallthrough */
  }

  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    return true
  } catch {
    window.alert('Δεν ήταν δυνατή η αντιγραφή. Αντιγράψτε χειροκίνητα:\n\n' + text.slice(0, 500) + '…')
    return false
  }
}
