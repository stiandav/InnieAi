import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase/server'
import { getStripe, TIER_MRR, TIER_SETUP } from '@/lib/stripe'
import { sendEmail, sendOwnerAlert } from '@/lib/resend'
import { getWelcomeEmail } from '@/lib/email-templates/welcome'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerClient()
  const stripe = getStripe()

  // Idempotency: skip already-processed events (Stripe retries on non-2xx)
  // Requires: CREATE TABLE stripe_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_id text UNIQUE NOT NULL, event_type text NOT NULL, created_at timestamptz DEFAULT now())
  try {
    const { data: processed } = await supabase
      .from('stripe_events')
      .select('id')
      .eq('event_id', event.id)
      .single()
    if (processed) {
      return NextResponse.json({ received: true, skipped: true })
    }
    await supabase.from('stripe_events').insert({ event_id: event.id, event_type: event.type })
  } catch {
    // Table not yet created — proceed without idempotency guard
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata ?? {}
        const proposalId = metadata.proposal_id
        const tier = metadata.tier as 'Starter' | 'Growth' | 'Scale' | undefined
        const clientName = metadata.client_name ?? 'Client'
        const company = metadata.company ?? ''
        const monthlyPriceId = metadata.monthly_price_id
        const customerId = session.customer as string

        if (!tier) break

        // Create or update client record
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        let clientId: string

        if (!existingClient) {
          const customerDetails = session.customer_details
          const email = customerDetails?.email ?? ''

          const { data: newClient } = await supabase
            .from('clients')
            .insert({
              name: clientName,
              email,
              company: company || clientName,
              niche: 'unknown',
              tier,
              mrr: TIER_MRR[tier],
              setup_fee: TIER_SETUP[tier],
              stripe_customer_id: customerId,
              status: 'Onboarding',
            })
            .select('id, portal_token')
            .single()

          clientId = newClient?.id ?? ''

          // Create subscription for monthly retainer
          if (monthlyPriceId && customerId && clientId) {
            try {
              const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: monthlyPriceId }],
                metadata: { client_id: clientId },
              })

              await supabase
                .from('clients')
                .update({ stripe_subscription_id: subscription.id })
                .eq('id', clientId)
            } catch (e) {
              console.error('Failed to create subscription:', e)
            }
          }

          // Send welcome email
          if (email && newClient?.portal_token) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'
            const emailContent = getWelcomeEmail({
              clientName,
              company: company || clientName,
              tier,
              onboardingUrl: `${baseUrl}/onboard/${newClient.portal_token}`,
            })
            await sendEmail({
              to: email,
              subject: emailContent.subject,
              text: emailContent.text,
              html: emailContent.html,
            })
          }
        } else {
          clientId = existingClient.id
        }

        // Update proposal status
        if (proposalId) {
          await supabase
            .from('proposals')
            .update({ status: 'Accepted' })
            .eq('id', proposalId)
        }

        // Notify owner
        await sendOwnerAlert(
          `🎉 New Client: ${clientName} signed up for ${tier}`,
          `${clientName} at ${company} just paid the setup fee for ${tier}.\n\nSetup fee: $${(TIER_SETUP[tier] / 100).toLocaleString()}\nMonthly: $${(TIER_MRR[tier] / 100).toLocaleString()}/mo\n\nLog in to the admin dashboard to review.`
        )
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: client } = await supabase
          .from('clients')
          .select('id, name, email, company')
          .eq('stripe_customer_id', customerId)
          .single()

        if (client) {
          await supabase
            .from('clients')
            .update({ status: 'Payment Issue' })
            .eq('id', client.id)

          // Email client
          if (client.email) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'
            await sendEmail({
              to: client.email,
              subject: 'Action required: Payment failed for InnieAI',
              text: `Hi ${client.name},\n\nYour payment for InnieAI failed. Please update your payment method to continue your service.\n\nUpdate payment: ${baseUrl}/portal/${client.id}\n\nIf you need help, reply to this email.\n\nThe InnieAI Team`,
            })
          }

          // Alert owner
          await sendOwnerAlert(
            `⚠️ Payment Failed: ${client.company}`,
            `Payment failed for ${client.name} at ${client.company}.\n\nStripe customer: ${customerId}`
          )
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: client } = await supabase
          .from('clients')
          .select('id, name, email, company')
          .eq('stripe_customer_id', customerId)
          .single()

        if (client) {
          await supabase
            .from('clients')
            .update({ status: 'Churned' })
            .eq('id', client.id)

          // Win-back email
          if (client.email) {
            const calcomLink = process.env.CALCOM_LINK ?? 'https://cal.com/innieai'
            await sendEmail({
              to: client.email,
              subject: `We'd love to have you back, ${client.name.split(' ')[0]}`,
              text: `Hi ${client.name},\n\nWe noticed your InnieAI subscription has been cancelled.\n\nIf you'd like to discuss restarting or adjusting your plan, I'd be happy to chat: ${calcomLink}\n\nThe InnieAI Team`,
            })
          }

          await sendOwnerAlert(
            `❌ Churned: ${client.company}`,
            `${client.name} at ${client.company} cancelled their subscription.`
          )
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Reactivate if previously had payment issue
        await supabase
          .from('clients')
          .update({ status: 'Active' })
          .eq('stripe_customer_id', customerId)
          .eq('status', 'Payment Issue')
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    await sendOwnerAlert(
      '⚠️ Stripe Webhook Error',
      `Event: ${event.type}\nError: ${err instanceof Error ? err.message : String(err)}`
    )
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
