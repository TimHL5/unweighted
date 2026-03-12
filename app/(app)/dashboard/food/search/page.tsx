'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { FoodSearchInput } from '@/components/food/food-search-input'
import { MealSelector } from '@/components/food/meal-selector'
import { NutritionLabel } from '@/components/food/nutrition-label'
import { useFoodLogStore } from '@/lib/stores/food-log-store'
import { useLogFood, useQuickAdd } from '@/lib/hooks/use-food-log'
import { useCreateCustomFood } from '@/lib/hooks/use-food-search'
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/motion'
import type { Food, MealType } from '@/lib/types'
import { toast } from 'sonner'

function FoodSearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mealParam = (searchParams.get('meal') || 'breakfast') as MealType
  const dateParam = searchParams.get('date') || useFoodLogStore.getState().selectedDate
  const showQuickAdd = searchParams.get('quickadd') === '1'

  const { setPendingFood } = useFoodLogStore()
  const quickAddMutation = useQuickAdd(dateParam)
  const createFoodMutation = useCreateCustomFood()
  const logFoodMutation = useLogFood(dateParam)

  // Quick Add state
  const [quickAddOpen, setQuickAddOpen] = useState(showQuickAdd)
  const [quickCals, setQuickCals] = useState('')
  const [quickProtein, setQuickProtein] = useState('')
  const [quickCarbs, setQuickCarbs] = useState('')
  const [quickFat, setQuickFat] = useState('')
  const [quickMeal, setQuickMeal] = useState<MealType>(mealParam)
  const [quickNotes, setQuickNotes] = useState('')

  // Custom food state
  const [customOpen, setCustomOpen] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customBrand, setCustomBrand] = useState('')
  const [customCals, setCustomCals] = useState('')
  const [customProtein, setCustomProtein] = useState('')
  const [customCarbs, setCustomCarbs] = useState('')
  const [customFat, setCustomFat] = useState('')

  // Food detail/logging sheet state
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [logServings, setLogServings] = useState(1)
  const [logMealType, setLogMealType] = useState<MealType>(mealParam)

  const handleSelectFood = (food: Food) => {
    // If USDA result (not in DB), try inline logging sheet first
    if (food.id.startsWith('usda-')) {
      setPendingFood(food)
    }
    // Open the logging sheet inline
    setSelectedFood(food)
    setLogServings(1)
    setLogMealType(mealParam)
  }

  const handleLogFood = async () => {
    if (!selectedFood) return
    try {
      if (selectedFood.id.startsWith('usda-')) {
        // For USDA items, navigate to detail page
        router.push(`/dashboard/food/detail?meal=${logMealType}&date=${dateParam}`)
        return
      }
      await logFoodMutation.mutateAsync({
        food_id: selectedFood.id,
        meal_type: logMealType,
        log_date: dateParam,
        servings: logServings,
        calories: Math.round(selectedFood.calories_per_serving * logServings),
        protein_g: selectedFood.protein_g ? Math.round(selectedFood.protein_g * logServings * 10) / 10 : null,
        carbs_g: selectedFood.carbs_g ? Math.round(selectedFood.carbs_g * logServings * 10) / 10 : null,
        fat_g: selectedFood.fat_g ? Math.round(selectedFood.fat_g * logServings * 10) / 10 : null,
        fiber_g: selectedFood.fiber_g ? Math.round(selectedFood.fiber_g * logServings * 10) / 10 : null,
      })
      toast.success(`Logged ${selectedFood.name}`, {
        description: `${Math.round(selectedFood.calories_per_serving * logServings)} cal added to ${logMealType}`,
      })
      setSelectedFood(null)
      router.push('/dashboard/food')
    } catch {
      toast.error('Failed to log food')
    }
  }

  const handleQuickAdd = async () => {
    const cals = parseInt(quickCals)
    if (!cals || cals < 1) {
      toast.error('Enter a valid calorie amount')
      return
    }
    try {
      await quickAddMutation.mutateAsync({
        meal_type: quickMeal,
        log_date: dateParam,
        calories: cals,
        notes: quickNotes || null,
      })
      toast.success(`${cals} cal added to ${quickMeal}`)
      setQuickAddOpen(false)
      router.push('/dashboard/food')
    } catch {
      toast.error('Failed to add calories')
    }
  }

  const handleCreateCustom = async () => {
    if (!customName || !customCals) {
      toast.error('Name and calories are required')
      return
    }
    try {
      const result = await createFoodMutation.mutateAsync({
        name: customName,
        brand: customBrand || null,
        calories_per_serving: parseInt(customCals),
        protein_g: customProtein ? parseFloat(customProtein) : null,
        carbs_g: customCarbs ? parseFloat(customCarbs) : null,
        fat_g: customFat ? parseFloat(customFat) : null,
      })
      toast.success('Custom food created')
      setCustomOpen(false)
      router.push(`/dashboard/food/detail?id=${result.food.id}&meal=${mealParam}&date=${dateParam}`)
    } catch {
      toast.error('Failed to create food')
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 pb-20"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-display text-xl font-bold">Add Food</h1>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeInUp}>
        <FoodSearchInput
          onSelect={handleSelectFood}
          autoFocus
          onBarcodeClick={() => router.push(`/dashboard/food/barcode?date=${dateParam}`)}
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={fadeInUp} className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 rounded-xl border-amber/30 text-amber hover:bg-amber/5 hover:text-amber"
          onClick={() => setQuickAddOpen(true)}
        >
          <Zap className="h-3.5 w-3.5" /> Quick Add
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 rounded-xl border-teal/30 text-teal hover:bg-teal/5 hover:text-teal"
          onClick={() => setCustomOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" /> Custom Food
        </Button>
      </motion.div>

      {/* Quick Add Sheet */}
      <Sheet open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Quick Add Calories</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-body text-sm font-medium">Calories *</Label>
              <Input
                type="number"
                placeholder="e.g. 300"
                value={quickCals}
                onChange={(e) => setQuickCals(e.target.value)}
                inputMode="numeric"
                autoFocus
                className="h-12 rounded-xl text-center font-mono text-2xl tabular-nums"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm font-medium">Name (optional)</Label>
              <Input
                placeholder="e.g. office snack"
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label className="font-body text-xs">Protein (g)</Label>
                <Input
                  type="number"
                  value={quickProtein}
                  onChange={(e) => setQuickProtein(e.target.value)}
                  className="rounded-xl text-center font-mono text-sm"
                  placeholder="--"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs">Carbs (g)</Label>
                <Input
                  type="number"
                  value={quickCarbs}
                  onChange={(e) => setQuickCarbs(e.target.value)}
                  className="rounded-xl text-center font-mono text-sm"
                  placeholder="--"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs">Fat (g)</Label>
                <Input
                  type="number"
                  value={quickFat}
                  onChange={(e) => setQuickFat(e.target.value)}
                  className="rounded-xl text-center font-mono text-sm"
                  placeholder="--"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm font-medium">Meal</Label>
              <MealSelector value={quickMeal} onChange={setQuickMeal} />
            </div>

            <Button
              className="h-12 w-full rounded-xl bg-coral text-coral-foreground hover:bg-coral/90 font-display font-bold text-base"
              onClick={handleQuickAdd}
              disabled={quickAddMutation.isPending}
            >
              Add {quickCals ? `${quickCals} cal` : 'Calories'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Custom Food Sheet */}
      <Sheet open={customOpen} onOpenChange={setCustomOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Create Custom Food</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium">Name *</Label>
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Mom's lasagna"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium">Brand</Label>
              <Input
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                placeholder="Optional"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium">Calories per serving *</Label>
              <Input
                type="number"
                value={customCals}
                onChange={(e) => setCustomCals(e.target.value)}
                inputMode="numeric"
                className="rounded-xl font-mono"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label className="font-body text-xs">Protein (g)</Label>
                <Input
                  type="number"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="rounded-xl font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs">Carbs (g)</Label>
                <Input
                  type="number"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  className="rounded-xl font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs">Fat (g)</Label>
                <Input
                  type="number"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  className="rounded-xl font-mono text-sm"
                />
              </div>
            </div>
            <Button
              className="h-12 w-full rounded-xl bg-coral text-coral-foreground hover:bg-coral/90 font-display font-bold text-base"
              onClick={handleCreateCustom}
              disabled={createFoodMutation.isPending}
            >
              Create & Log
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Food Logging Sheet (inline) */}
      <Sheet open={!!selectedFood} onOpenChange={(open) => !open && setSelectedFood(null)}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-2xl">
          {selectedFood && (
            <>
              <SheetHeader className="pb-2">
                <SheetTitle className="font-display text-lg">
                  {selectedFood.name}
                </SheetTitle>
                {selectedFood.brand && (
                  <p className="font-body text-sm text-muted-foreground">{selectedFood.brand}</p>
                )}
              </SheetHeader>

              <div className="space-y-5 py-4">
                {/* Nutrition Label */}
                <motion.div variants={scaleIn} initial="hidden" animate="visible">
                  <NutritionLabel food={selectedFood} servings={logServings} />
                </motion.div>

                {/* Servings */}
                <div className="space-y-2">
                  <Label className="font-body text-sm font-medium">Serving size</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-xl text-lg"
                      onClick={() => setLogServings(Math.max(0.5, logServings - 0.5))}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={logServings}
                      onChange={(e) => setLogServings(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                      className="w-20 text-center rounded-xl font-mono text-lg tabular-nums"
                      step={0.5}
                      min={0.1}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-xl text-lg"
                      onClick={() => setLogServings(logServings + 0.5)}
                    >
                      +
                    </Button>
                    {selectedFood.serving_unit && (
                      <span className="font-body text-sm text-muted-foreground">
                        {selectedFood.serving_unit}
                        {selectedFood.serving_size_g && ` (${selectedFood.serving_size_g}g)`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meal Type Selector */}
                <div className="space-y-2">
                  <Label className="font-body text-sm font-medium">Meal</Label>
                  <MealSelector value={logMealType} onChange={setLogMealType} />
                </div>

                {/* Log Button (sticky) */}
                <div className="sticky bottom-0 pt-2 pb-safe bg-background">
                  <Button
                    className="h-13 w-full rounded-xl bg-coral text-coral-foreground hover:bg-coral/90 font-display font-bold text-base shadow-lg glow-coral"
                    onClick={handleLogFood}
                    disabled={logFoodMutation.isPending}
                  >
                    Log Food &middot;{' '}
                    <span className="font-mono tabular-nums">
                      {Math.round(selectedFood.calories_per_serving * logServings)} cal
                    </span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}

export default function FoodSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4">
          <div className="h-10 w-32 rounded-lg bg-muted shimmer" />
          <div className="h-14 w-full rounded-2xl bg-muted shimmer" />
          <div className="flex gap-2">
            <div className="h-9 flex-1 rounded-xl bg-muted shimmer" />
            <div className="h-9 flex-1 rounded-xl bg-muted shimmer" />
          </div>
        </div>
      }
    >
      <FoodSearchPageContent />
    </Suspense>
  )
}
