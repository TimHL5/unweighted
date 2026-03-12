import { SupabaseClient } from '@supabase/supabase-js'

export async function broadcastSystemMessage(
  supabase: SupabaseClient,
  userId: string,
  content: string,
  messageType: 'system' | 'celebration' = 'system'
) {
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)

  if (!memberships || memberships.length === 0) return

  const messages = memberships.map((m) => ({
    group_id: m.group_id,
    user_id: userId,
    content,
    message_type: messageType,
  }))

  await supabase.from('group_messages').insert(messages)
}

export async function sendGroupSystemMessage(
  supabase: SupabaseClient,
  groupId: string,
  userId: string,
  content: string,
  messageType: 'system' | 'celebration' = 'system'
) {
  await supabase.from('group_messages').insert({
    group_id: groupId,
    user_id: userId,
    content,
    message_type: messageType,
  })
}
