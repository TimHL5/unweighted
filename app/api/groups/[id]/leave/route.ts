import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendGroupSystemMessage } from '@/lib/utils/group-messages'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch group
    const { data: group } = await supabase
      .from('groups')
      .select('created_by')
      .eq('id', id)
      .single()

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Get display name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    const displayName = profile?.display_name || 'Someone'

    // CRITICAL: Insert system message BEFORE deleting membership (RLS requires membership for INSERT)
    await sendGroupSystemMessage(supabase, id, user.id, `${displayName} left the group`)

    // Delete membership
    const { error: leaveError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', id)
      .eq('user_id', user.id)

    if (leaveError) {
      return NextResponse.json({ error: leaveError.message }, { status: 500 })
    }

    // If was creator, promote oldest remaining member or delete group
    if (group.created_by === user.id) {
      const { data: remaining } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', id)
        .order('joined_at', { ascending: true })
        .limit(1)

      if (remaining && remaining.length > 0) {
        // Promote oldest member to admin and transfer ownership
        await supabase
          .from('group_members')
          .update({ role: 'admin' })
          .eq('group_id', id)
          .eq('user_id', remaining[0].user_id)

        await supabase
          .from('groups')
          .update({ created_by: remaining[0].user_id })
          .eq('id', id)
      } else {
        // No members left — delete group
        await supabase.from('groups').delete().eq('id', id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Group leave error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
