'use client'

import { motion } from 'framer-motion'

interface RatingSelectorProps {
  value: number | null
  onChange: (value: number | null) => void
  labels?: string[]
  icons?: string[]
  size?: 'sm' | 'md'
}

export function RatingSelector({
  value,
  onChange,
  labels,
  icons,
  size = 'md',
}: RatingSelectorProps) {
  const sizeClasses = size === 'sm' ? 'h-9 w-9 text-base' : 'h-11 w-11 text-lg'

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => {
        const isActive = value === n
        return (
          <motion.button
            key={n}
            type="button"
            onClick={() => onChange(isActive ? null : n)}
            whileTap={{ scale: 0.9 }}
            animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center justify-center rounded-xl font-medium transition-all ${sizeClasses} ${
              isActive
                ? 'bg-coral text-white shadow-md shadow-coral/25'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {icons ? icons[n - 1] : labels ? labels[n - 1] : n}
          </motion.button>
        )
      })}
    </div>
  )
}
