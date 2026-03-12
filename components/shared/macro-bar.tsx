'use client'

import { motion } from 'framer-motion'

interface MacroBarProps {
  label: string
  current: number
  target: number
  color: string
  unit?: string
}

export function MacroBar({ label, current, target, color, unit = 'g' }: MacroBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const pctDisplay = Math.round(pct)
  const showInside = pct > 30

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-body text-sm font-medium text-foreground">{label}</span>
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {Math.round(current)}<span className="text-muted-foreground/60">/</span>{Math.round(target)}{unit}
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/50">
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center justify-end rounded-full pr-2"
          style={{
            background: `linear-gradient(90deg, ${color}CC, ${color})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.1,
          }}
        >
          {showInside && (
            <motion.span
              className="font-mono text-[10px] font-semibold leading-none text-white mix-blend-difference"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              {pctDisplay}%
            </motion.span>
          )}
        </motion.div>
      </div>
    </div>
  )
}
