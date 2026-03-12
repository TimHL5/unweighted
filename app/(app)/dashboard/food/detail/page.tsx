'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Minus, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { NutritionLabel } from '@/components/food/nutrition-label'
import { MealSelector } from '@/components/food/meal-selector'
import { DateNavigator } from '@/components/shared/date-navigator'
import { useFoodLogStore } from '@/lib/stores/food-log-store'
import { useLogFood } from '@/lib/hooks/use-food-log'
import { useCreateCustomFood } from '@/lib/hooks/use-food-search'
import { createClient } from '@/lib/supabase/client'
import type { Food, MealType } from '@/lib/types'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/motion'

function FoodDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const foodId = searchParams.get('id')
  const mealParam = (searchParams.get('meal') || 'breakfast') as MealType
  const dateParam = searchParams.get('date') || useFoodLogStore.getState().selectedDate

  const { pendingFood, setPendingFood } = useFoodLogStore()
  const logFoodMutation = useLogFood(dateParam)
  const createCustomMutation = useCreateCustomFood()

  const [food, setFood] = useState<Partial<Food> | null>(null)
  const [loading, setLoading] = useState(true)
  const [servings, setServings] = useState(1)
  const [mealType, setMealType] = useState<MealType>(mealParam)
  const [date, setDate] = useState(dateParam)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (foodId) {
      const supabase = createClient()
      supabase
        .from('foods')
        .select('*')
        .eq('id', foodId)
        .single()
        .then(({ data }) => {
          if (data) setFood(data)
          setLoading(false)
        })
    } else if (pendingFood) {
      setFood(pendingFood)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [foodId, pendingFood])

  const computedCalories = food?.calories_per_serving
    ? Math.round(food.calories_per_serving * servings)
    : 0

  const handleLog = async () => {
    if (!food) return

    try {
      let resolvedFoodId = foodId

      // If USDA food (not in DB), create it first
      if (!resolvedFoodId && food.source === 'usda') {
        const result = await createCustomMutation.mutateAsync({
          name: food.name || 'Unknown Food',
          brand: food.brand || null,
          calories_per_serving: food.calories_per_serving || 0,
          protein_g: food.protein_g || null,
          carbs_g: food.carbs_g || null,
          fat_g: food.fat_g || null,
          fiber_g: food.fiber_g || null,
          sugar_g: food.sugar_g || null,
          sodium_mg: food.sodium_mg || null,
          serving_size_g: food.serving_size_g || null,
          serving_unit: food.serving_unit || null,
        })
        resolvedFoodId = result.food.id
      }

      await logFoodMutation.mutateAsync({
        food_id: resolvedFoodId || null,
        meal_type: mealType,
        log_date: date,
        servings,
        notes: notes || null,
      })

      setPendingFood(null)
      toast.success(`Logged ${computedCalories} cal to ${mealType}`)
      router.push('/dashboard/food')
    } catch {
      toast.error('Failed to log food')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    )
  }

  if (!food) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="font-display text-muted-foreground">Food not found</p>
        <Button variant="ghost" className="mt-4 text-coral" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5 pb-32"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => { setPendingFood(null); router.back() }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-bold">{food.name}</h1>
          {food.brand && <p className="text-sm text-muted-foreground">{food.brand}</p>}
        </div>
      </motion.div>

      {/* Nutrition Label */}
      <motion.div variants={fadeInUp}>
        <NutritionLabel food={food} servings={servings} />
      </motion.div>

      {/* Serving Selector */}
      <motion.div variants={fadeInUp} className="space-y-2">
        <Label className="font-display text-sm font-semibold">Servings</Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl"
            onClick={() => setServings(Math.max(0.5, servings - 0.5))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={servings}
            onChange={(e) => setServings(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="h-11 w-24 rounded-xl text-center font-mono text-lg font-semibold"
            step={0.5}
            min={0.1}
            inputMode="decimal"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl"
            onClick={() => setServings(servings + 0.5)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          {/* Presets */}
          <div className="flex gap-1.5">
            {[0.5, 1, 1.5, 2].map((s) => (
              <Button
                key={s}
                variant={servings === s ? 'default' : 'outline'}
                size="sm"
                className={`h-9 w-11 rounded-lg font-mono text-xs ${
                  servings === s ? 'bg-coral text-white shadow-sm shadow-coral/20 hover:bg-coral/90' : ''
                }`}
                onClick={() => setServings(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Meal Selector */}
      <motion.div variants={fadeInUp} className="space-y-2">
        <Label className="font-display text-sm font-semibold">Meal</Label>
        <MealSelector value={mealType} onChange={setMealType} />
      </motion.div>

      {/* Date */}
      <motion.div variants={fadeInUp} className="space-y-2">
        <Label className="font-display text-sm font-semibold">Date</Label>
        <DateNavigator date={date} onDateChange={setDate} />
      </motion.div>

      {/* Notes */}
      <motion.div variants={fadeInUp} className="space-y-2">
        <Label className="font-display text-sm font-semibold">Notes</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note..."
          className="h-11 rounded-xl"
        />
      </motion.div>

      {/* Sticky Log Button */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t bg-card/95 p-4 backdrop-blur-sm lg:bottom-0 lg:left-64">
        <div className="mx-auto max-w-5xl">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-muted-foreground">Total</span>
            <div className="flex gap-3 font-mono">
              <span className="font-semibold text-coral">{computedCalories} cal</span>
              {food.protein_g != null && (
                <span className="text-teal">P {Math.round(food.protein_g * servings)}g</span>
              )}
              {food.carbs_g != null && (
                <span className="text-blue-500">C {Math.round(food.carbs_g * servings)}g</span>
              )}
              {food.fat_g != null && (
                <span className="text-amber">F {Math.round(food.fat_g * servings)}g</span>
              )}
            </div>
          </div>
          <Button
            className="w-full gap-2 bg-coral font-display font-semibold text-white shadow-lg shadow-coral/20 hover:bg-coral/90"
            onClick={handleLog}
            disabled={logFoodMutation.isPending || createCustomMutation.isPending}
          >
            {(logFoodMutation.isPending || createCustomMutation.isPending) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Log {computedCalories.toLocaleString()} cal to {mealType}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default function FoodDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <FoodDetailContent />
    </Suspense>
  )
}
