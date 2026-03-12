import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [{ data: allAchievements, error: achievementsError }, { data: userAchievements, error: userError }] =
      await Promise.all([
        supabase
          .from('achievements')
          .select('*')
          .order('category')
          .order('rarity'),
        supabase
          .from('user_achievements')
          .select('achievement_id, unlocked_at')
          .eq('user_id', user.id),
      ])

    if (achievementsError || userError) {
      return NextResponse.json(
        { error: achievementsError?.message || userError?.message },
        { status: 500 }
      )
    }

    const unlockedMap = new Map(
      (userAchievements || []).map((ua) => [ua.achievement_id, ua.unlocked_at])
    )

    const achievements = (allAchievements || []).map((a) => ({
      ...a,
      unlocked: unlockedMap.has(a.id),
      unlocked_at: unlockedMap.get(a.id) || null,
    }))

    return NextResponse.json({
      achievements,
      unlocked_count: unlockedMap.size,
      total_count: allAchievements?.length || 0,
    })
  } catch (error) {
    console.error('Achievements GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
