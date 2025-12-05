import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, userId, userEmail, successUrl, cancelUrl, isLifetime } = req.body

    if (!priceId || !userId || !userEmail) {
      return res.status(400).json({ error: 'Faltan datos requeridos' })
    }

    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isLifetime ? 'payment' : 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        userId,
        userEmail
      },
      allow_promotion_codes: true,
    }

    // Para suscripciones, añadir metadata a la suscripción también
    if (!isLifetime) {
      sessionConfig.subscription_data = {
        metadata: {
          userId,
          userEmail
        }
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: error.message })
  }
}