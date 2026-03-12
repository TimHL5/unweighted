'use client'

import { useGamificationStore } from '@/lib/stores/gamification-store'
import { AchievementUnlockOverlay } from './achievement-unlock-overlay'
import { showChallengeCompleteToast } from './xp-toast'
import { useEffect, useRef } from 'react'

export function GamificationListener() {
  const queue = useGamificationStore((s) => s.queue)
  const dequeue = useGamificationStore((s) => s.dequeue)
  const processedChallenges = useRef(new Set<string>())

  const current = queue[0]

  // Handle challenge_complete events as toasts
  useEffect(() => {
    if (!current) return
    if (current.type !== 'challenge_complete') return
    if (processedChallenges.current.has(current.id)) return

    processedChallenges.current.add(current.id)
    showChallengeCompleteToast(current.data.name, current.data.xp || 0)
    dequeue()
  }, [current, dequeue])

  // Achievement events render as overlay
  if (!current || current.type !== 'achievement') return null

  return (
    <AchievementUnlockOverlay
      name={current.data.name}
      icon={current.data.icon || '🏆'}
      xp={current.data.xp || 0}
      rarity={current.data.rarity || 'common'}
      onDismiss={dequeue}
    />
  )
}
