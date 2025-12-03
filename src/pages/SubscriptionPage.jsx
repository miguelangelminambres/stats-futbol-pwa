import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useLicense } from '@/contexts/LicenseContext'
import { supabase } from '@/lib/supabaseClient'
import { Check, Loader2, Crown, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

// Inicializar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const SubscriptionPage = () => {
  const { currentLicense } = useLicense()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const plans = [
    {
      id: 'monthly',
      name: 'Mensual',
      price: '€3.99',
      period: 'mes',
      priceId: 'price_1SaHGkKaVeD7UHKtf5WGZHGq',
      features: [
        'Gestión ilimitada de jugadores',
        'Registro de partidos y estadísticas',
        'Gráficos avanzados',
        'Exportación PDF',
        'Fotos de jugadores',
        'Soporte por email'
      ],
      popular: false
    },
    {
      id: 'annual',
      name: 'Anual',
      price: '€25',
      period: 'año',
      priceId: 'price_1SaHGZKaVeD7UHKtcLt8EE2u',
      savings: 'Ahorra 48%',
      originalPrice: '€47.88',
      features: [
        'Gestión ilimitada de jugadores',
        'Registro de partidos y estadísticas',
        'Gráficos avanzados',
        'Exportación PDF',
        'Fotos de jugadores',
        'Soporte prioritario',
        '2 meses gratis'
      ],
      popular: true

    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: '€49',
      period: 'para siempre',
      priceId: 'price_1SaHGuKaVeD7UHKtAmxN1xMN',
      savings: 'Pago único',
      features: [
        'Gestión ilimitada de jugadores',
        'Registro de partidos y estadísticas',
        'Gráficos avanzados',
        'Exportación PDF',
        'Fotos de jugadores',
        'Soporte prioritario',
        'Acceso de por vida',
        'Sin pagos recurrentes'
      ],
      popular: false
    }
  ]

  const handleSubscribe = async (priceId, planId) => {
  try {
    setLoading(true)
    setSelectedPlan(planId)

    // Obtener el user_id actual
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Debes iniciar sesión')
      return
    }

    // Crear sesión de Checkout en Stripe
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
     body: JSON.stringify({
  priceId,
  userId: user.id,
  licenseId: currentLicense.id,
  successUrl: `${window.location.origin}/subscription/success`,
  cancelUrl: `${window.location.origin}/subscription`,
  isLifetime: planId === 'lifetime'
})
    })

    const session = await response.json()

    if (session.error) {
      throw new Error(session.error)
    }

    // Redirigir directamente a la URL de checkout
    window.location.href = session.url

  } catch (error) {
    console.error('Error al crear suscripción:', error)
    toast.error('Error al procesar el pago')
  } finally {
    setLoading(false)
    setSelectedPlan(null)
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Activa tu cuenta
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Elige el plan perfecto para tu equipo y empieza a gestionar estadísticas como un profesional
          </p>
          
          {currentLicense && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-sm text-gray-600">Equipo:</span>
              <span className="text-sm font-semibold text-gray-900">{currentLicense.name}</span>
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.popular ? 'ring-4 ring-blue-500' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  <Zap className="inline h-4 w-4 mr-1" />
                  Más Popular
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600">/ {plan.period}</span>
                  </div>
                  
                  {plan.savings && (
                    <div className="mt-2">
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {plan.savings}
                      </span>
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        {plan.originalPrice}/año
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Suscribirse ahora'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Pago seguro procesado por Stripe
          </p>
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="text-sm">Cancela cuando quieras</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="text-sm">Sin permanencia</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="text-sm">Soporte 24/7</span>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            ¿Tienes preguntas?{' '}
            <a href="mailto:soporte@statsfutbol.com" className="text-blue-600 hover:text-blue-700 font-semibold">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPage
