import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await params

    if (!code || !/^\d{8,14}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid barcode format' }, { status: 400 })
    }

    // Check local DB first
    const { data: localFood } = await supabase
      .from('foods')
      .select('*')
      .eq('barcode', code)
      .single()

    if (localFood) {
      return NextResponse.json({ food: localFood })
    }

    // Fallback: Open Food Facts API
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${code}`,
        { signal: AbortSignal.timeout(5000) }
      )

      if (!res.ok) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      const data = await res.json()
      if (data.status !== 1 || !data.product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      const p = data.product
      const nutriments = p.nutriments || {}

      // Prefer per-serving, fall back to per-100g
      const hasServing = nutriments['energy-kcal_serving'] != null
      const suffix = hasServing ? '_serving' : '_100g'
      const servingSize = hasServing
        ? parseFloat(p.serving_quantity) || 100
        : 100

      const food = {
        name: p.product_name || p.generic_name || 'Unknown Product',
        brand: p.brands || null,
        barcode: code,
        source: 'openfoodfacts' as const,
        source_id: code,
        serving_size_g: servingSize,
        serving_unit: hasServing ? (p.serving_size || `${servingSize}g`) : '100g',
        calories_per_serving: Math.round(nutriments[`energy-kcal${suffix}`] || 0),
        protein_g: Math.round((nutriments[`proteins${suffix}`] || 0) * 10) / 10,
        carbs_g: Math.round((nutriments[`carbohydrates${suffix}`] || 0) * 10) / 10,
        fat_g: Math.round((nutriments[`fat${suffix}`] || 0) * 10) / 10,
        fiber_g: Math.round((nutriments[`fiber${suffix}`] || 0) * 10) / 10,
        sugar_g: Math.round((nutriments[`sugars${suffix}`] || 0) * 10) / 10,
        sodium_mg: Math.round((nutriments[`sodium${suffix}`] || 0) * 1000),
        image_url: p.image_url || null,
        is_verified: false,
        created_by: null,
      }

      // Cache to local DB
      const { data: insertedFood, error: insertError } = await supabase
        .from('foods')
        .insert(food)
        .select()
        .single()

      if (insertError) {
        console.error('Failed to cache OFF food:', insertError)
        // Return the data even if caching fails
        return NextResponse.json({ food: { ...food, id: `off-${code}` } })
      }

      return NextResponse.json({ food: insertedFood })
    } catch {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
