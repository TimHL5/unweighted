import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendMessageSchema } from '@/lib/validations/groups'
import { addXP, XP_GROUP_MESSAGE } from '@/lib/utils/xp'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cursor = request.nextUrl.searchParams.get('cursor')
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '30'), 50)

    let query = supabase
      .from('group_messages')
      .select('*, profile:profiles(id, display_name, avatar_url)')
      .eq('group_id', id)
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    const { data: messages, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let nextCursor: string | null = null
    if (messages && messages.length > limit) {
      nextCursor = messages[limit].created_at
      messages.splice(limit)
    }

    return NextResponse.json({ messages: messages || [], nextCursor })
  } catch (error) {
    console.error('Group messages GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = sendMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { data: message, error } = await supabase
      .from('group_messages')
      .insert({
        group_id: id,
        user_id: user.id,
        content: parsed.data.content,
        message_type: parsed.data.message_type,
        media_url: parsed.data.media_url || null,
      })
      .select('*, profile:profiles(id, display_name, avatar_url)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Award XP (non-blocking)
    await addXP(supabase, user.id, XP_GROUP_MESSAGE).catch(() => {})

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Group messages POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
