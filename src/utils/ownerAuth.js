const SESSION_KEY = 'souvlaki-owner-session'

/** Ξεχωριστός κωδικός μόνο για αφεντικό: τιμές & «εξαντλήθηκε». Ρύθμιση: VITE_OWNER_PASSWORD */
export function getExpectedOwnerPassword() {
  const v = import.meta.env.VITE_OWNER_PASSWORD
  return typeof v === 'string' && v.length > 0 ? v : 'idioktitis-CHANGE_ME'
}

export function isOwnerAuthenticated() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function ownerLogin(password) {
  if (String(password) === getExpectedOwnerPassword()) {
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* ignore */
    }
    return true
  }
  return false
}

export function ownerLogout() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}
