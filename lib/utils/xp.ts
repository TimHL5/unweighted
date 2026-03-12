import { SupabaseClient } from '@supabase/supabase-js'

// XP rewards
export const XP_FOOD_LOG = 10
export const XP_WATER_LOG = 5
export const XP_WEIGHT_LOG = 5
export const XP_CHECK_IN = 5
export const XP_POST_CREATE = 3
export const XP_POST_LIKED = 1
export const XP_GROUP_MESSAGE = 2

// Level curve: XP needed to reach a given level
// Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 250 XP, etc.
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(50 * (level - 1) * level)
}

export function getLevelForXP(totalXP: number): number {
  let level = 1
  while (getXPForLevel(level + 1) <= totalXP) {
    level++
  }
  return level
}

export async function addXP(
  supabase: SupabaseClient,
  userId: string,
  amount: number
): Promise<{ total_xp: number; current_level: number; leveled_up: boolean }> {
  const { data: xpRecord } = await supabase
    .from('user_xp')
    .select('*')
    .eq('user_id', userId)
    .single()

  const previousXP = xpRecord?.total_xp ?? 0
  const previousLevel = xpRecord?.current_level ?? 1
  const newTotalXP = previousXP + amount
  const newLevel = getLevelForXP(newTotalXP)

  await supabase.from('user_xp').upsert(
    {
      user_id: userId,
      total_xp: newTotalXP,
      current_level: newLevel,
    },
    { onConflict: 'user_id' }
  )

  return {
    total_xp: newTotalXP,
    current_level: newLevel,
    leveled_up: newLevel > previousLevel,
  }
}
