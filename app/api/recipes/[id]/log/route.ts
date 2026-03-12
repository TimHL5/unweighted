import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { recipeLogSchema } from '@/lib/validations/recipe'
import { updateStreak } from '@/lib/utils/streaks'
import { addXP, XP_FOOD_LOG } from '@/lib/utils/xp'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = recipeLogSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Fetch recipe for totals
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (recipeError || !recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // Compute per-serving × portions
    const servings = recipe.servings || 1
    const calories = Math.round(((recipe.total_calories || 0) / servings) * data.servings)
    const protein_g = Math.round(((recipe.total_protein_g || 0) / servings) * data.servings * 10) / 10
    const carbs_g = Math.round(((recipe.total_carbs_g || 0) / servings) * data.servings * 10) / 10
    const fat_g = Math.round(((recipe.total_fat_g || 0) / servings) * data.servings * 10) / 10

    const { data: log, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: user.id,
        food_id: null,
        recipe_id: id,
        meal_type: data.meal_type,
        log_date: data.log_date,
        servings: data.servings,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await Promise.allSettled([
      updateStreak(supabase, user.id, 'food_log', data.log_date),
      addXP(supabase, user.id, XP_FOOD_LOG),
    ])

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    console.error('Recipe log POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
