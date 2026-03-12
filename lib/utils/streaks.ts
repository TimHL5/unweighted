import { SupabaseClient } from '@supabase/supabase-js'
import { parseISO, differenceInCalendarDays } from 'date-fns'
import { broadcastSystemMessage } from '@/lib/utils/group-messages'

export type StreakType = 'food_log' | 'workout' | 'weigh_in' | 'water' | 'check_in'

export async function updateStreak(
  supabase: SupabaseClient,
  userId: string,
  streakType: StreakType,
  activityDate: string // YYYY-MM-DD
) {
  const { data: streak, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('streak_type', streakType)
    .single()

  if (error || !streak) {
    // Create streak if it doesn't exist
    await supabase.from('user_streaks').upsert({
      user_id: userId,
      streak_type: streakType,
      current_count: 1,
      longest_count: 1,
      last_activity_date: activityDate,
    }, { onConflict: 'user_id,streak_type' })
    return
  }

  const lastDate = streak.last_activity_date
  if (!lastDate) {
    // First activity ever
    await supabase
      .from('user_streaks')
      .update({
        current_count: 1,
        longest_count: Math.max(1, streak.longest_count),
        last_activity_date: activityDate,
      })
      .eq('id', streak.id)
    return
  }

  // Same day — no change
  if (lastDate === activityDate) return

  const daysDiff = differenceInCalendarDays(
    parseISO(activityDate),
    parseISO(lastDate)
  )

  if (daysDiff === 1) {
    // Consecutive day — increment
    const newCount = streak.current_count + 1
    await supabase
      .from('user_streaks')
      .update({
        current_count: newCount,
        longest_count: Math.max(newCount, streak.longest_count),
        last_activity_date: activityDate,
      })
      .eq('id', streak.id)

    // Celebrate streak milestones
    if ([7, 14, 30, 60, 100, 365].includes(newCount)) {
      broadcastSystemMessage(
        supabase, userId,
        `reached a ${newCount}-day ${streakType} streak!`,
        'celebration'
      ).catch(() => {})
    }
  } else if (daysDiff > 1) {
    // Gap — reset streak
    await supabase
      .from('user_streaks')
      .update({
        current_count: 1,
        last_activity_date: activityDate,
      })
      .eq('id', streak.id)
  }
  // daysDiff < 0 means logging for a past date — ignore
}
