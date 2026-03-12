'use client'

import { getXPForLevel } from '@/lib/utils/xp'
import { motion } from 'framer-motion'

interface LevelProgressProps {
  totalXP: number
  currentLevel: number
  size?: 'sm' | 'md'
}

export function LevelProgress({ totalXP, currentLevel, size = 'md' }: LevelProgressProps) {
  const currentLevelXP = getXPForLevel(currentLevel)
  const nextLevelXP = getXPForLevel(currentLevel + 1)
  const progressXP = totalXP - currentLevelXP
  const neededXP = nextLevelXP - currentLevelXP
  const percent = neededXP > 0 ? Math.min((progressXP / neededXP) * 100, 100) : 0
  const remaining = nextLevelXP - totalXP

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-purple/15">
          <span className="font-mono text-[10px] font-bold text-purple">{currentLevel}</span>
        </div>
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple to-coral"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple to-purple/60 shadow-sm shadow-purple/20">
            <span className="font-mono text-xs font-bold text-white">{currentLevel}</span>
          </div>
          <span className="font-display text-sm font-semibold">Level {currentLevel}</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {remaining > 0 ? `${remaining} XP to next` : 'Max Level'}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple to-coral"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        {totalXP.toLocaleString()} XP total
      </p>
    </div>
  )
}
