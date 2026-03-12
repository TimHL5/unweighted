import { SupabaseClient } from '@supabase/supabase-js'

export async function createNotification(params: {
  supabase: SupabaseClient
  userId: string
  actorId: string
  type: string
  title: string
  body?: string
  data?: Record<string, unknown>
}) {
  const { supabase, userId, actorId, type, title, body, data } = params

  // Don't notify yourself
  if (userId === actorId) return

  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    body: body || null,
    data: data || null,
  })
}
