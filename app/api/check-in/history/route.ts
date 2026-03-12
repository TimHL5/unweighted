import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '14')

    const { data: check_ins, error } = await supabase
      .from('daily_check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('check_in_date', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ check_ins: check_ins || [] })
  } catch (error) {
    console.error('Check-in history GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
