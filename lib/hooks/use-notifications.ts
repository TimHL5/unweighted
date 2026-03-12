import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { NotificationsPage } from '@/lib/types'

export function useNotifications() {
  return useInfiniteQuery<NotificationsPage>({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      if (pageParam) params.set('cursor', pageParam as string)
      const res = await fetch(`/api/notifications?${params}`)
      if (!res.ok) throw new Error('Failed to fetch notifications')
      return res.json()
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export function useUnreadCount() {
  return useQuery<{ unreadCount: number }>({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?limit=0')
      if (!res.ok) throw new Error('Failed to fetch unread count')
      return res.json()
    },
    refetchInterval: 30_000,
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', { method: 'PUT' })
      if (!res.ok) throw new Error('Failed to mark notifications read')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}
