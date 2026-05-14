import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { SmartLayout } from './layouts/SmartLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import { setDarkMode } from './store/userSlice'

// Eagerly loaded — always needed on first paint
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { AdminLoginPage } from './pages/AdminLoginPage'

// Lazy-loaded — split into separate chunks; ONNX WASM only loads when ScanPage mounts
const HomePage       = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const ScanPage       = lazy(() => import('./pages/ScanPage').then(m => ({ default: m.ScanPage })))
const BasketPage     = lazy(() => import('./pages/BasketPage').then(m => ({ default: m.BasketPage })))
const MapPage        = lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })))
const EcoPointsPage  = lazy(() => import('./pages/EcoPointsPage').then(m => ({ default: m.EcoPointsPage })))
const MarketplacePage= lazy(() => import('./pages/MarketplacePage').then(m => ({ default: m.MarketplacePage })))
const DashboardPage  = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AdminPage      = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })))
const SettingsPage   = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const ProfilePage    = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))

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
  const dispatch = useDispatch()
  const darkMode = useSelector(s => s.user.darkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
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
    <BrowserRouter>
      <AuthInitializer>
        <Toaster richColors position="top-right" />
        <SpeedInsights />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<SmartLayout />}>
              {/* Public — no lazy (needed on first render) */}
              <Route path="/"        element={<LandingPage />} />
              <Route path="/login"   element={<LoginPage />} />
              <Route path="/x/admin" element={<AdminLoginPage />} />

              {/* User portal */}
              <Route path="/home"       element={<ProtectedRoute requiredRole="user"><HomePage /></ProtectedRoute>} />
              <Route path="/scan"       element={<ProtectedRoute requiredRole="user"><ScanPage /></ProtectedRoute>} />
              <Route path="/basket"     element={<ProtectedRoute requiredRole="user"><BasketPage /></ProtectedRoute>} />
              <Route path="/map"        element={<ProtectedRoute requiredRole="user"><MapPage /></ProtectedRoute>} />
              <Route path="/eco-points" element={<ProtectedRoute requiredRole="user"><EcoPointsPage /></ProtectedRoute>} />

              {/* Buyer portal */}
              <Route path="/dashboard" element={<ProtectedRoute requiredRole="buyer"><DashboardPage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>} />

              {/* All authenticated roles */}
              <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
              <Route path="/settings"    element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </AuthInitializer>
    </BrowserRouter>
  )
}

export default App
