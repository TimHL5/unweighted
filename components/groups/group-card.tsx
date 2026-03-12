'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Flame, MessageCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { timeAgo, getInitials } from '@/lib/utils/helpers'
import { fadeInUp } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { GroupListItem } from '@/lib/types'

interface GroupCardProps {
  group: GroupListItem
}

export function GroupCard({ group }: GroupCardProps) {
  const members = group.members || []
  const displayMembers = members.slice(0, 5)
  const hasActiveStreak = members.some(
    (m) => (m as unknown as { current_streak?: number }).current_streak && (m as unknown as { current_streak?: number }).current_streak! > 0
  )

  return (
    <motion.div variants={fadeInUp}>
      <Link href={`/dashboard/groups/${group.id}`} className="group block">
        <div
          className={cn(
            'glass rounded-2xl border border-border/50 p-4 transition-all duration-300',
            'hover:shadow-lg hover:shadow-coral/5 hover:-translate-y-0.5',
            'dark:hover:shadow-coral/10'
          )}
        >
          <div className="flex items-start gap-3.5">
            {/* Group avatar */}
            <div className="relative flex-shrink-0">
              {group.avatar_url ? (
                <Avatar className="h-12 w-12 ring-2 ring-border/50">
                  <AvatarImage src={group.avatar_url} alt={group.name} />
                  <AvatarFallback className="bg-coral/10 font-display text-base font-bold text-coral">
                    {getInitials(group.name)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-coral/20 to-purple/20 ring-2 ring-border/50">
                  <span className="font-display text-base font-bold text-coral">
                    {getInitials(group.name)}
                  </span>
                </div>
              )}
              {group.is_active && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-green" />
              )}
            </div>

            {/* Group info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-display text-base font-bold">
                  {group.name}
                </h3>
              </div>

              {/* Member count + streak */}
              <div className="mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span className="font-mono">
                    {group.member_count}/{group.max_members}
                  </span>
                  <span>members</span>
                </span>
                {hasActiveStreak && (
                  <span className="flex items-center gap-1 text-xs text-amber">
                    <Flame className="h-3 w-3 animate-fire-pulse" />
                    <span className="font-mono font-medium">Active</span>
                  </span>
                )}
                {group.goal_type && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                    {group.goal_type}
                  </span>
                )}
              </div>
            </div>

            {/* Stacked member avatars */}
            <div className="flex -space-x-2.5 self-center">
              {displayMembers.map((member) => {
                const profile = member.profile as
                  | { id: string; display_name: string; avatar_url: string | null }
                  | undefined
                return (
                  <Avatar
                    key={member.user_id}
                    className="h-7 w-7 border-2 border-card transition-transform group-hover:translate-x-0.5"
                  >
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-[9px] font-medium">
                      {getInitials(profile?.display_name || '?')}
                    </AvatarFallback>
                  </Avatar>
                )
              })}
              {group.member_count > 5 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted">
                  <span className="font-mono text-[9px] font-medium text-muted-foreground">
                    +{group.member_count - 5}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Last message preview */}
          {group.last_message && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <MessageCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground/60" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted-foreground">
                  {group.last_message.message_type === 'system' ||
                  group.last_message.message_type === 'celebration' ? (
                    <span className="italic">{group.last_message.content}</span>
                  ) : (
                    <>
                      <span className="font-medium text-foreground/80">
                        {group.last_message.profile?.display_name || 'Someone'}
                      </span>{' '}
                      {group.last_message.content}
                    </>
                  )}
                </p>
              </div>
              <span className="flex-shrink-0 text-[10px] text-muted-foreground/60">
                {timeAgo(group.last_message.created_at)}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
