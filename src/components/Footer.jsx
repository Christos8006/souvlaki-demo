import { Link, useLocation } from 'react-router-dom'
import useShopSettingsStore from '../store/shopSettingsStore'
import { SHOP_NAME, STUDIO_NAME } from '../config/branding'

export default function Footer() {
  const { pathname } = useLocation()
  const orderingOpen = useShopSettingsStore((s) => s.orderingOpen)

  return (
    <footer id="contact" className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-red-600 text-white font-black text-xl px-3 py-1 rounded-lg">
              ΓΥΡΟΣ
            </div>
            <span className="text-white font-bold text-lg">Σπίτι</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            25 χρόνια παράδοσης στη γεύση. Ντόπια κρέατα, φρέσκα υλικά και
            αγάπη σε κάθε μπουκιά.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Hours */}
        <div>
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">
            Ώρες Λειτουργίας
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Καθημερινά</span>
              <span className="text-white font-medium">12:00 – 02:00</span>
            </div>
            <div className="flex justify-between">
              <span>Σαββατοκύριακο</span>
              <span className="text-white font-medium">12:00 – 03:00</span>
            </div>
          </div>
          <div
            className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold max-w-full ${
              orderingOpen
                ? 'bg-green-900/50 text-green-400'
                : 'bg-amber-900/40 text-amber-200 border border-amber-700/50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                orderingOpen ? 'bg-green-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            {orderingOpen ? 'Ανοιχτά τώρα' : 'Εκτός λειτουργίας — ελάτε αργότερα'}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">
            Επικοινωνία
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Ασκληπιού 27, Λάρισα</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href="tel:+302410531774" className="hover:text-white transition-colors">
                2410 531 774
              </a>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:info@gyrosspiτi.gr" className="hover:text-white transition-colors">
                info@gyrosspiτi.gr
              </a>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Delivery: ~30–45 λεπτά</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-600 space-y-2">
        <p>© 2026 {SHOP_NAME} — Demo App</p>
        {pathname === '/' && (
          <p className="text-gray-500">
            Κατασκευή ιστοσελίδας ·{' '}
            <span className="font-black text-gray-400 tracking-wide">{STUDIO_NAME}</span>
          </p>
        )}
        <p>
          <Link to="/admin" className="text-gray-500 hover:text-gray-400 underline-offset-2 hover:underline">
            Πίνακας παραγγελιών (προσωπικό)
          </Link>
        </p>
      </div>
    </footer>
  )
}
