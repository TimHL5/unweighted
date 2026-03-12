'use client'

import { motion } from 'framer-motion'
import type { MealType } from '@/lib/types'

const meals: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '\u2615' },
  { value: 'lunch', label: 'Lunch', emoji: '\u2600\uFE0F' },
  { value: 'dinner', label: 'Dinner', emoji: '\uD83C\uDF19' },
  { value: 'snack', label: 'Snack', emoji: '\uD83C\uDF6A' },
]

interface MealSelectorProps {
  value: MealType
  onChange: (meal: MealType) => void
  size?: 'sm' | 'md'
}

export function MealSelector({ value, onChange, size = 'md' }: MealSelectorProps) {
  return (
    <div className="flex gap-2">
      {meals.map((meal) => {
        const isActive = value === meal.value
        return (
          <motion.button
            key={meal.value}
            type="button"
            onClick={() => onChange(meal.value)}
            className={`relative flex items-center gap-1.5 rounded-full font-body font-medium transition-colors ${
              size === 'sm'
                ? 'px-2.5 py-1 text-xs'
                : 'px-3.5 py-2 text-sm'
            } ${
              isActive
                ? 'bg-coral text-coral-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
            whileTap={{ scale: 0.95 }}
            layout
          >
            {isActive && (
              <motion.span
                layoutId="meal-selector-active"
                className="absolute inset-0 rounded-full bg-coral"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative z-10 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              {meal.emoji}
            </span>
            <span className={`relative z-10 ${isActive ? 'text-coral-foreground' : ''}`}>
              {meal.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
