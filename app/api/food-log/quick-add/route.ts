import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { quickAddSchema } from '@/lib/validations/food'
import { updateStreak } from '@/lib/utils/streaks'
import { addXP, XP_FOOD_LOG } from '@/lib/utils/xp'
import { processGamification } from '@/lib/utils/gamification'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = quickAddSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { data: log, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: user.id,
        food_id: null,
        meal_type: parsed.data.meal_type,
        log_date: parsed.data.log_date,
        servings: 1,
        calories: parsed.data.calories,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
        fiber_g: null,
        notes: parsed.data.notes || null,
      })
      .select('*, food:foods(*)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await Promise.allSettled([
      updateStreak(supabase, user.id, 'food_log', parsed.data.log_date),
      addXP(supabase, user.id, XP_FOOD_LOG),
    ])

    const gamification = await processGamification(supabase, user.id, {
      achievementCategories: ['logging'],
      challengeMetric: 'food_log_streak',
    }).catch(() => null)

    return NextResponse.json({ log, gamification }, { status: 201 })
  } catch (error) {
    console.error('Quick add error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
