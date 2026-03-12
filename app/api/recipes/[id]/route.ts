import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { recipeUpdateSchema } from '@/lib/validations/recipe'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: recipe, error } = await supabase
      .from('recipes')
      .select('*, ingredients:recipe_ingredients(*, food:foods(*))')
      .eq('id', id)
      .single()

    if (error || !recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // Verify ownership or public
    if (recipe.user_id !== user.id && !recipe.is_public) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ recipe })
  } catch (error) {
    console.error('Recipe GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
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

    // Verify ownership
    const { data: existing } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = recipeUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data
    const updateData: Record<string, unknown> = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.servings !== undefined) updateData.servings = data.servings
    if (data.prep_time_min !== undefined) updateData.prep_time_min = data.prep_time_min
    if (data.cook_time_min !== undefined) updateData.cook_time_min = data.cook_time_min
    if (data.instructions !== undefined) updateData.instructions = data.instructions
    if (data.is_public !== undefined) updateData.is_public = data.is_public

    // If ingredients changed, recalculate nutrition
    if (data.ingredients) {
      const foodIds = data.ingredients.map((i) => i.food_id)
      const { data: foods } = await supabase
        .from('foods')
        .select('*')
        .in('id', foodIds)

      const foodMap = new Map((foods || []).map((f) => [f.id, f]))

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

      updateData.total_calories = Math.round(total_calories)
      updateData.total_protein_g = Math.round(total_protein_g * 10) / 10
      updateData.total_carbs_g = Math.round(total_carbs_g * 10) / 10
      updateData.total_fat_g = Math.round(total_fat_g * 10) / 10

      // Delete old ingredients, insert new
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', id)

      const ingredientRows = data.ingredients.map((ing) => ({
        recipe_id: id,
        food_id: ing.food_id,
        quantity: ing.quantity,
        unit: ing.unit || null,
        order_index: ing.order_index,
      }))

      await supabase.from('recipe_ingredients').insert(ingredientRows)
    }

    const { error: updateError } = await supabase
      .from('recipes')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Fetch updated recipe
    const { data: recipe } = await supabase
      .from('recipes')
      .select('*, ingredients:recipe_ingredients(*, food:foods(*))')
      .eq('id', id)
      .single()

    return NextResponse.json({ recipe })
  } catch (error) {
    console.error('Recipe PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existing } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Recipe DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
