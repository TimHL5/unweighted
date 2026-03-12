import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let subscription = null

    if (profile.stripe_customer_id && profile.subscription_status === 'active') {
      try {
        const subscriptions = await getStripe().subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'active',
          limit: 1,
        })

        if (subscriptions.data.length > 0) {
          const sub = subscriptions.data[0]
          const item = sub.items.data[0]
          subscription = {
            id: sub.id,
            status: sub.status,
            current_period_end: item.current_period_end,
            cancel_at_period_end: sub.cancel_at_period_end,
            plan_amount: item.price.unit_amount,
            plan_interval: item.price.recurring?.interval,
          }
        }
      } catch {
        // Stripe fetch failed, return profile data without subscription details
      }
    }

    return NextResponse.json({
      tier: profile.subscription_tier,
      status: profile.subscription_status,
      subscription,
    })
  } catch (error) {
    console.error('Billing status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
