/**
 * Ωράριο όπως στο footer: καθημερινά 12:00–02:00, Σαβ–Κυρ 12:00–03:00
 * (το κλείσιμο είναι μετά τα μεσάνυχτα της επόμενης ημέρας)
 */

function weekendStartDay(startDate) {
  const d = startDate.getDay()
  return d === 0 || d === 6
}

/** @returns {{ start: Date, end: Date } | null} */
export function getOpenSessionBounds(now = new Date()) {
  const n = new Date(now)
  n.setSeconds(0, 0)

  const todayNoon = new Date(n)
  todayNoon.setHours(12, 0, 0, 0)

  const yesterdayNoon = new Date(todayNoon)
  yesterdayNoon.setDate(yesterdayNoon.getDate() - 1)

  for (const start of [todayNoon, yesterdayNoon]) {
    const closeHour = weekendStartDay(start) ? 3 : 2
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    end.setHours(closeHour, 0, 0, 0)
    if (n >= start && n < end) return { start, end }
  }
  return null
}

export function isStoreOpenNow(now = new Date()) {
  return getOpenSessionBounds(now) != null
}

/** Λεπτά μέχρι το κλείσιμο (μόνο όταν είμαστε μέσα σε session) */
export function minutesUntilClosing(now = new Date()) {
  const s = getOpenSessionBounds(now)
  if (!s) return null
  const ms = s.end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(ms / 60000))
}
