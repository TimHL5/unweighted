import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { foodLogCreateSchema } from '@/lib/validations/food'
import { updateStreak } from '@/lib/utils/streaks'
import { addXP, XP_FOOD_LOG } from '@/lib/utils/xp'
import { format } from 'date-fns'
import { broadcastSystemMessage } from '@/lib/utils/group-messages'
import { processGamification } from '@/lib/utils/gamification'
import type { FoodLog, MealType } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const date = request.nextUrl.searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')

    const { data: logs, error } = await supabase
      .from('food_logs')
      .select('*, food:foods(*)')
      .eq('user_id', user.id)
      .eq('log_date', date)
      .order('logged_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by meal type
    const meals: Record<MealType, FoodLog[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    }

    let calories = 0, protein_g = 0, carbs_g = 0, fat_g = 0, fiber_g = 0

    for (const log of logs || []) {
      meals[log.meal_type as MealType].push(log)
      calories += log.calories || 0
      protein_g += log.protein_g || 0
      carbs_g += log.carbs_g || 0
      fat_g += log.fat_g || 0
      fiber_g += log.fiber_g || 0
    }

    // Fetch targets from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_calorie_target, protein_target_g, carb_target_g, fat_target_g, fiber_target_g')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      date,
      meals,
      totals: {
        calories: Math.round(calories),
        protein_g: Math.round(protein_g),
        carbs_g: Math.round(carbs_g),
        fat_g: Math.round(fat_g),
        fiber_g: Math.round(fiber_g),
      },
      targets: {
        calories: profile?.daily_calorie_target || 2000,
        protein_g: profile?.protein_target_g || 150,
        carbs_g: profile?.carb_target_g || 200,
        fat_g: profile?.fat_target_g || 65,
        fiber_g: profile?.fiber_target_g || 30,
      },
    })
  } catch (error) {
    console.error('Food log GET error:', error)
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
    const parsed = foodLogCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data
    let calories = data.calories || 0
    let protein_g = data.protein_g || null
    let carbs_g = data.carbs_g || null
    let fat_g = data.fat_g || null
    let fiber_g = data.fiber_g || null

    // If food_id provided, compute macros from food × servings
    if (data.food_id) {
      const { data: food } = await supabase
        .from('foods')
        .select('*')
        .eq('id', data.food_id)
        .single()

      if (food) {
        calories = Math.round(food.calories_per_serving * data.servings)
        protein_g = food.protein_g ? Math.round(food.protein_g * data.servings * 10) / 10 : null
        carbs_g = food.carbs_g ? Math.round(food.carbs_g * data.servings * 10) / 10 : null
        fat_g = food.fat_g ? Math.round(food.fat_g * data.servings * 10) / 10 : null
        fiber_g = food.fiber_g ? Math.round(food.fiber_g * data.servings * 10) / 10 : null
      }
    }

    const { data: log, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: user.id,
        food_id: data.food_id || null,
        recipe_id: data.recipe_id || null,
        meal_type: data.meal_type,
        log_date: data.log_date,
        servings: data.servings,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        fiber_g,
        notes: data.notes || null,
      })
      .select('*, food:foods(*)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update streak and XP (non-blocking, don't fail the request)
    await Promise.allSettled([
      updateStreak(supabase, user.id, 'food_log', data.log_date),
      addXP(supabase, user.id, XP_FOOD_LOG),
    ])

    // Broadcast system message for first item of this meal type today
    const { count: mealCount } = await supabase
      .from('food_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('log_date', data.log_date)
      .eq('meal_type', data.meal_type)

    if (mealCount === 1) {
      broadcastSystemMessage(supabase, user.id, `logged ${data.meal_type}`).catch(() => { })
    }

    const gamification = await processGamification(supabase, user.id, {
      achievementCategories: ['logging'],
      challengeMetric: 'food_log_streak',
    }).catch(() => null)

    return NextResponse.json({ log, gamification }, { status: 201 })
  } catch (error) {
    console.error('Food log POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
