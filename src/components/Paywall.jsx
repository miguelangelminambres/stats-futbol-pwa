import { useNavigate } from 'react-router-dom'
import { Lock, Crown, Zap } from 'lucide-react'
import { useLicense } from '@/contexts/LicenseContext'

const Paywall = () => {
  const navigate = useNavigate()
  const { currentLicense } = useLicense()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Activa tu cuenta
            </h1>
            <p className="text-blue-100">
              Tu equipo: <span className="font-semibold">{currentLicense?.name || 'Equipo'}</span>
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-gray-600 text-center mb-8">
              Para empezar a usar Stats Fútbol y gestionar las estadísticas de tu equipo, 
              necesitas activar tu suscripción.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Crown className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Jugadores ilimitados
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gestiona toda tu plantilla sin límites
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Gráficos avanzados
                  </h3>
                  <p className="text-sm text-gray-600">
                    Visualiza el rendimiento del equipo
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Crown className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Estadísticas completas
                  </h3>
                  <p className="text-sm text-gray-600">
                    Registra goles, asistencias, minutos y más
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Exportación PDF
                  </h3>
                  <p className="text-sm text-gray-600">
                    Genera reportes profesionales
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Preview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Desde</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">$3.99</span>
                    <span className="text-gray-600">/ mes</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    Ahorra 48% anual
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/subscription')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Ver planes y suscribirse
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all"
              >
                Cerrar sesión
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Sin permanencia
                </div>
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Cancela cuando quieras
                </div>
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Pago seguro
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Paywall