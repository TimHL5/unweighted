import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { weightLogSchema } from '@/lib/validations/progress'
import { updateStreak } from '@/lib/utils/streaks'
import { addXP, XP_WEIGHT_LOG } from '@/lib/utils/xp'
import { subDays, format } from 'date-fns'
import { broadcastSystemMessage } from '@/lib/utils/group-messages'
import { processGamification } from '@/lib/utils/gamification'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const range = request.nextUrl.searchParams.get('range') || '90'

    let query = supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: true })

    if (range !== 'all') {
      const days = parseInt(range) || 90
      const since = format(subDays(new Date(), days), 'yyyy-MM-dd')
      query = query.gte('log_date', since)
    }

    const { data: entries, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch goal weight from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('goal_weight_kg')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      entries: entries || [],
      goal_weight_kg: profile?.goal_weight_kg || null,
    })
  } catch (error) {
    console.error('Weight GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = weightLogSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    const { data: entry, error } = await supabase
      .from('weight_logs')
      .insert({
        user_id: user.id,
        weight_kg: data.weight_kg,
        body_fat_pct: data.body_fat_pct || null,
        log_date: data.log_date,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update profile current weight
    await supabase
      .from('profiles')
      .update({ current_weight_kg: data.weight_kg })
      .eq('id', user.id)

    await Promise.allSettled([
      updateStreak(supabase, user.id, 'weigh_in', data.log_date),
      addXP(supabase, user.id, XP_WEIGHT_LOG),
    ])

    // Check for new low weight (celebrate if losing goal and dropped >= 0.5kg)
    const { data: profile } = await supabase
      .from('profiles')
      .select('goal_type')
      .eq('id', user.id)
      .single()

    if (profile?.goal_type === 'lose') {
      const { data: prevEntry } = await supabase
        .from('weight_logs')
        .select('weight_kg')
        .eq('user_id', user.id)
        .lt('log_date', data.log_date)
        .order('log_date', { ascending: false })
        .limit(1)
        .single()

      if (prevEntry && data.weight_kg <= prevEntry.weight_kg - 0.5) {
        broadcastSystemMessage(supabase, user.id, 'logged a new low weight!', 'celebration').catch(() => { })
      }
    }

    const gamification = await processGamification(supabase, user.id, {
      achievementCategories: ['progress'],
    }).catch(() => null)

    return NextResponse.json({ entry, gamification }, { status: 201 })
  } catch (error) {
    console.error('Weight POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
