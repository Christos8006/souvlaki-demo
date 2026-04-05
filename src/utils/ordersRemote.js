import { getSupabaseClient } from './supabaseClient'

function toNumberOrNull(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function normalizeRemoteOrder(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: String(raw.id),
    displayCode: Number(raw.displayCode ?? raw.display_code ?? 0),
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    status: raw.status || 'pending',
    etaMinutes: toNumberOrNull(raw.etaMinutes ?? raw.eta_minutes),
    etaRange: raw.etaRange ?? raw.eta_range ?? null,
    etaNote: raw.etaNote ?? raw.eta_note ?? null,
    acceptedAt: raw.acceptedAt ?? raw.accepted_at ?? null,
    completedAt: raw.completedAt ?? raw.completed_at ?? null,
    orderType: raw.orderType ?? raw.order_type ?? 'delivery',
    customer: raw.customer && typeof raw.customer === 'object' ? raw.customer : {},
    items: Array.isArray(raw.items) ? raw.items : [],
    subtotal: Number(raw.subtotal ?? 0),
    couponDiscount: Number(raw.couponDiscount ?? raw.coupon_discount ?? 0),
    deliveryCost: Number(raw.deliveryCost ?? raw.delivery_cost ?? 0),
    total: Number(raw.total ?? 0),
    coupon: raw.coupon && typeof raw.coupon === 'object' ? raw.coupon : null,
    dayKey: String(raw.dayKey ?? raw.day_key ?? ''),
    historyDayKey: raw.historyDayKey ?? raw.history_day_key ?? null,
    archivedAt: raw.archivedAt ?? raw.archived_at ?? null,
  }
}

export async function fetchRemoteOrders() {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase.rpc('get_orders')
  if (error) throw error

  const rows = Array.isArray(data) ? data : []
  return rows.map(normalizeRemoteOrder).filter(Boolean)
}

export async function createRemoteOrder(payload) {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase.rpc('create_order', { p_payload: payload })
  if (error) throw error

  const row = normalizeRemoteOrder(data)
  if (!row) throw new Error('Order was not returned from Supabase')
  return row
}

export async function acceptRemoteOrder(id, { etaMinutes, etaRange, etaNote }) {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const minutes = etaMinutes != null && etaMinutes !== '' ? Number(etaMinutes) : null
  const note = etaNote ? String(etaNote).trim() : null
  const range =
    etaRange && ['20-35', '30-45', '40-55'].includes(etaRange) ? etaRange : null

  const { error } = await supabase.rpc('accept_order_rpc', {
    p_id: String(id),
    p_eta_minutes: Number.isFinite(minutes) ? minutes : null,
    p_eta_range: range,
    p_eta_note: note || null,
  })

  if (error) throw error
  return true
}

export async function completeRemoteOrder(id) {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const { error } = await supabase.rpc('complete_order_rpc', {
    p_id: String(id),
  })

  if (error) throw error
  return true
}
