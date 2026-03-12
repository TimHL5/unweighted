'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useNotifications, useMarkAllRead } from '@/lib/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bell, Heart, MessageCircle, UserPlus, CheckCheck,
  Trophy, Flame, TrendingUp, Users, Star,
} from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { timeAgo } from '@/lib/utils/helpers'
import type { Notification } from '@/lib/types'

const notificationConfig: Record<string, {
  icon: typeof Heart
  bgColor: string
  iconColor: string
}> = {
  like: {
    icon: Heart,
    bgColor: 'bg-pink-500/10 dark:bg-pink-500/20',
    iconColor: 'text-pink-500',
  },
  comment: {
    icon: MessageCircle,
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-500',
  },
  follow: {
    icon: UserPlus,
    bgColor: 'bg-green-500/10 dark:bg-green-500/20',
    iconColor: 'text-green-500',
  },
  achievement: {
    icon: Trophy,
    bgColor: 'bg-amber/10 dark:bg-amber/20',
    iconColor: 'text-amber',
  },
  streak: {
    icon: Flame,
    bgColor: 'bg-coral/10 dark:bg-coral/20',
    iconColor: 'text-coral',
  },
  milestone: {
    icon: Star,
    bgColor: 'bg-purple/10 dark:bg-purple/20',
    iconColor: 'text-purple',
  },
  challenge: {
    icon: TrendingUp,
    bgColor: 'bg-teal/10 dark:bg-teal/20',
    iconColor: 'text-teal',
  },
  group: {
    icon: Users,
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-500',
  },
}

const defaultConfig = {
  icon: Bell,
  bgColor: 'bg-muted',
  iconColor: 'text-muted-foreground',
}

function getNotificationHref(notification: Notification): string {
  const data = notification.data as Record<string, string> | null
  if (notification.type === 'follow' && data?.user_id) {
    return `/dashboard/profile/${data.user_id}`
  }
  if ((notification.type === 'like' || notification.type === 'comment') && data?.post_id) {
    return `/dashboard/feed/${data.post_id}`
  }
  return '/dashboard/notifications'
}

export default function NotificationsPage() {
  const router = useRouter()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNotifications()
  const markAllRead = useMarkAllRead()

  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 })
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [handleObserver])

  const notifications = data?.pages.flatMap((p) => p.notifications) || []
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 pb-20"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-black">Notifications</h1>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral px-1.5 font-mono text-[10px] font-bold tabular-nums text-coral-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 rounded-full text-xs text-coral hover:bg-coral/5 hover:text-coral"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </motion.div>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
              <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="mt-5 font-display text-lg font-bold text-muted-foreground">
            All caught up!
          </p>
          <p className="mt-1.5 max-w-[240px] text-center font-body text-sm text-muted-foreground/70">
            When someone interacts with your posts, you will see it here.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-1.5"
        >
          {notifications.map((notification) => {
            const config = notificationConfig[notification.type] || defaultConfig
            const Icon = config.icon

            return (
              <motion.button
                key={notification.id}
                variants={fadeInUp}
                onClick={() => router.push(getNotificationHref(notification))}
                className={`flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition-all hover:bg-muted/50 active:scale-[0.99] ${
                  !notification.read
                    ? 'border-l-[3px] border-l-coral bg-coral/[0.03]'
                    : 'border-l-[3px] border-l-transparent'
                }`}
              >
                {/* Icon */}
                <div
                  className={`mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${config.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-body text-sm leading-snug ${!notification.read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="mt-0.5 font-body text-xs text-muted-foreground truncate">
                      {notification.body}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[10px] tabular-nums text-muted-foreground/60">
                    {timeAgo(notification.created_at)}
                  </p>
                </div>

                {/* Unread indicator */}
                {!notification.read && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-3 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-coral shadow-sm"
                  />
                )}
              </motion.button>
            )
          })}
        </motion.div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="h-1 w-1 rounded-full bg-coral animate-bounce [animation-delay:0ms]" />
          <div className="h-1 w-1 rounded-full bg-coral animate-bounce [animation-delay:150ms]" />
          <div className="h-1 w-1 rounded-full bg-coral animate-bounce [animation-delay:300ms]" />
        </div>
      )}

      {/* Real-time note */}
      {/* Realtime subscription is handled by useNotifications hook's refetchInterval or
          external Supabase realtime channel. No additional setup needed here. */}
    </motion.div>
  )
}
