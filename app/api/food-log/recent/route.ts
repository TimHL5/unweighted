import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: logs, error } = await supabase
      .from('food_logs')
      .select('*, food:foods(*)')
      .eq('user_id', user.id)
      .not('food_id', 'is', null)
      .order('logged_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Deduplicate by food_id, keeping the most recent
    const seen = new Set<string>()
    const unique = (logs || []).filter((log) => {
      if (!log.food_id || seen.has(log.food_id)) return false
      seen.add(log.food_id)
      return true
    })

    return NextResponse.json({ foods: unique.slice(0, 20) })
  } catch (error) {
    console.error('Recent foods error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
