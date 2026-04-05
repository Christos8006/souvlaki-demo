import { getSupabaseClient, hasSupabase } from './supabaseClient'

const VISITOR_ID_KEY = 'souvlaki-visitor-id'
const HEARTBEAT_MS = 25000

function makeVisitorId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function getVisitorId() {
  if (typeof window === 'undefined') return 'server'
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY)
    if (existing) return existing
    const next = makeVisitorId()
    localStorage.setItem(VISITOR_ID_KEY, next)
    return next
  } catch {
    return makeVisitorId()
  }
}

export async function touchSiteVisit(pathname = '/') {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const safePath = String(pathname || '/').slice(0, 120)
  const safeUa =
    typeof navigator !== 'undefined' && typeof navigator.userAgent === 'string'
      ? navigator.userAgent.slice(0, 220)
      : ''

  const { error } = await supabase.rpc('touch_site_visit', {
    p_visitor_id: getVisitorId(),
    p_path: safePath,
    p_user_agent: safeUa,
  })

  if (error) {
    console.warn('Supabase visit tracking failed:', error.message)
    return false
  }
  return true
}

export async function fetchSiteStats() {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase.rpc('get_site_stats')
  if (error) throw error

  const row = Array.isArray(data) ? data[0] : data
  return {
    onlineNow: Number(row?.online_now || 0),
    totalVisitors: Number(row?.total_visitors || 0),
  }
}

export function startSiteVisitHeartbeat(getPathname) {
  if (typeof window === 'undefined' || !hasSupabase) return () => {}

  const tick = () => {
    if (document.visibilityState === 'hidden') return
    const path = typeof getPathname === 'function' ? getPathname() : window.location.pathname
    void touchSiteVisit(path)
  }

  tick()

  const intervalId = window.setInterval(tick, HEARTBEAT_MS)
  const onVisibility = () => {
    if (document.visibilityState === 'visible') tick()
  }

  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    window.clearInterval(intervalId)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
