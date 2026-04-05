/**
 * Ρυθμίσεις εμφάνισης: όνομα μαγαζιού + εταιρεία κατασκευής site.
 * Προαιρετικά .env: VITE_SHOP_NAME, VITE_STUDIO_NAME
 */

function envTrim(key) {
  const v = import.meta.env[key]
  return typeof v === 'string' && v.trim() ? v.trim() : ''
}

/** Όνομα καταστήματος (πελάτης) */
export const SHOP_NAME = envTrim('VITE_SHOP_NAME') || 'Γύρος Σπίτι'

/** Εταιρεία που φτιάχνει sites (π.χ. ATCH) */
export const STUDIO_NAME = envTrim('VITE_STUDIO_NAME') || 'ATCH'

/** Γραμμή admin πάνω αριστερά: «Μαγαζί-ATCH» */
export const ADMIN_BRAND_LABEL = `${SHOP_NAME}-${STUDIO_NAME}`
