const SESSION_KEY = 'souvlaki-admin-session'

export function getExpectedAdminPassword() {
  const v = import.meta.env.VITE_ADMIN_PASSWORD
  return typeof v === 'string' && v.length > 0 ? v : 'admin123'
}

export function isAdminAuthenticated() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function adminLogin(password) {
  if (String(password) === getExpectedAdminPassword()) {
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* ignore */
    }
    return true
  }
  return false
}

export function adminLogout() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}
