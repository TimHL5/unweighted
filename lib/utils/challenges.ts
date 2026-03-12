import { SupabaseClient } from '@supabase/supabase-js'
import { addXP } from '@/lib/utils/xp'

export interface CompletedChallenge {
  name: string
  xp_reward: number
}

export async function updateChallengeProgress(
  supabase: SupabaseClient,
  userId: string,
  metric: string
): Promise<CompletedChallenge[]> {
  const today = new Date().toISOString().split('T')[0]

  // Fetch active challenge participations matching this metric
  const { data: participations } = await supabase
    .from('challenge_participants')
    .select('id, current_progress, challenge_id, challenges(id, name, target_value, xp_reward, end_date, metric)')
    .eq('user_id', userId)
    .eq('completed', false)

  if (!participations || participations.length === 0) return []

  const completed: CompletedChallenge[] = []

  for (const p of participations) {
    const challenge = p.challenges as unknown as {
      id: string; name: string; target_value: number; xp_reward: number; end_date: string; metric: string
    }
    if (!challenge) continue
    if (challenge.metric !== metric) continue
    if (challenge.end_date < today) continue

    const newProgress = (p.current_progress || 0) + 1
    const isComplete = newProgress >= challenge.target_value

    await supabase
      .from('challenge_participants')
      .update({
        current_progress: newProgress,
        completed: isComplete,
      })
      .eq('id', p.id)

    if (isComplete) {
      // Award XP
      await addXP(supabase, userId, challenge.xp_reward).catch(() => {})

      // Create notification
      try {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'challenge_complete',
          title: `Challenge Complete: ${challenge.name}`,
          body: `You earned ${challenge.xp_reward} XP!`,
          data: { challenge_id: challenge.id, xp_reward: challenge.xp_reward },
        })
      } catch {
        // ignore notification failures
      }

      completed.push({ name: challenge.name, xp_reward: challenge.xp_reward })
    }
  }

  return completed
}
