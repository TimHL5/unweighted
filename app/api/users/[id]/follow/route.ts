import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createNotification } from '@/lib/utils/notifications'
import { processGamification } from '@/lib/utils/gamification'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: followingId } = await params

    if (followingId === user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    const { error } = await supabase
      .from('follows')
      .upsert(
        { follower_id: user.id, following_id: followingId },
        { onConflict: 'follower_id,following_id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await createNotification({
      supabase,
      userId: followingId,
      actorId: user.id,
      type: 'follow',
      title: 'started following you',
      data: { user_id: user.id },
    }).catch(() => {})

    // Best-effort: check achievements for the followed user (may fail due to RLS)
    const gamification = await processGamification(supabase, followingId, {
      achievementCategories: ['social'],
    }).catch(() => null)

    return NextResponse.json({ success: true, gamification })
  } catch (error) {
    console.error('Follow POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: followingId } = await params

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Follow DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
