import { SupabaseClient } from '@supabase/supabase-js'
import { checkAchievements, UnlockedAchievement } from '@/lib/utils/achievements'
import { updateChallengeProgress, CompletedChallenge } from '@/lib/utils/challenges'

export interface GamificationResult {
  achievements_unlocked: UnlockedAchievement[]
  challenges_completed: CompletedChallenge[]
}

export async function processGamification(
  supabase: SupabaseClient,
  userId: string,
  opts: {
    achievementCategories: string[]
    challengeMetric?: string
  }
): Promise<GamificationResult> {
  const results = await Promise.allSettled([
    checkAchievements(supabase, userId, opts.achievementCategories),
    opts.challengeMetric
      ? updateChallengeProgress(supabase, userId, opts.challengeMetric)
      : Promise.resolve([]),
  ])

  const achievements_unlocked =
    results[0].status === 'fulfilled' ? results[0].value : []
  const challenges_completed =
    results[1].status === 'fulfilled' ? results[1].value : []

  return { achievements_unlocked, challenges_completed }
}
