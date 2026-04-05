import { useEffect, useState } from 'react'
import { fetchSiteStats } from '../utils/siteAnalytics'
import { hasSupabase } from '../utils/supabaseClient'

function StatBox({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 min-w-[9rem]">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black tracking-tight ${accent}`}>{value}</p>
    </div>
  )
}

export default function OwnerSiteStats() {
  const [stats, setStats] = useState({ onlineNow: 0, totalVisitors: 0 })
  const [status, setStatus] = useState(hasSupabase ? 'loading' : 'missing')

  useEffect(() => {
    if (!hasSupabase) return undefined

    let alive = true
    async function load() {
      try {
        const next = await fetchSiteStats()
        if (!alive || !next) return
        setStats(next)
        setStatus('ready')
      } catch {
        if (!alive) return
        setStatus('error')
      }
    }

    load()
    const timer = window.setInterval(load, 4000)
    const onFocus = () => load()
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      window.clearInterval(timer)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  if (status === 'missing') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 max-w-md">
        Βάλε `VITE_SUPABASE_URL` και `VITE_SUPABASE_ANON_KEY` για να εμφανιστούν τα στατιστικά επισκεψιμότητας.
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 max-w-md">
        Δεν συνδέθηκε με Supabase. Έλεγξε το SQL setup και τα env variables.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-500 mb-3">
        Στατιστικά site
      </p>
      <div className="flex flex-wrap gap-3">
        <StatBox label="Μέσα τώρα" value={status === 'loading' ? '...' : stats.onlineNow} accent="text-green-600" />
        <StatBox label="Σύνολο επισκεπτών" value={status === 'loading' ? '...' : stats.totalVisitors} accent="text-slate-900" />
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Εμφανίζονται μόνο στο section ιδιοκτήτη. Ανανεώνονται γρήγορα και ξαναφορτώνουν άμεσα όταν επιστρέφετε στο tab.
      </p>
    </div>
  )
}
