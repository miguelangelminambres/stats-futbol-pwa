import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Necesitarás añadir esta variable
)

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const { userId, licenseId } = session.metadata

        // Activar licencia
        await supabase
          .from('licenses')
          .update({
            status: 'active',
            activated_at: new Date().toISOString(),
            expires_at: null, // Se actualiza con el webhook de subscription
          })
          .eq('id', licenseId)

        console.log(`Licencia ${licenseId} activada para usuario ${userId}`)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const { licenseId } = subscription.metadata

        // Calcular fecha de expiración
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString()

        // Actualizar licencia
        await supabase
          .from('licenses')
          .update({
            status: 'active',
            expires_at: expiresAt,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer,
          })
          .eq('id', licenseId)

        console.log(`Suscripción actualizada para licencia ${licenseId}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const { licenseId } = subscription.metadata

        // Desactivar licencia
        await supabase
          .from('licenses')
          .update({
            status: 'expired',
          })
          .eq('id', licenseId)

        console.log(`Suscripción cancelada para licencia ${licenseId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
        const { licenseId } = subscription.metadata

        // Marcar como pendiente de pago
        await supabase
          .from('licenses')
          .update({
            status: 'payment_failed',
          })
          .eq('id', licenseId)

        console.log(`Pago fallido para licencia ${licenseId}`)
        break
      }

      default:
        console.log(`Evento no manejado: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}