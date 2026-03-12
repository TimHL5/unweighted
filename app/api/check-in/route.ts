import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkInSchema } from '@/lib/validations/progress'
import { updateStreak } from '@/lib/utils/streaks'
import { addXP, XP_CHECK_IN } from '@/lib/utils/xp'
import { processGamification } from '@/lib/utils/gamification'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const date = request.nextUrl.searchParams.get('date')
    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
    }

    const { data: check_in } = await supabase
      .from('daily_check_ins')
      .select('*')
      .eq('user_id', user.id)
      .eq('check_in_date', date)
      .single()

    return NextResponse.json({ check_in: check_in || null })
  } catch (error) {
    console.error('Check-in GET error:', error)
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
    const parsed = checkInSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    const { data: check_in, error } = await supabase
      .from('daily_check_ins')
      .upsert(
        {
          user_id: user.id,
          check_in_date: data.check_in_date,
          mood: data.mood || null,
          energy: data.energy || null,
          sleep_hours: data.sleep_hours || null,
          sleep_quality: data.sleep_quality || null,
          stress_level: data.stress_level || null,
          hunger_level: data.hunger_level || null,
          notes: data.notes || null,
        },
        { onConflict: 'user_id,check_in_date' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await Promise.allSettled([
      updateStreak(supabase, user.id, 'check_in', data.check_in_date),
      addXP(supabase, user.id, XP_CHECK_IN),
    ])

    const gamification = await processGamification(supabase, user.id, {
      achievementCategories: ['accountability', 'logging'],
    }).catch(() => null)

    return NextResponse.json({ check_in, gamification })
  } catch (error) {
    console.error('Check-in POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
