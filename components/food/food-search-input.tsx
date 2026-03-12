'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Mic, ScanBarcode } from 'lucide-react'
import { useFoodSearch } from '@/lib/hooks/use-food-search'
import { useRecentFoods } from '@/lib/hooks/use-food-log'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import type { Food, FoodLog } from '@/lib/types'

interface FoodSearchInputProps {
  onSelect: (food: Food) => void
  autoFocus?: boolean
  onBarcodeClick?: () => void
}

export function FoodSearchInput({ onSelect, autoFocus, onBarcodeClick }: FoodSearchInputProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: searchData, isLoading: searching } = useFoodSearch(debouncedQuery, debouncedQuery.length >= 1)
  const { data: recentData } = useRecentFoods()

  const showRecent = !query && recentData?.foods?.length > 0
  const showResults = query.length >= 1

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div
        className={`relative flex items-center rounded-2xl border-2 bg-card transition-all duration-200 ${
          isFocused
            ? 'border-coral/50 shadow-[0_0_0_3px_rgba(255,77,106,0.1)]'
            : 'border-border hover:border-border/80'
        }`}
      >
        <Search className="ml-4 h-5 w-5 flex-shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search foods, brands, restaurants..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={autoFocus}
          className="h-14 w-full bg-transparent px-3 font-body text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <div className="flex items-center gap-1 pr-3">
          <AnimatePresence mode="wait">
            {query ? (
              <motion.button
                key="clear"
                type="button"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </motion.button>
            ) : (
              <motion.div
                key="actions"
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  title="Voice search (coming soon)"
                >
                  <Mic className="h-4 w-4" />
                </button>
                {onBarcodeClick && (
                  <button
                    type="button"
                    onClick={onBarcodeClick}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                    title="Scan barcode"
                  >
                    <ScanBarcode className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recent Foods */}
      {showRecent && (
        <div className="space-y-2">
          <p className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Foods
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {(recentData.foods as FoodLog[]).slice(0, 10).map((log) => {
              if (!log.food) return null
              return (
                <button
                  key={log.food.id}
                  type="button"
                  onClick={() => onSelect(log.food!)}
                  className="flex-shrink-0 rounded-xl border bg-card px-3 py-2 text-left transition-all hover:border-coral/30 hover:shadow-sm active:scale-95"
                >
                  <p className="font-body text-sm font-medium truncate max-w-[140px]">
                    {log.food.name}
                  </p>
                  <p className="font-mono text-xs tabular-nums text-coral">
                    {log.food.calories_per_serving} cal
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {showResults && searching && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border bg-card p-3">
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-32 rounded-md bg-muted shimmer" />
                <div className="h-3 w-20 rounded-md bg-muted shimmer" />
              </div>
              <div className="space-y-1 text-right">
                <div className="h-5 w-14 rounded-md bg-muted shimmer" />
                <div className="h-3 w-10 rounded-md bg-muted shimmer ml-auto" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Results */}
      {showResults && !searching && searchData?.foods && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-1"
        >
          {searchData.foods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="mt-4 font-display text-base font-semibold text-muted-foreground">
                No foods found
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Try a different search or create a custom food
              </p>
            </div>
          ) : (
            searchData.foods.map((food) => (
              <motion.div key={food.id} variants={fadeInUp}>
                <FoodResultItem food={food} onSelect={onSelect} />
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  )
}

function FoodResultItem({
  food,
  onSelect,
}: {
  food: Food
  onSelect: (food: Food) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(food)}
      className="flex w-full items-center justify-between rounded-xl border border-transparent bg-card px-4 py-3 text-left transition-all hover:border-coral/20 hover:shadow-sm active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-sm font-semibold text-foreground">
          {food.name}
        </p>
        {food.brand && (
          <p className="truncate font-body text-xs text-muted-foreground">
            {food.brand}
          </p>
        )}
        <p className="mt-0.5 font-body text-xs text-muted-foreground">
          {food.serving_size_g ? `${food.serving_size_g}${food.serving_unit || 'g'}` : 'per serving'}
        </p>
      </div>
      <div className="ml-4 flex-shrink-0 text-right">
        <p className="font-mono text-lg font-bold tabular-nums text-coral">
          {food.calories_per_serving}
        </p>
        <p className="font-body text-[10px] uppercase tracking-wide text-muted-foreground">
          cal
        </p>
        {/* Macro dots */}
        <div className="mt-1 flex items-center justify-end gap-1">
          {food.protein_g != null && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: 'var(--color-protein)' }}
              title={`${food.protein_g}g protein`}
            />
          )}
          {food.carbs_g != null && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: 'var(--color-carbs)' }}
              title={`${food.carbs_g}g carbs`}
            />
          )}
          {food.fat_g != null && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: 'var(--color-fat)' }}
              title={`${food.fat_g}g fat`}
            />
          )}
        </div>
      </div>
    </button>
  )
}
