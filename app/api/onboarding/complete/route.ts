import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod/v4'

const onboardingSchema = z.object({
  goal_type: z.enum(['lose', 'gain', 'maintain', 'recomp']),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer_not_to_say']),
  date_of_birth: z.string(),
  height_cm: z.number().min(100).max(250),
  current_weight_kg: z.number().min(30).max(300),
  goal_weight_kg: z.number().min(30).max(300),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  diet_preferences: z.array(z.string()),
  challenges: z.array(z.string()),
  pace_kg_per_week: z.number().min(0).max(2),
  unit_system: z.enum(['imperial', 'metric']),
  daily_calorie_target: z.number().min(800).max(10000),
  protein_target_g: z.number().min(0),
  carb_target_g: z.number().min(0),
  fat_target_g: z.number().min(0),
  fiber_target_g: z.number().min(0),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = onboardingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Update profile with onboarding data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        goal_type: data.goal_type,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        height_cm: data.height_cm,
        current_weight_kg: data.current_weight_kg,
        goal_weight_kg: data.goal_weight_kg,
        activity_level: data.activity_level,
        daily_calorie_target: data.daily_calorie_target,
        protein_target_g: data.protein_target_g,
        carb_target_g: data.carb_target_g,
        fat_target_g: data.fat_target_g,
        fiber_target_g: data.fiber_target_g,
        unit_system: data.unit_system,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Create initial streaks
    const streakTypes = ['food_log', 'workout', 'weigh_in', 'water', 'check_in']
    const { error: streakError } = await supabase.from('user_streaks').upsert(
      streakTypes.map((type) => ({
        user_id: user.id,
        streak_type: type,
        current_count: 0,
        longest_count: 0,
        last_activity_date: null,
      })),
      { onConflict: 'user_id,streak_type' }
    )

    if (streakError) {
      console.error('Streak creation error:', streakError)
    }

    // Create initial XP record
    const { error: xpError } = await supabase.from('user_xp').upsert(
      {
        user_id: user.id,
        total_xp: 0,
        current_level: 1,
      },
      { onConflict: 'user_id' }
    )

    if (xpError) {
      console.error('XP creation error:', xpError)
    }

    // Log initial weight
    const { error: weightError } = await supabase.from('weight_logs').insert({
      user_id: user.id,
      weight_kg: data.current_weight_kg,
      log_date: new Date().toISOString().split('T')[0],
    })

    if (weightError) {
      console.error('Weight log error:', weightError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
