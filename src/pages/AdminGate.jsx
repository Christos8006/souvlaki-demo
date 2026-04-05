import { useState, useCallback } from 'react'
import AdminLogin from './AdminLogin'
import AdminOrders from './AdminOrders'
import { isAdminAuthenticated, adminLogout } from '../utils/adminAuth'
import { ownerLogout } from '../utils/ownerAuth'

export default function AdminGate() {
  const [authed, setAuthed] = useState(() => isAdminAuthenticated())

  const handleSuccess = useCallback(() => setAuthed(true), [])
  const handleLogout = useCallback(() => {
    adminLogout()
    ownerLogout()
    setAuthed(false)
  }, [])

  if (!authed) return <AdminLogin onSuccess={handleSuccess} />
  return <AdminOrders onLogout={handleLogout} />
}
