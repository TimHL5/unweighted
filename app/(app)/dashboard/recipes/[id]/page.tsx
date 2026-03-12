'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CookingPot, MoreVertical, Pencil, Trash2, UtensilsCrossed } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MacroBar } from '@/components/shared/macro-bar'
import { MealSelector } from '@/components/food/meal-selector'
import { useRecipe, useLogRecipe, useDeleteRecipe } from '@/lib/hooks/use-recipes'
import type { MealType } from '@/lib/types'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/motion'

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data, isLoading } = useRecipe(id)
  const logMutation = useLogRecipe(id)
  const deleteMutation = useDeleteRecipe()

  const [logOpen, setLogOpen] = useState(false)
  const [logMeal, setLogMeal] = useState<MealType>('lunch')
  const [logServings, setLogServings] = useState('1')
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [logNotes, setLogNotes] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  const recipe = data?.recipe
  if (!recipe) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <CookingPot className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="mt-4 font-display font-semibold">Recipe not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    )
  }

  const perServing = {
    calories: Math.round((recipe.total_calories || 0) / (recipe.servings || 1)),
    protein: Math.round((recipe.total_protein_g || 0) / (recipe.servings || 1)),
    carbs: Math.round((recipe.total_carbs_g || 0) / (recipe.servings || 1)),
    fat: Math.round((recipe.total_fat_g || 0) / (recipe.servings || 1)),
  }

  const totalTime = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)

  const handleLog = async () => {
    try {
      await logMutation.mutateAsync({
        meal_type: logMeal,
        log_date: logDate,
        servings: parseFloat(logServings) || 1,
        notes: logNotes || null,
      })
      toast.success('Recipe logged to food diary')
      setLogOpen(false)
      router.push('/dashboard/food')
    } catch {
      toast.error('Failed to log recipe')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Recipe deleted')
      router.push('/dashboard/recipes')
    } catch {
      toast.error('Failed to delete recipe')
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="truncate font-display text-xl font-bold">{recipe.name}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/recipes/new?edit=${id}`)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Description */}
      {recipe.description && (
        <motion.p variants={fadeInUp} className="text-sm text-muted-foreground">
          {recipe.description}
        </motion.p>
      )}

      {/* Stats pills */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-coral/10 px-3 py-1.5 text-sm font-medium text-coral">
          <span className="font-mono">{perServing.calories}</span> cal/serving
        </div>
        {totalTime > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono">{totalTime}</span> min
          </div>
        )}
        <div className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
          <span className="font-mono">{recipe.servings}</span> {recipe.servings === 1 ? 'serving' : 'servings'}
        </div>
      </motion.div>

      {/* Per-serving macros */}
      <motion.div variants={fadeInUp}>
        <Card className="card-elevated">
          <CardContent className="space-y-3 py-4">
            <p className="font-display text-sm font-semibold">Per Serving Nutrition</p>
            <MacroBar label="Protein" current={perServing.protein} target={perServing.protein} color="#4ECDC4" />
            <MacroBar label="Carbs" current={perServing.carbs} target={perServing.carbs} color="#3B82F6" />
            <MacroBar label="Fat" current={perServing.fat} target={perServing.fat} color="#F59E0B" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Ingredients */}
      <motion.div variants={fadeInUp} className="space-y-3">
        <h2 className="font-display font-semibold">Ingredients</h2>
        <div className="space-y-1 overflow-hidden rounded-xl border">
          {(recipe.ingredients || [])
            .sort((a, b) => a.order_index - b.order_index)
            .map((ing, i) => (
              <div
                key={ing.id}
                className={`flex justify-between px-4 py-2.5 text-sm ${
                  i % 2 === 0 ? 'bg-muted/30' : ''
                }`}
              >
                <span className="font-medium">{ing.food?.name || 'Unknown food'}</span>
                <span className="font-mono text-muted-foreground">
                  {ing.quantity}{ing.unit || 'g'}
                </span>
              </div>
            ))}
        </div>
      </motion.div>

      {/* Instructions */}
      {recipe.instructions && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <h2 className="font-display font-semibold">Instructions</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {recipe.instructions}
          </p>
        </motion.div>
      )}

      {/* Log Button */}
      <motion.div variants={fadeInUp}>
        <Button
          className="w-full gap-2 bg-coral font-display font-semibold text-white shadow-lg shadow-coral/20 hover:bg-coral/90"
          onClick={() => setLogOpen(true)}
        >
          <UtensilsCrossed className="h-4 w-4" />
          Log This Recipe
        </Button>
      </motion.div>

      {/* Log Sheet */}
      <Sheet open={logOpen} onOpenChange={setLogOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display">Log {recipe.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Servings</Label>
              <Input
                type="number"
                value={logServings}
                onChange={(e) => setLogServings(e.target.value)}
                min={0.1}
                step={0.5}
                inputMode="decimal"
                className="h-11 rounded-xl font-mono text-lg font-semibold"
              />
              <p className="font-mono text-xs text-muted-foreground">
                {Math.round(perServing.calories * (parseFloat(logServings) || 1))} cal total
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Meal</Label>
              <MealSelector value={logMeal} onChange={setLogMeal} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Date</Label>
              <Input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Notes</Label>
              <Input
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Optional notes..."
                className="h-11 rounded-xl"
              />
            </div>
            <Button
              className="w-full gap-2 bg-coral font-display font-semibold text-white hover:bg-coral/90"
              onClick={handleLog}
              disabled={logMutation.isPending}
            >
              <UtensilsCrossed className="h-4 w-4" />
              Log Recipe
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Delete Recipe</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &ldquo;{recipe.name}&rdquo;? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

