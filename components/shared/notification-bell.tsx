'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUnreadCount } from '@/lib/hooks/use-notifications'
import { motion, AnimatePresence } from 'framer-motion'

export function NotificationBell() {
  const { data } = useUnreadCount()
  const unreadCount = data?.unreadCount || 0

  return (
    <Link href="/dashboard/notifications">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-coral px-1 font-mono text-[10px] font-bold text-white shadow-sm shadow-coral/30"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </Link>
  )
}
