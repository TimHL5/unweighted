'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { FoodSearchInput } from '@/components/food/food-search-input'
import { useCreateRecipe, useRecipe, useUpdateRecipe } from '@/lib/hooks/use-recipes'
import type { Food } from '@/lib/types'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/motion'

interface IngredientItem {
  food: Food
  quantity: number
  unit: string
  order_index: number
}

function RecipeFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const { data: editData } = useRecipe(editId || '')
  const createMutation = useCreateRecipe()
  const updateMutation = useUpdateRecipe(editId || '')

  const isEdit = !!editId

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [servings, setServings] = useState('1')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [instructions, setInstructions] = useState('')
  const [ingredients, setIngredients] = useState<IngredientItem[]>([])

  const [addOpen, setAddOpen] = useState(false)
  const [pendingFood, setPendingFood] = useState<Food | null>(null)
  const [pendingQty, setPendingQty] = useState('100')
  const [pendingUnit, setPendingUnit] = useState('g')

  const [populated, setPopulated] = useState(false)
  if (isEdit && editData?.recipe && !populated) {
    const r = editData.recipe
    setName(r.name)
    setDescription(r.description || '')
    setServings(String(r.servings))
    setPrepTime(r.prep_time_min ? String(r.prep_time_min) : '')
    setCookTime(r.cook_time_min ? String(r.cook_time_min) : '')
    setInstructions(r.instructions || '')
    if (r.ingredients) {
      setIngredients(
        r.ingredients.map((ing) => ({
          food: ing.food!,
          quantity: ing.quantity,
          unit: ing.unit || 'g',
          order_index: ing.order_index,
        }))
      )
    }
    setPopulated(true)
  }

  const nutrition = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0
    for (const ing of ingredients) {
      const ratio = ing.quantity / (ing.food.serving_size_g || ing.quantity)
      calories += ing.food.calories_per_serving * ratio
      protein += (ing.food.protein_g || 0) * ratio
      carbs += (ing.food.carbs_g || 0) * ratio
      fat += (ing.food.fat_g || 0) * ratio
    }
    const s = parseInt(servings) || 1
    return {
      total: { calories: Math.round(calories), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) },
      perServing: {
        calories: Math.round(calories / s),
        protein: Math.round(protein / s),
        carbs: Math.round(carbs / s),
        fat: Math.round(fat / s),
      },
    }
  }, [ingredients, servings])

  const handleSelectFood = (food: Food) => {
    setPendingFood(food)
    setPendingQty(String(food.serving_size_g || 100))
    setPendingUnit(food.serving_unit || 'g')
  }

  const handleAddIngredient = () => {
    if (!pendingFood) return
    const qty = parseFloat(pendingQty)
    if (!qty || qty <= 0) {
      toast.error('Enter a valid quantity')
      return
    }
    setIngredients((prev) => [
      ...prev,
      {
        food: pendingFood,
        quantity: qty,
        unit: pendingUnit,
        order_index: prev.length,
      },
    ])
    setPendingFood(null)
    setPendingQty('100')
    setAddOpen(false)
  }

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index).map((ing, i) => ({ ...ing, order_index: i })))
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Recipe name is required')
      return
    }
    if (ingredients.length === 0) {
      toast.error('Add at least one ingredient')
      return
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      servings: parseInt(servings) || 1,
      prep_time_min: prepTime ? parseInt(prepTime) : null,
      cook_time_min: cookTime ? parseInt(cookTime) : null,
      instructions: instructions.trim() || null,
      is_public: false,
      ingredients: ingredients.map((ing) => ({
        food_id: ing.food.id,
        quantity: ing.quantity,
        unit: ing.unit || null,
        order_index: ing.order_index,
      })),
    }

    try {
      if (isEdit) {
        const result = await updateMutation.mutateAsync(payload)
        toast.success('Recipe updated')
        router.push(`/dashboard/recipes/${result.recipe.id}`)
      } else {
        const result = await createMutation.mutateAsync(payload)
        toast.success('Recipe created')
        router.push(`/dashboard/recipes/${result.recipe.id}`)
      }
    } catch {
      toast.error('Failed to save recipe')
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-32"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-display text-xl font-bold">
          {isEdit ? 'Edit Recipe' : 'New Recipe'}
        </h1>
      </motion.div>

      {/* Basic Info */}
      <motion.div variants={fadeInUp} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium">Recipe Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Protein Oatmeal Bowl"
            className="h-11 rounded-xl font-display"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            rows={2}
            className="rounded-xl"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Servings</Label>
            <Input
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              min={1}
              inputMode="numeric"
              className="h-11 rounded-xl font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Prep (min)</Label>
            <Input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="0"
              inputMode="numeric"
              className="h-11 rounded-xl font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Cook (min)</Label>
            <Input
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="0"
              inputMode="numeric"
              className="h-11 rounded-xl font-mono"
            />
          </div>
        </div>
      </motion.div>

      {/* Ingredients */}
      <motion.div variants={fadeInUp} className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="font-display text-base font-semibold">Ingredients *</Label>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 rounded-lg"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        {ingredients.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed py-8 text-center">
            <p className="text-sm text-muted-foreground">No ingredients added yet</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-coral"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add ingredient
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {ingredients.map((ing, idx) => (
              <Card key={idx} className="card-elevated">
                <CardContent className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{ing.food.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {ing.quantity}{ing.unit} &middot;{' '}
                      {Math.round(
                        ing.food.calories_per_serving *
                          (ing.quantity / (ing.food.serving_size_g || ing.quantity))
                      )}{' '}
                      cal
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveIngredient(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
            <SheetHeader>
              <SheetTitle className="font-display">Add Ingredient</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4 overflow-y-auto">
              {pendingFood ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-muted p-3">
                    <div>
                      <p className="font-display font-medium">{pendingFood.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {pendingFood.calories_per_serving} cal per{' '}
                        {pendingFood.serving_size_g || '—'}
                        {pendingFood.serving_unit || 'g'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setPendingFood(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Quantity</Label>
                      <Input
                        type="number"
                        value={pendingQty}
                        onChange={(e) => setPendingQty(e.target.value)}
                        inputMode="decimal"
                        className="h-11 rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Unit</Label>
                      <Input
                        value={pendingUnit}
                        onChange={(e) => setPendingUnit(e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full gap-2 bg-coral font-display font-semibold text-white hover:bg-coral/90"
                    onClick={handleAddIngredient}
                  >
                    <Plus className="h-4 w-4" />
                    Add Ingredient
                  </Button>
                </div>
              ) : (
                <FoodSearchInput onSelect={handleSelectFood} autoFocus />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>

      {/* Instructions */}
      <motion.div variants={fadeInUp} className="space-y-2">
        <Label className="font-display text-base font-semibold">Instructions</Label>
        <Textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Step-by-step cooking instructions..."
          rows={5}
          className="rounded-xl"
        />
      </motion.div>

      {/* Sticky Nutrition Preview + Save */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t bg-card/95 p-4 backdrop-blur-sm lg:bottom-0 lg:left-64">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex justify-between text-xs">
            <span className="text-muted-foreground">Per serving</span>
            <div className="flex gap-3 font-mono">
              <span className="font-semibold text-coral">{nutrition.perServing.calories} cal</span>
              <span className="text-teal">P {nutrition.perServing.protein}g</span>
              <span className="text-blue-500">C {nutrition.perServing.carbs}g</span>
              <span className="text-amber">F {nutrition.perServing.fat}g</span>
            </div>
          </div>
          <Button
            className="w-full gap-2 bg-coral font-display font-semibold text-white shadow-lg shadow-coral/20 hover:bg-coral/90"
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {(createMutation.isPending || updateMutation.isPending) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {isEdit ? 'Update Recipe' : 'Save Recipe'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default function NewRecipePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <RecipeFormContent />
    </Suspense>
  )
}
