'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils/helpers'

interface UserListSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  type: 'followers' | 'following'
}

interface UserItem {
  id: string
  display_name: string
  avatar_url: string | null
}

export function UserListSheet({ open, onOpenChange, userId, type }: UserListSheetProps) {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    const fetchUsers = async () => {
      setLoading(true)
      const supabase = createClient()

      if (type === 'followers') {
        const { data } = await supabase
          .from('follows')
          .select('follower:profiles!follows_follower_id_fkey(id, display_name, avatar_url)')
          .eq('following_id', userId)

        setUsers(
          (data || [])
            .map((row) => row.follower as unknown as UserItem)
            .filter(Boolean)
        )
      } else {
        const { data } = await supabase
          .from('follows')
          .select('following:profiles!follows_following_id_fkey(id, display_name, avatar_url)')
          .eq('follower_id', userId)

        setUsers(
          (data || [])
            .map((row) => row.following as unknown as UserItem)
            .filter(Boolean)
        )
      }
      setLoading(false)
    }

    fetchUsers()
  }, [open, userId, type])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
        <SheetHeader>
          <SheetTitle>{type === 'followers' ? 'Followers' : 'Following'}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-2 overflow-y-auto">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </p>
          ) : (
            users.map((u) => (
              <Link
                key={u.id}
                href={`/dashboard/profile/${u.id}`}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={u.avatar_url || undefined} />
                  <AvatarFallback className="bg-coral/10 text-coral text-xs">
                    {getInitials(u.display_name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{u.display_name}</span>
              </Link>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
