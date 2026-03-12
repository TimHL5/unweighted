import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { recipeCreateSchema } from '@/lib/validations/recipe'
import { processGamification } from '@/lib/utils/gamification'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ recipes })
  } catch (error) {
    console.error('Recipes GET error:', error)
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
    const parsed = recipeCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Fetch all referenced foods in one query for nutrition calculation
    const foodIds = data.ingredients.map((i) => i.food_id)
    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select('*')
      .in('id', foodIds)

    if (foodsError || !foods) {
      return NextResponse.json({ error: 'Failed to fetch ingredient foods' }, { status: 500 })
    }

    const foodMap = new Map(foods.map((f) => [f.id, f]))

    // Calculate nutrition totals
    let total_calories = 0
    let total_protein_g = 0
    let total_carbs_g = 0
    let total_fat_g = 0

    for (const ingredient of data.ingredients) {
      const food = foodMap.get(ingredient.food_id)
      if (!food) continue
      const ratio = ingredient.quantity / (food.serving_size_g || ingredient.quantity)
      total_calories += food.calories_per_serving * ratio
      total_protein_g += (food.protein_g || 0) * ratio
      total_carbs_g += (food.carbs_g || 0) * ratio
      total_fat_g += (food.fat_g || 0) * ratio
    }

    // Insert recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        servings: data.servings,
        prep_time_min: data.prep_time_min || null,
        cook_time_min: data.cook_time_min || null,
        instructions: data.instructions || null,
        is_public: data.is_public,
        total_calories: Math.round(total_calories),
        total_protein_g: Math.round(total_protein_g * 10) / 10,
        total_carbs_g: Math.round(total_carbs_g * 10) / 10,
        total_fat_g: Math.round(total_fat_g * 10) / 10,
      })
      .select()
      .single()

    if (recipeError || !recipe) {
      return NextResponse.json({ error: recipeError?.message || 'Failed to create recipe' }, { status: 500 })
    }

    // Insert ingredients
    const ingredientRows = data.ingredients.map((ing) => ({
      recipe_id: recipe.id,
      food_id: ing.food_id,
      quantity: ing.quantity,
      unit: ing.unit || null,
      order_index: ing.order_index,
    }))

    const { error: ingError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredientRows)

    if (ingError) {
      return NextResponse.json({ error: ingError.message }, { status: 500 })
    }

    // Fetch back with ingredients + foods
    const { data: fullRecipe } = await supabase
      .from('recipes')
      .select('*, ingredients:recipe_ingredients(*, food:foods(*))')
      .eq('id', recipe.id)
      .single()

    const gamification = await processGamification(supabase, user.id, {
      achievementCategories: ['logging'],
    }).catch(() => null)

    return NextResponse.json({ recipe: fullRecipe || recipe, gamification }, { status: 201 })
  } catch (error) {
    console.error('Recipes POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
