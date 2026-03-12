import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GroupMessagesPage, GroupMessage } from '@/lib/types'

export function useGroupMessages(groupId: string) {
  return useInfiniteQuery<GroupMessagesPage>({
    queryKey: ['group-messages', groupId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      if (pageParam) params.set('cursor', pageParam as string)
      const res = await fetch(`/api/groups/${groupId}/messages?${params}`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      return res.json()
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!groupId,
    refetchOnWindowFocus: false,
  })
}

export function useSendMessage(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { content: string; message_type?: string; media_url?: string | null }) => {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to send message')
      return res.json()
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] })
    },
  })
}

export function useGroupChatRealtime(groupId: string) {
  const queryClient = useQueryClient()
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    if (!groupId) return

    const supabase = supabaseRef.current
    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const newMessage = payload.new as GroupMessage

          // Fetch profile for the message sender
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .eq('id', newMessage.user_id)
            .single()

          const messageWithProfile = { ...newMessage, profile: profile as GroupMessage['profile'] }

          // Prepend to first page of React Query cache
          queryClient.setQueryData<{ pages: GroupMessagesPage[]; pageParams: unknown[] }>(
            ['group-messages', groupId],
            (old) => {
              if (!old) return old

              // Check for duplicate
              const allMessages = old.pages.flatMap((p) => p.messages)
              if (allMessages.some((m) => m.id === newMessage.id)) return old

              const newPages = [...old.pages]
              newPages[0] = {
                ...newPages[0],
                messages: [messageWithProfile, ...newPages[0].messages],
              }
              return { ...old, pages: newPages }
            }
          )

          // Invalidate groups list for last_message preview
          queryClient.invalidateQueries({ queryKey: ['groups'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, queryClient])
}
