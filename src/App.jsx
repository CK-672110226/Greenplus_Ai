import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { SmartLayout } from './layouts/SmartLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useAuth } from './hooks/useAuth'
import { useActiveModels } from './hooks/useActiveModels'
import { usePresence } from './hooks/usePresence'
import { useRealtimeNotifications } from './hooks/useRealtimeNotifications'
import { setDarkMode } from './store/userSlice'

// Eagerly loaded — always needed on first paint
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { Page404 } from './pages/Page404'
// Lazy-loaded — split into separate chunks; ONNX WASM only loads when ScanPage mounts
const HomePage       = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const ScanPage       = lazy(() => import('./pages/ScanPage').then(m => ({ default: m.ScanPage })))
const BasketPage     = lazy(() => import('./pages/BasketPage').then(m => ({ default: m.BasketPage })))
const MapPage        = lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })))
const MarketplacePage= lazy(() => import('./pages/MarketplacePage').then(m => ({ default: m.MarketplacePage })))
const DashboardPage     = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const SchedulePage      = lazy(() => import('./pages/SchedulePage').then(m => ({ default: m.SchedulePage })))
const PricingPage       = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const AdminPage         = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })))
const SettingsPage          = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const ProfilePage           = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const RiderDashboardPage    = lazy(() => import('./pages/RiderDashboardPage').then(m => ({ default: m.RiderDashboardPage })))
const DriverDashboardPage   = lazy(() => import('./pages/DriverDashboardPage').then(m => ({ default: m.DriverDashboardPage })))
const ChatPage              = lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })))
const BuyerOnboardingPage   = lazy(() => import('./pages/BuyerOnboardingPage').then(m => ({ default: m.BuyerOnboardingPage })))
const CatalogListPage   = lazy(() => import('./features/catalog/CatalogListPage').then(m => ({ default: m.CatalogListPage })))
const CatalogDetailPage = lazy(() => import('./features/catalog/CatalogDetailPage').then(m => ({ default: m.CatalogDetailPage })))
const CatalogFormPage   = lazy(() => import('./features/catalog/CatalogFormPage').then(m => ({ default: m.CatalogFormPage })))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest animate-pulse">
        Loading…
      </span>
    </div>
  )
}

function AuthInitializer({ children }) {
  useAuth()
  useActiveModels()
  usePresence()
  useRealtimeNotifications()
  const dispatch = useDispatch()
  const darkMode = useSelector(s => s.user.darkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('gp_dark', darkMode ? '1' : '0')
  }, [darkMode])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = e => {
      if (localStorage.getItem('gp_dark') === null) {
        dispatch(setDarkMode(e.matches))
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [dispatch])

  return children
}

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <AuthInitializer>
        <Toaster richColors position="top-right" />
        <SpeedInsights />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Full-page routes — manage their own layout */}
            <Route path="/"        element={<LandingPage />} />
            <Route path="/login"   element={<LoginPage />} />
            <Route path="/x/admin" element={<AdminLoginPage />} />

            {/* Catalog — public demo routes (RTK Query + CSS Modules) */}
            <Route path="/catalog"            element={<CatalogListPage />} />
            <Route path="/catalog/new"        element={<CatalogFormPage />} />
            <Route path="/catalog/:id"        element={<CatalogDetailPage />} />
            <Route path="/catalog/:id/edit"   element={<CatalogFormPage />} />

            <Route element={<SmartLayout />}>

              {/* User portal */}
              <Route path="/home"       element={<ProtectedRoute requiredRole="user"><HomePage /></ProtectedRoute>} />
              <Route path="/scan"       element={<ProtectedRoute requiredRole="user"><ScanPage /></ProtectedRoute>} />
              <Route path="/basket"     element={<ProtectedRoute requiredRole="user"><BasketPage /></ProtectedRoute>} />
              <Route path="/map"        element={<ProtectedRoute requiredRole="user"><MapPage /></ProtectedRoute>} />

              {/* Buyer portal */}
              <Route path="/dashboard"     element={<ProtectedRoute requiredRole="buyer"><DashboardPage /></ProtectedRoute>} />
              <Route path="/schedule"      element={<ProtectedRoute requiredRole="buyer"><SchedulePage /></ProtectedRoute>} />
              <Route path="/pricing"       element={<ProtectedRoute requiredRole="buyer"><PricingPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>} />

              {/* Buyer rider routes */}
              <Route path="/rider"      element={<ProtectedRoute requiredRole="buyer"><RiderDashboardPage /></ProtectedRoute>} />
              <Route path="/driver"     element={<ProtectedRoute requiredRole="buyer" allowIfDriver><DriverDashboardPage /></ProtectedRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute requiredRole="buyer"><BuyerOnboardingPage /></ProtectedRoute>} />

              {/* All authenticated roles */}
              <Route path="/marketplace"  element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
              <Route path="/settings"     element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/chat"         element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/chat/:roomId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Page404 />} />
          </Routes>
        </Suspense>
      </AuthInitializer>
    </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
