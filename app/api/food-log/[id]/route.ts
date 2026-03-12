import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { foodLogUpdateSchema } from '@/lib/validations/food'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const { data: existing } = await supabase
      .from('food_logs')
      .select('*, food:foods(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = foodLogUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {}

    if (parsed.data.meal_type) updates.meal_type = parsed.data.meal_type
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes

    // Recalculate macros if servings changed
    if (parsed.data.servings && parsed.data.servings !== existing.servings) {
      updates.servings = parsed.data.servings

      if (existing.food) {
        const food = existing.food
        updates.calories = Math.round(food.calories_per_serving * parsed.data.servings)
        updates.protein_g = food.protein_g
          ? Math.round(food.protein_g * parsed.data.servings * 10) / 10
          : null
        updates.carbs_g = food.carbs_g
          ? Math.round(food.carbs_g * parsed.data.servings * 10) / 10
          : null
        updates.fat_g = food.fat_g
          ? Math.round(food.fat_g * parsed.data.servings * 10) / 10
          : null
        updates.fiber_g = food.fiber_g
          ? Math.round(food.fiber_g * parsed.data.servings * 10) / 10
          : null
      } else if (existing.calories) {
        // Scale calories proportionally for quick adds
        const ratio = parsed.data.servings / existing.servings
        updates.calories = Math.round(existing.calories * ratio)
      }
    }

    const { data: log, error } = await supabase
      .from('food_logs')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, food:foods(*)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ log })
  } catch (error) {
    console.error('Food log PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Food log DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
