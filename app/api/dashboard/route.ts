import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { format, subDays } from 'date-fns'
import type { FoodLog, MealType } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const date = request.nextUrl.searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
    const weekStart = format(subDays(new Date(date), 6), 'yyyy-MM-dd')

    const [foodLogResult, waterResult, streaksResult, xpResult, weeklyResult, profileResult] =
      await Promise.all([
        // Today's food log
        supabase
          .from('food_logs')
          .select('*, food:foods(*)')
          .eq('user_id', user.id)
          .eq('log_date', date)
          .order('logged_at', { ascending: true }),
        // Today's water
        supabase
          .from('water_logs')
          .select('amount_ml')
          .eq('user_id', user.id)
          .eq('log_date', date),
        // Streaks
        supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id),
        // XP
        supabase
          .from('user_xp')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        // 7-day food log aggregation
        supabase
          .from('food_logs')
          .select('log_date, calories')
          .eq('user_id', user.id)
          .gte('log_date', weekStart)
          .lte('log_date', date),
        // Profile for targets
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
      ])

    // Group food logs by meal type
    const meals: Record<MealType, FoodLog[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    }

    let calories = 0, protein_g = 0, carbs_g = 0, fat_g = 0, fiber_g = 0

    for (const log of foodLogResult.data || []) {
      meals[log.meal_type as MealType].push(log)
      calories += log.calories || 0
      protein_g += log.protein_g || 0
      carbs_g += log.carbs_g || 0
      fat_g += log.fat_g || 0
      fiber_g += log.fiber_g || 0
    }

    // Aggregate weekly calories by day
    const weeklyMap = new Map<string, number>()
    for (let i = 6; i >= 0; i--) {
      weeklyMap.set(format(subDays(new Date(date), i), 'yyyy-MM-dd'), 0)
    }
    for (const log of weeklyResult.data || []) {
      const current = weeklyMap.get(log.log_date) || 0
      weeklyMap.set(log.log_date, current + (log.calories || 0))
    }
    const weekly_calories = Array.from(weeklyMap.entries()).map(([d, c]) => ({
      date: d,
      calories: Math.round(c),
    }))

    const water_total_ml = (waterResult.data || []).reduce(
      (sum, e) => sum + e.amount_ml,
      0
    )

    const profile = profileResult.data

    return NextResponse.json({
      daily_totals: {
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
      meals,
      water_total_ml,
      streaks: streaksResult.data || [],
      xp: xpResult.data || { total_xp: 0, current_level: 1 },
      weekly_calories,
      profile,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
