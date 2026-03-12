'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, CookingPot, Clock } from 'lucide-react'
import { UpgradeBanner } from '@/components/billing/upgrade-banner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecipes } from '@/lib/hooks/use-recipes'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/motion'

export default function RecipesPage() {
  const { data, isLoading } = useRecipes()
  const [search, setSearch] = useState('')

  const recipes = (data?.recipes || []).filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5 pb-20"
    >
      <UpgradeBanner message="Upgrade to Pro for unlimited recipe creation" />

      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Recipes</h1>
        <Link href="/dashboard/recipes/new">
          <Button className="gap-1.5 bg-coral font-display text-sm font-semibold text-white shadow-sm shadow-coral/20 hover:bg-coral/90">
            <Plus className="h-4 w-4" />
            New Recipe
          </Button>
        </Link>
      </motion.div>

      {/* Search */}
      {(data?.recipes?.length || 0) > 0 && (
        <motion.div variants={fadeInUp} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl pl-9"
          />
        </motion.div>
      )}

      {/* Recipe Grid */}
      {recipes.length === 0 ? (
        <motion.div
          variants={scaleIn}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <CookingPot className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-5 font-display text-lg font-bold">No recipes yet</h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Create your first recipe to track nutrition easily
          </p>
          <Link href="/dashboard/recipes/new">
            <Button className="mt-5 gap-1.5 bg-coral font-display font-semibold text-white hover:bg-coral/90">
              <Plus className="h-4 w-4" />
              Create Recipe
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe, i) => {
            const perServing = recipe.servings
              ? Math.round((recipe.total_calories || 0) / recipe.servings)
              : recipe.total_calories || 0
            const totalTime = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)

            return (
              <motion.div
                key={recipe.id}
                variants={fadeInUp}
                custom={i}
              >
                <Link href={`/dashboard/recipes/${recipe.id}`}>
                  <Card className="card-elevated transition-all hover:scale-[1.02]">
                    <CardContent className="py-4">
                      <h3 className="truncate font-display font-semibold">
                        {recipe.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        <span className="font-mono font-semibold text-coral">
                          {perServing} cal
                        </span>
                        <span className="text-muted-foreground">/serving</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        {totalTime > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {totalTime} min
                          </span>
                        )}
                        <span>
                          {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
                        </span>
                      </div>
                      {/* Mini macro dots */}
                      <div className="mt-3 flex gap-2">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-teal" />
                          P {Math.round((recipe.total_protein_g || 0) / (recipe.servings || 1))}g
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          C {Math.round((recipe.total_carbs_g || 0) / (recipe.servings || 1))}g
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-amber" />
                          F {Math.round((recipe.total_fat_g || 0) / (recipe.servings || 1))}g
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
