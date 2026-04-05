export function makeLineId() {
  return `L${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function sortIds(arr) {
  return [...(arr || [])].map(String).sort().join(',')
}

/**
 * @returns {object} normalized customization για καλάθι / παραγγελία
 */
export function normalizeCustomization(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      picks: null,
      extrasUnitPrice: 0,
      displayWithout: '',
      displayExtras: '',
      notes: '',
      legacyAdd: '',
      legacyRemove: '',
    }
  }

  if (raw.picks && typeof raw.picks === 'object') {
    const baseExcludedIds = Array.isArray(raw.picks.baseExcludedIds)
      ? raw.picks.baseExcludedIds.map(String)
      : []
    const extrasSelectedIds = Array.isArray(raw.picks.extrasSelectedIds)
      ? raw.picks.extrasSelectedIds.map(String)
      : []
    return {
      picks: { baseExcludedIds, extrasSelectedIds },
      extrasUnitPrice: Number.isFinite(Number(raw.extrasUnitPrice)) ? Number(raw.extrasUnitPrice) : 0,
      displayWithout: String(raw.displayWithout ?? '').trim(),
      displayExtras: String(raw.displayExtras ?? '').trim(),
      notes: String(raw.notes ?? '').trim(),
      legacyAdd: '',
      legacyRemove: '',
    }
  }

  return {
    picks: null,
    extrasUnitPrice: 0,
    displayWithout: '',
    displayExtras: '',
    notes: String(raw.notes ?? '').trim(),
    legacyAdd: String(raw.add ?? '').trim(),
    legacyRemove: String(raw.remove ?? '').trim(),
  }
}

export function customizationKey(c) {
  const n = normalizeCustomization(c)
  if (n.picks) {
    return `p:${sortIds(n.picks.baseExcludedIds)}|${sortIds(n.picks.extrasSelectedIds)}|${n.notes}|${n.extrasUnitPrice}`
  }
  return `l:${n.legacyAdd}\n${n.legacyRemove}\n${n.notes}`
}

export function hasCustomization(c) {
  const n = normalizeCustomization(c)
  if (n.picks) {
    return (
      n.picks.baseExcludedIds.length > 0 ||
      n.picks.extrasSelectedIds.length > 0 ||
      !!n.notes ||
      n.extrasUnitPrice > 0
    )
  }
  return !!(n.legacyAdd || n.legacyRemove || n.notes)
}

/** Για εμφάνιση σε καλάθι / checkout / admin */
export function formatCustomizationLines(c) {
  const n = normalizeCustomization(c)
  const out = []
  if (n.picks) {
    if (n.displayWithout) out.push({ label: 'Χωρίς', text: n.displayWithout })
    if (n.displayExtras) out.push({ label: 'Εξτρά', text: n.displayExtras })
    if (n.notes) out.push({ label: 'Σημείωση', text: n.notes })
    return out
  }
  if (n.legacyAdd) out.push({ label: 'Να προστεθούν', text: n.legacyAdd })
  if (n.legacyRemove) out.push({ label: 'Να αφαιρεθούν / χωρίς', text: n.legacyRemove })
  if (n.notes) out.push({ label: 'Σημείωση', text: n.notes })
  return out
}
