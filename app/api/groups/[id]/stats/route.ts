import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { startOfWeek, format } from 'date-fns'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get group members with profiles
    const { data: members, error } = await supabase
      .from('group_members')
      .select('user_id, profile:profiles(id, display_name, avatar_url)')
      .eq('group_id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!members || members.length === 0) {
      return NextResponse.json({ members: [] })
    }

    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

    // Fetch stats for each member in parallel
    const stats = await Promise.all(
      members.map(async (member) => {
        const uid = member.user_id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profileArr = member.profile as any
        const profile = Array.isArray(profileArr) ? profileArr[0] : profileArr

        const [foodLogResult, streakResult, xpResult] = await Promise.all([
          supabase
            .from('food_logs')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', uid)
            .gte('log_date', weekStart),
          supabase
            .from('user_streaks')
            .select('current_count')
            .eq('user_id', uid)
            .eq('streak_type', 'food_log')
            .single(),
          supabase
            .from('user_xp')
            .select('total_xp')
            .eq('user_id', uid)
            .single(),
        ])

        return {
          user_id: uid,
          display_name: profile?.display_name || 'Unknown',
          avatar_url: profile?.avatar_url || null,
          food_logs_this_week: foodLogResult.count || 0,
          current_streak: streakResult.data?.current_count || 0,
          xp_total: xpResult.data?.total_xp || 0,
        }
      })
    )

    return NextResponse.json({ members: stats })
  } catch (error) {
    console.error('Group stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
