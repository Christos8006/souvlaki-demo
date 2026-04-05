import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { syncOrdersFromPersistedStorage } from './store/ordersStore'
import { syncShopSettingsFromStorage } from './store/shopSettingsStore'
import { subscribeOrdersRemote } from './utils/orderSync'
import { subscribeShopSettingsRemote } from './utils/shopSettingsSync'
import { startSiteVisitHeartbeat, touchSiteVisit } from './utils/siteAnalytics'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import WelcomeModal from './components/WelcomeModal'
import CustomerBanners from './components/CustomerBanners'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import AdminGate from './pages/AdminGate'

function AppShell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) return
    void syncOrdersFromPersistedStorage()
    return subscribeOrdersRemote(syncOrdersFromPersistedStorage)
  }, [isAdmin])

  useEffect(() => {
    void syncShopSettingsFromStorage()
    return subscribeShopSettingsRemote(syncShopSettingsFromStorage)
  }, [])

  useEffect(() => {
    if (isAdmin) return undefined
    return startSiteVisitHeartbeat(() => window.location.pathname)
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin) return
    void touchSiteVisit(pathname)
  }, [isAdmin, pathname])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isAdmin && (
        <div className="sticky top-0 z-50 shadow-md">
          <CustomerBanners />
          <Header />
        </div>
      )}
      {!isAdmin && <CartDrawer />}
      {!isAdmin && <WelcomeModal />}
      <main className={isAdmin ? '' : 'flex-1'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/admin" element={<AdminGate />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
