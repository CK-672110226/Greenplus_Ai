import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useSelector } from 'react-redux'
import { NavBar } from './components/NavBar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { ScanPage } from './pages/ScanPage'
import { BasketPage } from './pages/BasketPage'
import { MapPage } from './pages/MapPage'
import { MarketplacePage } from './pages/MarketplacePage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminPage } from './pages/AdminPage'
import { SettingsPage } from './pages/SettingsPage'
import { EcoPointsPage } from './pages/EcoPointsPage'
import { ProfilePage } from './pages/ProfilePage'
import { useAuth } from './hooks/useAuth'

function AuthInitializer({ children }) {
  useAuth()
  const darkMode = useSelector(s => s.user.darkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Toaster richColors position="top-right" />
        <div className="min-h-screen bg-[var(--paper)] flex flex-col">
          <NavBar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/scan" element={
              <ProtectedRoute requiredRole="user"><ScanPage /></ProtectedRoute>
            } />
            <Route path="/basket" element={
              <ProtectedRoute requiredRole="user"><BasketPage /></ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute requiredRole="user"><MapPage /></ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute><MarketplacePage /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="buyer"><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><SettingsPage /></ProtectedRoute>
            } />
            <Route path="/eco-points" element={
              <ProtectedRoute><EcoPointsPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthInitializer>
    </BrowserRouter>
  )
}

export default App
