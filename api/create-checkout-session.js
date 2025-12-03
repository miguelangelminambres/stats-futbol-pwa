import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, userId, licenseId, successUrl, cancelUrl, isLifetime } = req.body

    // Configuración base
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        licenseId,
      },
    }

    // Lifetime = pago único, otros = suscripción
    if (isLifetime) {
      sessionConfig.mode = 'payment'
    } else {
      sessionConfig.mode = 'subscription'
      sessionConfig.subscription_data = {
        metadata: {
          userId,
          licenseId,
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    res.status(200).json({ id: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: error.message })
  }
}