import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLicense } from '@/contexts/LicenseContext'
import Loading from './Loading'

const ProtectedRoute = ({ children, requireLicense = true }) => {
  const { user, loading: authLoading } = useAuth()
  const { currentLicense, loading: licenseLoading } = useLicense()

  if (authLoading || licenseLoading) {
    return <Loading message="Verificando sesión..." />
  }

  // Si no hay usuario, ir a login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si requiere licencia y no tiene, ir a suscripción
  if (requireLicense && !currentLicense) {
    return <Navigate to="/subscription" replace />
  }

  return children
}

export default ProtectedRoute