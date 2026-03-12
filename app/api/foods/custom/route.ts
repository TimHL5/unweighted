import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { customFoodSchema } from '@/lib/validations/food'
import { FREE_TIER_LIMITS } from '@/lib/utils/subscription'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check free tier custom food limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier === 'free') {
      const { count } = await supabase
        .from('foods')
        .select('id', { count: 'exact', head: true })
        .eq('source', 'user')
        .eq('created_by', user.id)

      if ((count || 0) >= FREE_TIER_LIMITS.custom_foods) {
        return NextResponse.json(
          {
            error: `Free plan allows up to ${FREE_TIER_LIMITS.custom_foods} custom foods. Upgrade to Pro for unlimited.`,
            upgrade_required: true,
          },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const parsed = customFoodSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { data: food, error } = await supabase
      .from('foods')
      .insert({
        ...parsed.data,
        source: 'user',
        created_by: user.id,
        is_verified: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ food }, { status: 201 })
  } catch (error) {
    console.error('Custom food creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
