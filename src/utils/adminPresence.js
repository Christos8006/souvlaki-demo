const PING_KEY = 'souvlaki-admin-ping'
const BC_NAME = 'souvlaki-admin-presence'

const STALE_MS = 50000

let channel = null
function getChannel() {
  if (typeof BroadcastChannel === 'undefined') return null
  if (!channel) channel = new BroadcastChannel(BC_NAME)
  return channel
}

export function pingAdminAlive() {
  try {
    const t = String(Date.now())
    localStorage.setItem(PING_KEY, t)
    getChannel()?.postMessage({ type: 'ping', t: Number(t) })
  } catch {
    /* ignore */
  }
}

/** @returns {boolean} */
export function readAdminOnline() {
  try {
    const raw = localStorage.getItem(PING_KEY)
    if (!raw) return false
    const last = Number(raw)
    if (!Number.isFinite(last)) return false
    return Date.now() - last < STALE_MS
  } catch {
    return false
  }
}

/**
 * @param {() => void} onMaybeChange
 * @returns {() => void}
 */
export function subscribeAdminPresence(onMaybeChange) {
  const tick = () => onMaybeChange()

  const onStorage = (e) => {
    if (e.key === PING_KEY) tick()
  }
  window.addEventListener('storage', onStorage)

  const ch = getChannel()
  const onBc = () => tick()
  ch?.addEventListener('message', onBc)

  const poll = setInterval(tick, 3000)

  return () => {
    window.removeEventListener('storage', onStorage)
    ch?.removeEventListener('message', onBc)
    clearInterval(poll)
  }
}

export function clearAdminPingOnUnload() {
  try {
    localStorage.removeItem(PING_KEY)
    getChannel()?.postMessage({ type: 'offline' })
  } catch {
    /* ignore */
  }
}
