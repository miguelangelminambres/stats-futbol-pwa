import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { LicenseProvider } from '@/contexts/LicenseContext'

import ProtectedRoute from '@/components/common/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import InstallPWA from '@/components/common/InstallPWA'

import LicenseValidation from '@/pages/auth/LicenseValidation'
import Register from '@/pages/auth/Register'
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/Dashboard'
import PlayersPage from '@/pages/PlayersPage'
import PlayerStatsPage from '@/pages/PlayerStatsPage'
import MatchesPage from '@/pages/MatchesPage'
import MatchDetailPage from '@/pages/MatchDetailPage'
import StatsPage from '@/pages/StatsPage'
import SettingsPage from '@/pages/SettingsPage'
import SubscriptionPage from '@/pages/SubscriptionPage'
import SubscriptionSuccess from '@/pages/SubscriptionSuccess'
function App() {
  return (
    <Router>
      <AuthProvider>
        <LicenseProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/license" element={<LicenseValidation />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/license" replace />} />

            {/* Rutas protegidas */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/players" element={
              <ProtectedRoute>
                <MainLayout>
                  <PlayersPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/players/:playerId/stats" element={
              <ProtectedRoute>
                <MainLayout>
                  <PlayerStatsPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/matches" element={
              <ProtectedRoute>
                <MainLayout>
                  <MatchesPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/matches/:matchId" element={
              <ProtectedRoute>
                <MainLayout>
                  <MatchDetailPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            {/* ✅ STATS - Ahora protegida y con layout */}
            <Route path="/stats" element={
              <ProtectedRoute>
                <MainLayout>
                  <StatsPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            {/* ✅ SETTINGS - Ahora protegida y con layout */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <MainLayout>
                  <SettingsPage />
                </MainLayout>
              </ProtectedRoute>
            } />
{/* 💳 SUSCRIPCIÓN */}
<Route path="/subscription" element={
  <ProtectedRoute>
    <MainLayout>
      <SubscriptionPage />
    </MainLayout>
  </ProtectedRoute>
} />

<Route path="/subscription/success" element={
  <ProtectedRoute>
    <MainLayout>
      <SubscriptionSuccess />
    </MainLayout>
  </ProtectedRoute>
} />
          </Routes>
          
          {/* Componentes globales */}
          <Toaster position="top-right" />
          <InstallPWA />
        </LicenseProvider>
      </AuthProvider>
    </Router>
  )
}

export default App