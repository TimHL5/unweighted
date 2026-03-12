import { SupabaseClient } from '@supabase/supabase-js'
import { addXP } from '@/lib/utils/xp'
import { broadcastSystemMessage } from '@/lib/utils/group-messages'

export interface UnlockedAchievement {
  slug: string
  name: string
  icon: string
  xp_reward: number
  rarity: string
}

interface AchievementRow {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  category: string
  requirement: Record<string, unknown>
  xp_reward: number
  rarity: string
}

async function checkCondition(
  supabase: SupabaseClient,
  userId: string,
  achievement: AchievementRow
): Promise<boolean> {
  switch (achievement.slug) {
    // Logging
    case 'first_log': {
      const { count } = await supabase
        .from('food_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      return (count ?? 0) >= 1
    }
    case 'streak_7d_food': {
      const { data } = await supabase
        .from('user_streaks')
        .select('current_count')
        .eq('user_id', userId)
        .eq('streak_type', 'food_logs')
        .single()
      return (data?.current_count ?? 0) >= 7
    }
    case 'streak_30d_food': {
      const { data } = await supabase
        .from('user_streaks')
        .select('current_count')
        .eq('user_id', userId)
        .eq('streak_type', 'food_logs')
        .single()
      return (data?.current_count ?? 0) >= 30
    }
    case 'foods_100': {
      const { count } = await supabase
        .from('food_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      return (count ?? 0) >= 100
    }
    case 'recipe_creator': {
      const { count } = await supabase
        .from('recipes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      return (count ?? 0) >= 1
    }
    case 'water_streak_7d': {
      const { data } = await supabase
        .from('user_streaks')
        .select('current_count')
        .eq('user_id', userId)
        .eq('streak_type', 'water')
        .single()
      return (data?.current_count ?? 0) >= 7
    }

    // V1 skips
    case 'early_bird':
    case 'macro_master':
    case 'gym_rat':
    case 'pr_breaker':
      return false

    // Workout
    case 'first_workout': {
      const { count } = await supabase
        .from('workout_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      return (count ?? 0) >= 1
    }
    case 'workouts_10': {
      const { count } = await supabase
        .from('workout_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      return (count ?? 0) >= 10
    }

    // Progress
    case 'first_weigh_in': {
      const { count } = await supabase
        .from('weight_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      return (count ?? 0) >= 1
    }
    case 'down_5lb': {
      const { data: first } = await supabase
        .from('weight_logs')
        .select('weight_kg')
        .eq('user_id', userId)
        .order('log_date', { ascending: true })
        .limit(1)
        .single()
      const { data: latest } = await supabase
        .from('weight_logs')
        .select('weight_kg')
        .eq('user_id', userId)
        .order('log_date', { ascending: false })
        .limit(1)
        .single()
      if (!first || !latest) return false
      return first.weight_kg - latest.weight_kg >= 2.27
    }
    case 'halfway': {
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_weight_kg, goal_weight_kg')
        .eq('id', userId)
        .single()
      if (!profile?.current_weight_kg || !profile?.goal_weight_kg) return false
      const { data: first } = await supabase
        .from('weight_logs')
        .select('weight_kg')
        .eq('user_id', userId)
        .order('log_date', { ascending: true })
        .limit(1)
        .single()
      if (!first) return false
      const totalToLose = first.weight_kg - profile.goal_weight_kg
      if (totalToLose <= 0) return false
      const lost = first.weight_kg - profile.current_weight_kg
      return lost >= totalToLose * 0.5
    }
    case 'goal_reached': {
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_weight_kg, goal_weight_kg')
        .eq('id', userId)
        .single()
      if (!profile?.current_weight_kg || !profile?.goal_weight_kg) return false
      return profile.current_weight_kg <= profile.goal_weight_kg
    }
    case 'progress_photo': {
      const { count } = await supabase
        .from('progress_photos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      return (count ?? 0) >= 1
    }

    // Social
    case 'first_post': {
      const { count } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      return (count ?? 0) >= 1
    }
    case 'likes_10': {
      const { data: posts } = await supabase
        .from('posts')
        .select('like_count')
        .eq('user_id', userId)
      const total = (posts || []).reduce((sum, p) => sum + (p.like_count || 0), 0)
      return total >= 10
    }
    case 'followers_10': {
      const { count } = await supabase
        .from('follows')
        .select('follower_id', { count: 'exact', head: true })
        .eq('following_id', userId)
      return (count ?? 0) >= 10
    }
    case 'social_butterfly': {
      const { count } = await supabase
        .from('post_comments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      return (count ?? 0) >= 20
    }

    // Accountability
    case 'first_group': {
      const { count } = await supabase
        .from('group_members')
        .select('group_id', { count: 'exact', head: true })
        .eq('user_id', userId)
      return (count ?? 0) >= 1
    }
    case 'checkin_perfect_week': {
      const { data } = await supabase
        .from('user_streaks')
        .select('current_count')
        .eq('user_id', userId)
        .eq('streak_type', 'check_in')
        .single()
      return (data?.current_count ?? 0) >= 7
    }
    case 'checkins_4_consecutive': {
      const { data } = await supabase
        .from('user_streaks')
        .select('current_count')
        .eq('user_id', userId)
        .eq('streak_type', 'check_in')
        .single()
      return (data?.current_count ?? 0) >= 28
    }

    // Gamification / Level
    case 'level_10':
    case 'level_25':
    case 'level_50': {
      const targetLevel = achievement.slug === 'level_10' ? 10 : achievement.slug === 'level_25' ? 25 : 50
      const { data } = await supabase
        .from('user_xp')
        .select('current_level')
        .eq('user_id', userId)
        .single()
      return (data?.current_level ?? 0) >= targetLevel
    }

    default:
      return false
  }
}

export async function checkAchievements(
  supabase: SupabaseClient,
  userId: string,
  categories: string[]
): Promise<UnlockedAchievement[]> {
  // Always include gamification for level-based achievements
  const allCategories = [...new Set([...categories, 'gamification'])]

  // Fetch achievements in given categories
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .in('category', allCategories)

  if (!achievements || achievements.length === 0) return []

  // Fetch user's already-unlocked achievement IDs
  const { data: unlocked } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  const unlockedIds = new Set((unlocked || []).map((u) => u.achievement_id))

  // Filter to unearned only
  const unearned = achievements.filter((a) => !unlockedIds.has(a.id))
  if (unearned.length === 0) return []

  const newlyUnlocked: UnlockedAchievement[] = []

  for (const achievement of unearned) {
    const met = await checkCondition(supabase, userId, achievement)
    if (!met) continue

    // Upsert to handle race conditions
    const { error: upsertError } = await supabase
      .from('user_achievements')
      .upsert(
        { user_id: userId, achievement_id: achievement.id },
        { onConflict: 'user_id,achievement_id' }
      )

    if (upsertError) continue

    // Award XP
    await addXP(supabase, userId, achievement.xp_reward).catch(() => {})

    // Create notification (self-notification for achievements)
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'achievement',
        title: `Achievement Unlocked: ${achievement.name}`,
        body: achievement.description,
        data: { slug: achievement.slug, icon: achievement.icon, xp_reward: achievement.xp_reward },
      })
    } catch {
      // ignore notification failures
    }

    // Broadcast celebration to groups
    await broadcastSystemMessage(
      supabase,
      userId,
      `unlocked the "${achievement.name}" achievement! ${achievement.icon}`,
      'celebration'
    ).catch(() => {})

    newlyUnlocked.push({
      slug: achievement.slug,
      name: achievement.name,
      icon: achievement.icon,
      xp_reward: achievement.xp_reward,
      rarity: achievement.rarity,
    })
  }

  return newlyUnlocked
}
