import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const code = request.nextUrl.searchParams.get('code')
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 })
    }

    // Query group by invite code (requires RLS policy for authenticated lookup)
    const { data: group, error } = await supabase
      .from('groups')
      .select('id, name, description, max_members, members:group_members(user_id)')
      .eq('invite_code', code)
      .eq('is_active', true)
      .single()

    if (error || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const memberCount = group.members?.length || 0

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        max_members: group.max_members,
        member_count: memberCount,
        is_full: memberCount >= group.max_members,
        is_already_member: group.members?.some((m: { user_id: string }) => m.user_id === user.id) || false,
      },
    })
  } catch (error) {
    console.error('Group lookup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
