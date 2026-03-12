import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { waterLogSchema } from '@/lib/validations/food'
import { updateStreak } from '@/lib/utils/streaks'
import { addXP, XP_WATER_LOG } from '@/lib/utils/xp'
import { processGamification } from '@/lib/utils/gamification'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const date = request.nextUrl.searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')

    const { data: entries, error } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', date)
      .order('logged_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const total_ml = (entries || []).reduce((sum, e) => sum + e.amount_ml, 0)

    return NextResponse.json({ total_ml, entries: entries || [] })
  } catch (error) {
    console.error('Water GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = waterLogSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { data: entry, error } = await supabase
      .from('water_logs')
      .insert({
        user_id: user.id,
        amount_ml: parsed.data.amount_ml,
        log_date: parsed.data.log_date,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get new total
    const { data: entries } = await supabase
      .from('water_logs')
      .select('amount_ml')
      .eq('user_id', user.id)
      .eq('log_date', parsed.data.log_date)

    const total_ml = (entries || []).reduce((sum, e) => sum + e.amount_ml, 0)

    await Promise.allSettled([
      updateStreak(supabase, user.id, 'water', parsed.data.log_date),
      addXP(supabase, user.id, XP_WATER_LOG),
    ])

    const gamification = await processGamification(supabase, user.id, {
      achievementCategories: ['logging'],
      challengeMetric: 'water_goal_days',
    }).catch(() => null)

    return NextResponse.json({ entry, total_ml, gamification }, { status: 201 })
  } catch (error) {
    console.error('Water POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
