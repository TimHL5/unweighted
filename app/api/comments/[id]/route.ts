import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    const { id } = await params

    const { data: comment } = await supabase
      .from('post_comments')
      .select('user_id, post_id')
      .eq('id', id)
      .single()

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase.from('post_comments').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Decrement comment count
    const { data: post } = await supabase
      .from('posts')
      .select('comment_count')
      .eq('id', comment.post_id)
      .single()

    if (post) {
      await supabase
        .from('posts')
        .update({ comment_count: Math.max((post.comment_count || 1) - 1, 0) })
        .eq('id', comment.post_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Comment DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
