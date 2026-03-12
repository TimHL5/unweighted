import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [streaksResult, xpResult] = await Promise.all([
      supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', user.id)
        .single(),
    ])

    return NextResponse.json({
      streaks: streaksResult.data || [],
      xp: xpResult.data || { total_xp: 0, current_level: 1 },
    })
  } catch (error) {
    console.error('Streaks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
