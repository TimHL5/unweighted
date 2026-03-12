import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createGroupSchema } from '@/lib/validations/groups'
import { generateInviteCode } from '@/lib/utils/helpers'
import { sendGroupSystemMessage } from '@/lib/utils/group-messages'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's group IDs
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ groups: [] })
    }

    const groupIds = memberships.map((m) => m.group_id)

    // Fetch groups with members + profiles
    const { data: groups, error } = await supabase
      .from('groups')
      .select('*, members:group_members(group_id, user_id, role, joined_at, profile:profiles(id, display_name, avatar_url))')
      .in('id', groupIds)
      .eq('is_active', true)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // For each group, fetch latest message and compute member count
    const groupsWithMeta = await Promise.all(
      (groups || []).map(async (group) => {
        const { data: messages } = await supabase
          .from('group_messages')
          .select('*, profile:profiles(id, display_name, avatar_url)')
          .eq('group_id', group.id)
          .order('created_at', { ascending: false })
          .limit(1)

        return {
          ...group,
          member_count: group.members?.length || 0,
          last_message: messages?.[0] || null,
        }
      })
    )

    // Sort by last message date (most recent first)
    groupsWithMeta.sort((a, b) => {
      const aTime = a.last_message?.created_at || a.created_at
      const bTime = b.last_message?.created_at || b.created_at
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

    return NextResponse.json({ groups: groupsWithMeta })
  } catch (error) {
    console.error('Groups GET error:', error)
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
    const parsed = createGroupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data
    const invite_code = generateInviteCode()

    // Create the group
    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        name: data.name,
        description: data.description || null,
        goal_type: data.goal_type || null,
        max_members: data.max_members,
        group_type: 'public',
        invite_code,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add creator as admin member
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      role: 'admin',
    })

    // System message
    await sendGroupSystemMessage(supabase, group.id, user.id, 'created this group')

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error('Groups POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
