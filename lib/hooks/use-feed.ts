import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useGamificationStore } from '@/lib/stores/gamification-store'
import type { FeedPage } from '@/lib/types'

export function useFeed(type: 'following' | 'explore') {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['feed', type],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ type })
      if (pageParam) params.set('cursor', pageParam as string)
      const res = await fetch(`/api/feed?${params}`)
      if (!res.ok) throw new Error('Failed to fetch feed')
      return res.json()
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      content?: string
      post_type: string
      media_urls?: string[]
      food_log_id?: string | null
      visibility?: string
    }) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create post')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['user-posts'] })
      useGamificationStore.getState().processGamificationResponse(data?.gamification)
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete post')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['user-posts'] })
    },
  })
}
