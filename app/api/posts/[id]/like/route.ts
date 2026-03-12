import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { addXP, XP_POST_LIKED } from '@/lib/utils/xp'
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

    const { id: postId } = await params

    const { data: post } = await supabase
      .from('posts')
      .select('user_id, like_count')
      .eq('id', postId)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Upsert to handle duplicates
    await supabase
      .from('post_likes')
      .upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id,user_id' })

    await supabase
      .from('posts')
      .update({ like_count: (post.like_count || 0) + 1 })
      .eq('id', postId)

    // XP for post owner + notification (non-blocking)
    await Promise.allSettled([
      addXP(supabase, post.user_id, XP_POST_LIKED),
      createNotification({
        supabase,
        userId: post.user_id,
        actorId: user.id,
        type: 'like',
        title: 'liked your post',
        data: { post_id: postId },
      }),
    ])

    // Best-effort: check achievements for post owner (may fail due to RLS)
    const gamification = await processGamification(supabase, post.user_id, {
      achievementCategories: ['social'],
    }).catch(() => null)

    return NextResponse.json({ success: true, gamification })
  } catch (error) {
    console.error('Like POST error:', error)
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

    const { id: postId } = await params

    await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    // Decrement like count (min 0)
    const { data: post } = await supabase
      .from('posts')
      .select('like_count')
      .eq('id', postId)
      .single()

    if (post) {
      await supabase
        .from('posts')
        .update({ like_count: Math.max((post.like_count || 1) - 1, 0) })
        .eq('id', postId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Like DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
