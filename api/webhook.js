import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const config = {
  api: { bodyParser: false }
}

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

function generateLicenseCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'SF-'
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
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
    console.error(`Webhook signature failed: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const { userId, userEmail } = session.metadata
        const isLifetime = session.mode === 'payment'

        console.log(`Checkout completado - User: ${userId}, Email: ${userEmail}, Lifetime: ${isLifetime}`)

        const { data: existingUserLicense } = await supabase
          .from('user_licenses')
          .select('license_id')
          .eq('user_id', userId)
          .single()

        let licenseId

        if (existingUserLicense) {
          licenseId = existingUserLicense.license_id
          console.log(`Usuario ya tiene licencia: ${licenseId}`)
        } else {
          const licenseCode = generateLicenseCode()
          
          const { data: newLicense, error: licenseError } = await supabase
            .from('licenses')
            .insert([{
              code: licenseCode,
              name: `Equipo de ${userEmail}`,
              status: 'active',
              license_type_id: 1,
              activated_at: new Date().toISOString(),
              expires_at: isLifetime ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              stripe_customer_id: session.customer,
              created_at: new Date().toISOString()
            }])
            .select()
            .single()

          if (licenseError) {
            console.error('Error creando licencia:', licenseError)
            throw licenseError
          }

          licenseId = newLicense.id
          console.log(`Nueva licencia creada: ${licenseId} (${licenseCode})`)

          const { error: linkError } = await supabase
            .from('user_licenses')
            .insert([{
              user_id: userId,
              license_id: licenseId,
              status: 'active',
              activated_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            }])

          if (linkError) {
            console.error('Error vinculando usuario:', linkError)
            throw linkError
          }
        }

        const updateData = {
          status: 'active',
          activated_at: new Date().toISOString(),
          stripe_customer_id: session.customer
        }

        if (isLifetime) {
          updateData.expires_at = null
        }

        await supabase
          .from('licenses')
          .update(updateData)
          .eq('id', licenseId)

        console.log(`Licencia ${licenseId} activada`)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer

        const { data: license } = await supabase
          .from('licenses')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!license) {
          console.log('No se encontró licencia para customer:', customerId)
          break
        }

        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString()

        await supabase
          .from('licenses')
          .update({
            status: 'active',
            expires_at: expiresAt,
            stripe_subscription_id: subscription.id
          })
          .eq('id', license.id)

        console.log(`Suscripción actualizada - Licencia: ${license.id}, Expira: ${expiresAt}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer

        const { data: license } = await supabase
          .from('licenses')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (license) {
          await supabase
            .from('licenses')
            .update({ status: 'expired' })
            .eq('id', license.id)

          console.log(`Suscripción cancelada - Licencia: ${license.id}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer

        const { data: license } = await supabase
          .from('licenses')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (license) {
          await supabase
            .from('licenses')
            .update({ status: 'payment_failed' })
            .eq('id', license.id)

          console.log(`Pago fallido - Licencia: ${license.id}`)
        }
        break
      }

      default:
        console.log(`Evento no manejado: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error en webhook:', error)
    res.status(500).json({ error: 'Webhook failed' })
  }
}