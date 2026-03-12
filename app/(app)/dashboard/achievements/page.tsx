'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Trophy, Lock, Sparkles } from 'lucide-react'
import { timeAgo } from '@/lib/utils/helpers'
import { staggerContainer, scaleIn, fadeIn } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { Achievement } from '@/lib/types'

interface AchievementWithStatus extends Achievement {
  unlocked: boolean
  unlocked_at: string | null
}

const rarityConfig: Record<
  string,
  { bg: string; text: string; border: string; glow: string; label: string }
> = {
  common: {
    bg: 'bg-zinc-100 dark:bg-zinc-800/50',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-200 dark:border-zinc-700',
    glow: '',
    label: 'Common',
  },
  uncommon: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    glow: 'shadow-[0_0_12px_rgba(34,197,94,0.15)]',
    label: 'Uncommon',
  },
  rare: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    glow: 'shadow-[0_0_16px_rgba(59,130,246,0.2)]',
    label: 'Rare',
  },
  epic: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.25)]',
    label: 'Epic',
  },
  legendary: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-700',
    glow: 'shadow-[0_0_24px_rgba(245,158,11,0.3)]',
    label: 'Legendary',
  },
}

const categoryLabels: Record<string, string> = {
  all: 'All',
  logging: 'Logging',
  workout: 'Workout',
  progress: 'Progress',
  social: 'Social',
  accountability: 'Accountability',
  gamification: 'Gamification',
}

const categoryList = ['all', 'logging', 'workout', 'progress', 'social', 'accountability', 'gamification']

function useAchievements() {
  return useQuery<{
    achievements: AchievementWithStatus[]
    unlocked_count: number
    total_count: number
  }>({
    queryKey: ['achievements'],
    queryFn: async () => {
      const res = await fetch('/api/achievements')
      if (!res.ok) throw new Error('Failed to fetch achievements')
      return res.json()
    },
  })
}

export default function AchievementsPage() {
  const { data, isLoading } = useAchievements()
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithStatus | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const achievements = data?.achievements || []
  const unlockedCount = data?.unlocked_count || 0
  const totalCount = data?.total_count || 0
  const progressPct = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0

  const filtered =
    activeCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === activeCategory)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Achievements</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            <span className="font-mono font-bold text-coral">{unlockedCount}</span>
            <span className="text-muted-foreground/60">/{totalCount}</span> unlocked
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
          <Trophy className="h-4 w-4 text-amber" />
          <span className="font-mono text-sm font-bold">{Math.round(progressPct)}%</span>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <Progress value={progressPct} className="h-2.5" />
      </div>

      {/* Category filter tabs */}
      <div className="scrollbar-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {categoryList.map((cat) => {
          const count =
            cat === 'all'
              ? achievements.length
              : achievements.filter((a) => a.category === cat).length
          if (count === 0 && cat !== 'all') return null
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
                activeCategory === cat
                  ? 'bg-coral text-white shadow-sm shadow-coral/20'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {categoryLabels[cat]}
            </button>
          )
        })}
      </div>

      {/* Achievement Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Trophy className="h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">No achievements in this category</p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((achievement) => {
              const config = rarityConfig[achievement.rarity] || rarityConfig.common
              const isUnlocked = achievement.unlocked

              return (
                <motion.button
                  key={achievement.id}
                  variants={scaleIn}
                  layout
                  type="button"
                  onClick={() => setSelectedAchievement(achievement)}
                  className={cn(
                    'group relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all',
                    isUnlocked
                      ? `${config.border} ${config.glow} hover:-translate-y-1 hover:shadow-md`
                      : 'border-border/50 opacity-60 grayscale hover:opacity-80'
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-2xl text-3xl',
                      isUnlocked ? config.bg : 'bg-muted'
                    )}
                  >
                    {isUnlocked ? (
                      achievement.icon || '🏆'
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Name */}
                  <p className="text-xs font-bold leading-tight">{achievement.name}</p>

                  {/* Description */}
                  <p className={cn(
                    'line-clamp-2 text-[10px] leading-tight text-muted-foreground',
                    !isUnlocked && 'blur-[2px]'
                  )}>
                    {achievement.description}
                  </p>

                  {/* Rarity badge */}
                  <Badge
                    variant="secondary"
                    className={cn(
                      'mt-auto px-2 py-0 text-[9px] font-semibold',
                      isUnlocked ? `${config.bg} ${config.text}` : ''
                    )}
                  >
                    {config.label}
                  </Badge>

                  {/* Earned date */}
                  {isUnlocked && achievement.unlocked_at && (
                    <p className="text-[9px] text-muted-foreground/60">
                      {timeAgo(achievement.unlocked_at)}
                    </p>
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Achievement Detail Dialog */}
      <Dialog
        open={!!selectedAchievement}
        onOpenChange={() => setSelectedAchievement(null)}
      >
        <DialogContent className="max-w-sm">
          {selectedAchievement && (() => {
            const config = rarityConfig[selectedAchievement.rarity] || rarityConfig.common
            const isUnlocked = selectedAchievement.unlocked

            return (
              <>
                <DialogHeader className="items-center text-center">
                  <div
                    className={cn(
                      'mx-auto flex h-20 w-20 items-center justify-center rounded-3xl text-5xl',
                      isUnlocked ? `${config.bg} ${config.glow}` : 'bg-muted'
                    )}
                  >
                    {isUnlocked ? (
                      selectedAchievement.icon || '🏆'
                    ) : (
                      <Lock className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <DialogTitle className="font-display text-xl">
                    {selectedAchievement.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {selectedAchievement.description}
                  </p>

                  <div className="flex items-center justify-center gap-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'px-2.5 py-0.5 text-xs font-semibold',
                        config.bg,
                        config.text
                      )}
                    >
                      {config.label}
                    </Badge>
                    <span className="flex items-center gap-1 font-mono text-sm font-bold text-purple">
                      <Sparkles className="h-3.5 w-3.5" />
                      +{selectedAchievement.xp_reward} XP
                    </span>
                  </div>

                  {isUnlocked && selectedAchievement.unlocked_at && (
                    <p className="text-xs text-muted-foreground">
                      Unlocked {timeAgo(selectedAchievement.unlocked_at)}
                    </p>
                  )}

                  {!isUnlocked && (
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Keep going to unlock this achievement!
                      </p>
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
