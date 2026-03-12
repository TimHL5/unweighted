import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .gte('end_date', today)
      .order('start_date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!challenges || challenges.length === 0) {
      return NextResponse.json({ challenges: [] })
    }

    // Get participant counts and user participation for all challenges
    const challengeIds = challenges.map((c) => c.id)

    const [{ data: allParticipants }, { data: userParticipations }] = await Promise.all([
      supabase
        .from('challenge_participants')
        .select('challenge_id')
        .in('challenge_id', challengeIds),
      supabase
        .from('challenge_participants')
        .select('challenge_id, current_progress, completed')
        .eq('user_id', user.id)
        .in('challenge_id', challengeIds),
    ])

    // Count participants per challenge
    const countMap = new Map<string, number>()
    for (const p of allParticipants || []) {
      countMap.set(p.challenge_id, (countMap.get(p.challenge_id) || 0) + 1)
    }

    // Map user participation
    const userMap = new Map(
      (userParticipations || []).map((p) => [p.challenge_id, p])
    )

    const enriched = challenges.map((c) => {
      const userP = userMap.get(c.id)
      return {
        ...c,
        joined: !!userP,
        current_progress: userP?.current_progress ?? 0,
        completed: userP?.completed ?? false,
        participant_count: countMap.get(c.id) || 0,
      }
    })

    return NextResponse.json({ challenges: enriched })
  } catch (error) {
    console.error('Challenges GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
