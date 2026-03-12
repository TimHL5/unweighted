import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { joinGroupSchema } from '@/lib/validations/groups'
import { sendGroupSystemMessage } from '@/lib/utils/group-messages'
import { createNotification } from '@/lib/utils/notifications'
import { processGamification } from '@/lib/utils/gamification'

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
    const parsed = joinGroupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    // Fetch group with members
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*, members:group_members(user_id)')
      .eq('id', id)
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Verify invite code
    if (group.invite_code !== parsed.data.invite_code) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 })
    }

    // Check not full
    if (group.members && group.members.length >= group.max_members) {
      return NextResponse.json({ error: 'Group is full' }, { status: 409 })
    }

    // Check not already member
    if (group.members?.some((m: { user_id: string }) => m.user_id === user.id)) {
      return NextResponse.json({ error: 'Already a member' }, { status: 409 })
    }

    // Insert membership
    const { error: joinError } = await supabase.from('group_members').insert({
      group_id: id,
      user_id: user.id,
      role: 'member',
    })

    if (joinError) {
      return NextResponse.json({ error: joinError.message }, { status: 500 })
    }

    // Get profile for display name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    const displayName = profile?.display_name || 'Someone'

    // Send system message
    await sendGroupSystemMessage(supabase, id, user.id, `${displayName} joined the group!`)

    // Notify existing members
    const existingMembers = group.members?.filter((m: { user_id: string }) => m.user_id !== user.id) || []
    await Promise.allSettled(
      existingMembers.map((m: { user_id: string }) =>
        createNotification({
          supabase,
          userId: m.user_id,
          actorId: user.id,
          type: 'group_join',
          title: `${displayName} joined ${group.name}`,
          data: { group_id: id },
        })
      )
    )

    const gamification = await processGamification(supabase, user.id, {
      achievementCategories: ['accountability'],
      challengeMetric: 'group_join',
    }).catch(() => null)

    return NextResponse.json({ success: true, gamification }, { status: 201 })
  } catch (error) {
    console.error('Group join error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
