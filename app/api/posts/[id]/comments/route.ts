import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createCommentSchema } from '@/lib/validations/social'
import { createNotification } from '@/lib/utils/notifications'

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

    const { id: postId } = await params

    const { data: comments, error } = await supabase
      .from('post_comments')
      .select('*, profile:profiles!post_comments_user_id_fkey(id, display_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ comments: comments || [] })
  } catch (error) {
    console.error('Comments GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: postId } = await params
    const body = await request.json()
    const parsed = createCommentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: parsed.data.content,
        parent_comment_id: parsed.data.parent_comment_id || null,
      })
      .select('*, profile:profiles!post_comments_user_id_fkey(id, display_name, avatar_url)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Increment comment count
    const { data: post } = await supabase
      .from('posts')
      .select('user_id, comment_count')
      .eq('id', postId)
      .single()

    if (post) {
      await supabase
        .from('posts')
        .update({ comment_count: (post.comment_count || 0) + 1 })
        .eq('id', postId)

      await createNotification({
        supabase,
        userId: post.user_id,
        actorId: user.id,
        type: 'comment',
        title: 'commented on your post',
        body: parsed.data.content.slice(0, 100),
        data: { post_id: postId },
      }).catch(() => { })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Comments POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
