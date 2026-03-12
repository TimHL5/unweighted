import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ChallengeWithStatus, ChallengeLeaderboardEntry, Challenge } from '@/lib/types'

export function useChallenges() {
  return useQuery<{ challenges: ChallengeWithStatus[] }>({
    queryKey: ['challenges'],
    queryFn: async () => {
      const res = await fetch('/api/challenges')
      if (!res.ok) throw new Error('Failed to fetch challenges')
      return res.json()
    },
  })
}

export function useChallengeDetail(id: string) {
  return useQuery<{
    challenge: Challenge
    leaderboard: ChallengeLeaderboardEntry[]
    user_participation: { current_progress: number; completed: boolean } | null
    total_participants: number
  }>({
    queryKey: ['challenge', id],
    queryFn: async () => {
      const res = await fetch(`/api/challenges/${id}`)
      if (!res.ok) throw new Error('Failed to fetch challenge')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useJoinChallenge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (challengeId: string) => {
      const res = await fetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to join challenge')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
      queryClient.invalidateQueries({ queryKey: ['challenge'] })
    },
  })
}
