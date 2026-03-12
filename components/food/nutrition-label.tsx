'use client'

import type { Food } from '@/lib/types'

interface NutritionLabelProps {
  food: Partial<Food>
  servings?: number
}

function val(n: number | null | undefined, servings: number): string {
  if (n == null) return '\u2014'
  return Math.round(n * servings).toString()
}

export function NutritionLabel({ food, servings = 1 }: NutritionLabelProps) {
  const cals = food.calories_per_serving
    ? Math.round(food.calories_per_serving * servings)
    : null

  return (
    <div className="rounded-xl border-2 border-foreground/90 bg-card p-4 dark:border-foreground/70">
      {/* Title */}
      <h3 className="font-display text-2xl font-black leading-tight tracking-tight">
        Nutrition Facts
      </h3>
      <div className="mt-0.5 border-b border-foreground/20 pb-1">
        <p className="font-body text-xs text-muted-foreground">
          {servings === 1
            ? `Per serving (${food.serving_size_g || '\u2014'}${food.serving_unit || 'g'})`
            : `${servings} servings (${food.serving_size_g ? Math.round(food.serving_size_g * servings) : '\u2014'}${food.serving_unit || 'g'})`}
        </p>
      </div>

      {/* Thick divider */}
      <div className="my-1 h-2 bg-foreground/90 dark:bg-foreground/70" />

      {/* Calories */}
      <div className="flex items-baseline justify-between">
        <span className="font-display text-sm font-bold">Calories</span>
        <span className="font-mono text-3xl font-black tabular-nums">
          {cals != null ? cals.toLocaleString() : '\u2014'}
        </span>
      </div>

      {/* Thin divider */}
      <div className="my-1.5 h-px bg-foreground/20" />

      {/* % Daily Value header */}
      <div className="mb-1 text-right">
        <span className="font-body text-[10px] font-semibold text-muted-foreground">
          % Daily Value*
        </span>
      </div>

      {/* Macro rows */}
      <div className="space-y-0">
        <NutrientRow
          label="Total Fat"
          value={food.fat_g}
          unit="g"
          servings={servings}
          dailyValue={78}
          bold
          borderTop
        />
        <NutrientRow
          label="Total Carbs"
          value={food.carbs_g}
          unit="g"
          servings={servings}
          dailyValue={275}
          bold
          borderTop
        />
        <NutrientRow
          label="Dietary Fiber"
          value={food.fiber_g}
          unit="g"
          servings={servings}
          dailyValue={28}
          indent
          borderTop
        />
        <NutrientRow
          label="Sugars"
          value={food.sugar_g}
          unit="g"
          servings={servings}
          indent
          borderTop
        />
        <NutrientRow
          label="Protein"
          value={food.protein_g}
          unit="g"
          servings={servings}
          dailyValue={50}
          bold
          borderTop
        />

        {/* Thick divider */}
        <div className="my-1 h-1.5 bg-foreground/90 dark:bg-foreground/70" />

        <NutrientRow
          label="Sodium"
          value={food.sodium_mg}
          unit="mg"
          servings={servings}
          dailyValue={2300}
        />
      </div>

      {/* Footer */}
      <div className="mt-2 border-t border-foreground/20 pt-1.5">
        <p className="font-body text-[9px] leading-tight text-muted-foreground">
          * Percent Daily Values are based on a 2,000 calorie diet.
        </p>
      </div>
    </div>
  )
}

function NutrientRow({
  label,
  value,
  unit,
  servings,
  bold,
  indent,
  dailyValue,
  borderTop,
}: {
  label: string
  value: number | null | undefined
  unit: string
  servings: number
  bold?: boolean
  indent?: boolean
  dailyValue?: number
  borderTop?: boolean
}) {
  const computed = value != null ? Math.round(value * servings) : null
  const pct = dailyValue && computed != null ? Math.round((computed / dailyValue) * 100) : null

  return (
    <div
      className={`flex items-baseline justify-between py-0.5 ${indent ? 'pl-5' : ''} ${
        borderTop ? 'border-t border-foreground/10' : ''
      }`}
    >
      <span className={`font-body text-sm ${bold ? 'font-bold' : ''}`}>
        {label}{' '}
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {val(value, servings)}{unit}
        </span>
      </span>
      {pct != null && (
        <span className="font-mono text-sm font-bold tabular-nums">
          {pct}%
        </span>
      )}
    </div>
  )
}
