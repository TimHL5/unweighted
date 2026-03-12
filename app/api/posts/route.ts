import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createPostSchema } from '@/lib/validations/social'
import { addXP, XP_POST_CREATE } from '@/lib/utils/xp'
import { processGamification } from '@/lib/utils/gamification'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = request.nextUrl.searchParams.get('user_id')
    const cursor = request.nextUrl.searchParams.get('cursor')
    const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 20, 50)

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    let query = supabase
      .from('posts')
      .select('*, profile:profiles!posts_user_id_fkey(id, display_name, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    const { data: posts, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let nextCursor: string | null = null
    if (posts && posts.length > limit) {
      nextCursor = posts[limit].created_at
      posts.splice(limit)
    }

    // Batch check likes
    if (posts && posts.length > 0) {
      const postIds = posts.map((p) => p.id)
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)

      const likedSet = new Set(likes?.map((l) => l.post_id))
      for (const post of posts) {
        post.liked_by_user = likedSet.has(post.id)
      }
    }

    return NextResponse.json({ posts: posts || [], nextCursor })
  } catch (error) {
    console.error('Posts GET error:', error)
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
    const parsed = createPostSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: data.content || null,
        post_type: data.post_type,
        media_urls: data.media_urls,
        food_log_id: data.food_log_id || null,
        visibility: data.visibility,
      })
      .select('*, profile:profiles!posts_user_id_fkey(id, display_name, avatar_url)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await addXP(supabase, user.id, XP_POST_CREATE).catch(() => { })

    const gamification = await processGamification(supabase, user.id, {
      achievementCategories: ['social'],
      challengeMetric: 'posts_created',
    }).catch(() => null)

    return NextResponse.json({ post, gamification }, { status: 201 })
  } catch (error) {
    console.error('Posts POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
