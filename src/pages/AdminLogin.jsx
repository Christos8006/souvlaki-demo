import { useState } from 'react'
import { Link } from 'react-router-dom'
import { adminLogin } from '../utils/adminAuth'
import { ADMIN_BRAND_LABEL } from '../config/branding'

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (adminLogin(password)) {
      onSuccess()
      return
    }
    setError('Λάθος κωδικός πρόσβασης.')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8">
        <p className="text-center text-[11px] font-black tracking-wide text-amber-400/95 uppercase mb-3">
          {ADMIN_BRAND_LABEL}
        </p>
        <h1 className="text-xl font-black text-white text-center mb-1">Διαχείριση</h1>
        <p className="text-sm text-slate-400 text-center mb-8">
          Συνδεθείτε για πρόσβαση στις παραγγελίες
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Κωδικός
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className="w-full bg-slate-950 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="••••••••"
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3.5 rounded-xl transition-colors cursor-pointer"
          >
            Είσοδος
          </button>
        </form>
        <Link
          to="/"
          className="block text-center text-sm text-slate-500 hover:text-slate-300 mt-8 transition-colors"
        >
          Επιστροφή στο site
        </Link>
      </div>
    </div>
  )
}
