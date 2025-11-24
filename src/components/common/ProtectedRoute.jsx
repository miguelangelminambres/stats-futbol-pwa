import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Loading from './Loading'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading message="Verificando sesión..." />
  }

  if (!user) {
    // Redirigir a licencia en lugar de login
    return <Navigate to="/license" replace />
  }

  return children
}

export default ProtectedRoute