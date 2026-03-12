import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { feedQuerySchema } from '@/lib/validations/social'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawParams = {
      type: request.nextUrl.searchParams.get('type') || undefined,
      cursor: request.nextUrl.searchParams.get('cursor') || undefined,
      limit: request.nextUrl.searchParams.get('limit') || undefined,
    }

    const parsed = feedQuerySchema.safeParse(rawParams)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid params', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { type, cursor, limit } = parsed.data

    let query = supabase
      .from('posts')
      .select('*, profile:profiles!posts_user_id_fkey(id, display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    if (type === 'following') {
      // Get IDs of users we follow
      const { data: followRows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = followRows?.map((r) => r.following_id) || []
      followingIds.push(user.id) // Include own posts

      query = query
        .in('user_id', followingIds)
        .in('visibility', ['public', 'followers'])
    } else {
      // Explore: public posts excluding own
      query = query
        .eq('visibility', 'public')
        .neq('user_id', user.id)
    }

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
  } catch (error: unknown) {
    console.error('Feed GET error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}
