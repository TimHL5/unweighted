import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { USDAFoodSearchResult, Food } from '@/lib/types'

// USDA nutrient IDs
const NUTRIENT_IDS = {
  CALORIES: 1008,
  PROTEIN: 1003,
  CARBS: 1005,
  FAT: 1004,
  FIBER: 1079,
  SUGAR: 2000,
  SODIUM: 1093,
} as const

function getUSDANutrient(nutrients: USDAFoodSearchResult['foodNutrients'], id: number): number | null {
  const n = nutrients.find((n) => n.nutrientId === id)
  return n ? Math.round(n.value * 10) / 10 : null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q')?.trim()
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    if (!q || q.length < 1) {
      return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 })
    }

    // Search local foods table
    const { data: localFoods, error: localError } = await supabase
      .from('foods')
      .select('*')
      .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
      .order('is_verified', { ascending: false })
      .limit(limit)

    if (localError) {
      return NextResponse.json({ error: localError.message }, { status: 500 })
    }

    const results: Food[] = localFoods || []

    // If local results are insufficient and USDA API key exists, fetch from USDA
    if (results.length < 5 && process.env.USDA_API_KEY) {
      try {
        const usdaUrl = new URL('https://api.nal.usda.gov/fdc/v1/foods/search')
        usdaUrl.searchParams.set('api_key', process.env.USDA_API_KEY)
        usdaUrl.searchParams.set('query', q)
        usdaUrl.searchParams.set('pageSize', String(limit))
        usdaUrl.searchParams.set('dataType', 'Foundation,SR Legacy,Branded')

        const res = await fetch(usdaUrl.toString(), { signal: AbortSignal.timeout(5000) })

        if (res.ok) {
          const data = await res.json()
          const usdaResults: USDAFoodSearchResult[] = data.foods || []

          // Track local food names for dedup
          const existingNames = new Set(results.map((f) => f.name.toLowerCase()))

          for (const item of usdaResults) {
            const name = item.description
            if (existingNames.has(name.toLowerCase())) continue

            const calories = getUSDANutrient(item.foodNutrients, NUTRIENT_IDS.CALORIES)
            if (!calories || calories <= 0) continue

            results.push({
              id: `usda-${item.fdcId}`,
              name,
              brand: item.brandName || null,
              barcode: null,
              source: 'usda',
              source_id: String(item.fdcId),
              serving_size_g: item.servingSize || 100,
              serving_unit: item.servingSizeUnit || 'g',
              calories_per_serving: calories,
              protein_g: getUSDANutrient(item.foodNutrients, NUTRIENT_IDS.PROTEIN),
              carbs_g: getUSDANutrient(item.foodNutrients, NUTRIENT_IDS.CARBS),
              fat_g: getUSDANutrient(item.foodNutrients, NUTRIENT_IDS.FAT),
              fiber_g: getUSDANutrient(item.foodNutrients, NUTRIENT_IDS.FIBER),
              sugar_g: getUSDANutrient(item.foodNutrients, NUTRIENT_IDS.SUGAR),
              sodium_mg: getUSDANutrient(item.foodNutrients, NUTRIENT_IDS.SODIUM),
              image_url: null,
              is_verified: false,
              created_by: null,
              created_at: new Date().toISOString(),
            })

            existingNames.add(name.toLowerCase())
          }
        }
      } catch {
        // USDA API failure is non-fatal — return local results only
      }
    }

    return NextResponse.json({ foods: results.slice(0, limit) })
  } catch (error) {
    console.error('Food search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
