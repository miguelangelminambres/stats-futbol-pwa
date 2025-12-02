import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'

const SubscriptionSuccess = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirigir al dashboard después de 5 segundos
    const timer = setTimeout(() => {
      navigate('/dashboard')
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Suscripción activada!
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          Tu cuenta ha sido activada exitosamente. Ya puedes disfrutar de todas las funcionalidades premium de Stats Fútbol.
        </p>

        {/* Features List */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Ahora tienes acceso a:
          </p>
          <ul className="text-left text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              Gestión ilimitada de jugadores
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              Registro completo de estadísticas
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              Gráficos avanzados
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              Exportación PDF
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              Fotos de jugadores
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          Ir al Dashboard
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Auto redirect message */}
        <p className="mt-4 text-sm text-gray-500">
          Serás redirigido automáticamente en 5 segundos...
        </p>
      </div>
    </div>
  )
}

export default SubscriptionSuccess