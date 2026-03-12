import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const [
      profileResult,
      followersResult,
      followingResult,
      postCountResult,
      isFollowingResult,
      xpResult,
      streaksResult,
      achievementsResult,
      postsResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, display_name, avatar_url, bio, created_at')
        .eq('id', id)
        .single(),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', id),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', id),
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id),
      supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('following_id', id)
        .maybeSingle(),
      supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', id)
        .maybeSingle(),
      supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', id),
      supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', id)
        .order('unlocked_at', { ascending: false })
        .limit(5),
      supabase
        .from('posts')
        .select('*, profile:profiles(id, display_name, avatar_url)')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(12),
    ])

    if (profileResult.error || !profileResult.data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      profile: profileResult.data,
      followers_count: followersResult.count || 0,
      following_count: followingResult.count || 0,
      post_count: postCountResult.count || 0,
      is_following: !!isFollowingResult.data,
      xp: xpResult.data || null,
      streaks: streaksResult.data || [],
      achievements: achievementsResult.data || [],
      posts: postsResult.data || [],
    })
  } catch (error) {
    console.error('User profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
