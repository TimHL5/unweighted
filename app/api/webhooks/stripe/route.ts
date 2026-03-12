import { getStripe, tierFromPriceId } from '@/lib/stripe/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

async function getUserIdFromCustomer(
  supabase: ReturnType<typeof createAdminClient>,
  customerId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.id || null
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription' || !session.subscription) break

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        const priceId = subscription.items.data[0]?.price.id
        const tier = tierFromPriceId(priceId) || 'free'
        const userId =
          subscription.metadata.supabase_user_id ||
          session.metadata?.supabase_user_id

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
              subscription_status: 'active',
              stripe_customer_id: session.customer as string,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const userId = await getUserIdFromCustomer(supabase, customerId)
        if (!userId) break

        const priceId = subscription.items.data[0]?.price.id
        const tier = tierFromPriceId(priceId) || 'free'
        const status = subscription.status

        if (status === 'canceled' || status === 'unpaid') {
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_status: status,
            })
            .eq('id', userId)
        } else {
          await supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
              subscription_status: status,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const userId = await getUserIdFromCustomer(supabase, customerId)
        if (!userId) break

        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
          })
          .eq('id', userId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        if (!customerId) break

        const userId = await getUserIdFromCustomer(supabase, customerId)
        if (!userId) break

        await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', userId)

        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'payment_failed',
          title: 'Payment Failed',
          body: 'Your subscription payment failed. Please update your payment method to continue your plan.',
        })
        break
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
