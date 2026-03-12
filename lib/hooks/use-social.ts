import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { FeedPage, UserProfileResponse, PostComment } from '@/lib/types'

export function useLikePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to like post')
      return res.json()
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] })
      const previousFeeds = queryClient.getQueriesData<{ pages: FeedPage[] }>({ queryKey: ['feed'] })

      queryClient.setQueriesData<{ pages: FeedPage[]; pageParams: unknown[] }>(
        { queryKey: ['feed'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) =>
                post.id === postId
                  ? { ...post, liked_by_user: true, like_count: post.like_count + 1 }
                  : post
              ),
            })),
          }
        }
      )

      return { previousFeeds }
    },
    onError: (_err, _postId, context) => {
      if (context?.previousFeeds) {
        for (const [key, data] of context.previousFeeds) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useUnlikePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to unlike post')
      return res.json()
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] })
      const previousFeeds = queryClient.getQueriesData<{ pages: FeedPage[] }>({ queryKey: ['feed'] })

      queryClient.setQueriesData<{ pages: FeedPage[]; pageParams: unknown[] }>(
        { queryKey: ['feed'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) =>
                post.id === postId
                  ? { ...post, liked_by_user: false, like_count: Math.max(post.like_count - 1, 0) }
                  : post
              ),
            })),
          }
        }
      )

      return { previousFeeds }
    },
    onError: (_err, _postId, context) => {
      if (context?.previousFeeds) {
        for (const [key, data] of context.previousFeeds) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useComments(postId: string) {
  return useQuery<{ comments: PostComment[] }>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}/comments`)
      if (!res.ok) throw new Error('Failed to fetch comments')
      return res.json()
    },
    enabled: !!postId,
  })
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { content: string; parent_comment_id?: string | null }) => {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create comment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete comment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useFollow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to follow')
      return res.json()
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] })
      queryClient.invalidateQueries({ queryKey: ['feed', 'following'] })
    },
  })
}

export function useUnfollow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users/${userId}/follow`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to unfollow')
      return res.json()
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] })
      queryClient.invalidateQueries({ queryKey: ['feed', 'following'] })
    },
  })
}

export function useUserProfile(userId: string | undefined) {
  return useQuery<UserProfileResponse>({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/profile`)
      if (!res.ok) throw new Error('Failed to fetch profile')
      return res.json()
    },
    enabled: !!userId,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      display_name?: string
      bio?: string | null
      avatar_url?: string | null
    }) => {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
  })
}

export function useUserPosts(userId: string | undefined) {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['user-posts', userId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ user_id: userId! })
      if (pageParam) params.set('cursor', pageParam as string)
      const res = await fetch(`/api/posts?${params}`)
      if (!res.ok) throw new Error('Failed to fetch posts')
      return res.json()
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!userId,
  })
}
