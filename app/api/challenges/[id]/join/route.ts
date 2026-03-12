import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
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

    // Verify challenge is active
    const today = new Date().toISOString().split('T')[0]
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id, end_date')
      .eq('id', id)
      .gte('end_date', today)
      .single()

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found or has ended' }, { status: 404 })
    }

    // Insert participation
    const { error } = await supabase
      .from('challenge_participants')
      .upsert(
        {
          challenge_id: id,
          user_id: user.id,
          current_progress: 0,
          completed: false,
        },
        { onConflict: 'challenge_id,user_id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Challenge join error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
