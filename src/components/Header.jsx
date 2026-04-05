import { Link, useLocation } from 'react-router-dom'
import useCartStore from '../store/cartStore'

export default function Header() {
  const location = useLocation()
  const items = useCartStore((s) => s.items)
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0)
  const isMenu = location.pathname === '/menu'

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 min-h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-red-600 text-white font-black text-xl px-3 py-1 rounded-lg tracking-tight">
            ΓΥΡΟΣ
          </div>
          <span className="font-bold text-gray-800 text-lg hidden sm:block">
            Σπίτι
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link
            to="/"
            className={`hover:text-red-600 transition-colors ${location.pathname === '/' ? 'text-red-600' : ''}`}
          >
            Αρχική
          </Link>
          <Link
            to="/menu"
            className={`hover:text-red-600 transition-colors ${isMenu ? 'text-red-600' : ''}`}
          >
            Μενού
          </Link>
          <a href="#contact" className="hover:text-red-600 transition-colors">
            Επικοινωνία
          </a>
        </nav>

        {/* Cart button */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="relative flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl font-semibold text-sm transition-colors cursor-pointer touch-manipulation min-h-11 sm:min-h-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="hidden sm:inline">Καλάθι</span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-gray-100 bg-white px-4 py-2 flex gap-4 text-sm font-medium text-gray-600">
        <Link to="/" className={`hover:text-red-600 ${location.pathname === '/' ? 'text-red-600' : ''}`}>
          Αρχική
        </Link>
        <Link to="/menu" className={`hover:text-red-600 ${isMenu ? 'text-red-600' : ''}`}>
          Μενού
        </Link>
        <a href="#contact" className="hover:text-red-600">Επικοινωνία</a>
      </div>
    </header>
  )
}
