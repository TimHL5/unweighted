import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useGamificationStore } from '@/lib/stores/gamification-store'
import type { GroupListItem, GroupDetailResponse, GroupStatsResponse } from '@/lib/types'

export function useGroups() {
  return useQuery<{ groups: GroupListItem[] }>({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await fetch('/api/groups')
      if (!res.ok) throw new Error('Failed to fetch groups')
      return res.json()
    },
  })
}

export function useGroup(id: string) {
  return useQuery<GroupDetailResponse>({
    queryKey: ['group', id],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${id}`)
      if (!res.ok) throw new Error('Failed to fetch group')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useGroupStats(id: string) {
  return useQuery<GroupStatsResponse>({
    queryKey: ['group-stats', id],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${id}/stats`)
      if (!res.ok) throw new Error('Failed to fetch group stats')
      return res.json()
    },
    enabled: !!id,
    refetchInterval: 60_000,
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string | null
      goal_type?: string | null
      max_members?: number
    }) => {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create group')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useJoinGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, invite_code }: { groupId: string; invite_code: string }) => {
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to join group')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      useGamificationStore.getState().processGamificationResponse(data?.gamification)
    },
  })
}

export function useLeaveGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupId: string) => {
      const res = await fetch(`/api/groups/${groupId}/leave`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to leave group')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useUpdateGroup(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name?: string
      description?: string | null
      goal_type?: string | null
      max_members?: number
      is_active?: boolean
    }) => {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update group')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useDeleteGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupId: string) => {
      const res = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete group')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useGroupLookup(code: string | null) {
  return useQuery<{
    group: {
      id: string
      name: string
      description: string | null
      max_members: number
      member_count: number
      is_full: boolean
      is_already_member: boolean
    }
  }>({
    queryKey: ['group-lookup', code],
    queryFn: async () => {
      const res = await fetch(`/api/groups/lookup?code=${code}`)
      if (!res.ok) throw new Error('Group not found')
      return res.json()
    },
    enabled: !!code && code.length === 6,
    retry: false,
  })
}
