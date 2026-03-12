import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe/config'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier, interval } = await request.json()
    if (!tier || !interval) {
      return NextResponse.json({ error: 'Missing tier or interval' }, { status: 400 })
    }

    // Look up price ID server-side where env vars are available
    const { PLANS } = await import('@/lib/stripe/config')
    const plan = PLANS.find((p) => p.tier === tier)
    if (!plan?.prices) {
      return NextResponse.json({ error: 'Invalid plan tier' }, { status: 400 })
    }
    const priceId = interval === 'yearly' ? plan.prices.yearlyPriceId : plan.prices.monthlyPriceId
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 400 })
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email || profile?.email || undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      // Save customer ID using admin client (bypasses RLS)
      const admin = createAdminClient()
      await admin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
