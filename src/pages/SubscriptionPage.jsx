import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Check, Loader2, Crown, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const SubscriptionPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const plans = [
    {
      id: 'monthly',
      name: 'Mensual',
      price: '€3.99',
      period: 'mes',
      priceId: 'price_1SaHGZKaVeD7UHKtcLt8EE2u',
      features: [
        'Hasta 25 jugadores',
        'Partidos ilimitados',
        '10 usuarios por licencia',
        'Estadísticas detalladas',
        'Exportación PDF',
        'Soporte por email'
      ],
      popular: false
    },
    {
      id: 'annual',
      name: 'Anual',
      price: '€25',
      period: 'año',
      priceId: 'price_1SaHGkKaVeD7UHKtf5WGZHGq',
      savings: 'Ahorra 48%',
      features: [
        'Todo del plan mensual',
        '2 meses gratis',
        'Soporte prioritario',
        'Novedades anticipadas'
      ],
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: '€49',
period: 'pago único',
      priceId: 'price_1SaHGuKaVeD7UHKtAmxN1xMN',
      savings: 'Para siempre',
      features: [
        'Todo del plan anual',
        'Pago único',
        'Sin renovaciones',
        'Actualizaciones de por vida',
        'Soporte VIP'
      ],
      popular: false
    }
  ]

  const handleSubscribe = async (priceId, planId) => {
    try {
      setLoading(true)
      setSelectedPlan(planId)

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Debes iniciar sesión')
        navigate('/login')
        return
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription`,
          isLifetime: planId === 'lifetime'
        })
      })

      const session = await response.json()

      if (session.error) {
        throw new Error(session.error)
      }

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
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Elige tu plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecciona el plan perfecto para tu equipo
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.popular ? 'ring-4 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold text-center">
                  <Zap className="inline h-4 w-4 mr-1" />
                  Más Popular
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/ {plan.period}</span>
                  </div>
                  {plan.savings && (
                    <span className="inline-block mt-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Suscribirse'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">Pago seguro con Stripe</p>
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="text-sm">Cancela cuando quieras</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="text-sm">Sin permanencia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPage