import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    const { data: challenge, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    // Get leaderboard (top 20)
    const { data: participants } = await supabase
      .from('challenge_participants')
      .select('user_id, current_progress, completed, profiles(id, display_name, avatar_url)')
      .eq('challenge_id', id)
      .order('current_progress', { ascending: false })
      .limit(20)

    const leaderboard = (participants || []).map((p, index) => ({
      user_id: p.user_id,
      display_name: (p.profiles as unknown as { display_name: string })?.display_name || 'User',
      avatar_url: (p.profiles as unknown as { avatar_url: string | null })?.avatar_url || null,
      current_progress: p.current_progress,
      completed: p.completed,
      rank: index + 1,
    }))

    // Get current user's participation
    const { data: userParticipation } = await supabase
      .from('challenge_participants')
      .select('current_progress, completed')
      .eq('challenge_id', id)
      .eq('user_id', user.id)
      .single()

    // Total participant count
    const { count: totalParticipants } = await supabase
      .from('challenge_participants')
      .select('id', { count: 'exact', head: true })
      .eq('challenge_id', id)

    return NextResponse.json({
      challenge,
      leaderboard,
      user_participation: userParticipation || null,
      total_participants: totalParticipants || 0,
    })
  } catch (error) {
    console.error('Challenge detail GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
