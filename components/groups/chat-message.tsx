'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { getInitials } from '@/lib/utils/helpers'
import { cn } from '@/lib/utils'
import { slideInRight, slideInLeft } from '@/lib/motion'
import type { GroupMessage } from '@/lib/types'

interface ChatMessageProps {
  message: GroupMessage
  isOwn: boolean
  showAvatar?: boolean
}

export function ChatMessage({ message, isOwn, showAvatar = true }: ChatMessageProps) {
  const [imageOpen, setImageOpen] = useState(false)
  const isSystem = message.message_type === 'system'
  const isCelebration = message.message_type === 'celebration'
  const isImage = message.message_type === 'image'

  const timestamp = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  // System messages: centered pill
  if (isSystem) {
    return (
      <div className="flex justify-center py-1.5">
        <span className="rounded-full bg-muted px-3.5 py-1 text-[11px] italic text-muted-foreground">
          {message.profile?.display_name || 'Someone'} {message.content}
        </span>
      </div>
    )
  }

  // Celebration messages: golden card with sparkle
  if (isCelebration) {
    return (
      <div className="flex justify-center py-2">
        <div className="relative overflow-hidden rounded-xl border border-amber/30 bg-gradient-to-r from-amber/10 via-amber/5 to-amber/10 px-5 py-3 text-center">
          {/* Sparkle accents */}
          <div className="absolute -right-1 -top-1 text-sm opacity-60">✨</div>
          <div className="absolute -bottom-1 -left-1 text-sm opacity-60">✨</div>
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
            {message.profile?.display_name || 'Someone'} {message.content}
          </p>
          <p className="mt-0.5 text-[10px] text-amber-600/60 dark:text-amber-400/60">
            {timestamp}
          </p>
        </div>
      </div>
    )
  }

  // Own messages: right-aligned coral bubble
  if (isOwn) {
    return (
      <motion.div variants={slideInRight} className="flex justify-end py-0.5">
        <div className="max-w-[75%]">
          {isImage && message.media_url ? (
            <>
              <button
                type="button"
                onClick={() => setImageOpen(true)}
                className="overflow-hidden rounded-2xl rounded-br-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={message.media_url}
                  alt="Shared image"
                  className="max-h-64 w-full rounded-2xl rounded-br-md object-cover transition-transform hover:scale-[1.02]"
                />
              </button>
              {message.content && (
                <div className="mt-1 rounded-2xl rounded-br-md bg-gradient-to-br from-coral to-[#FF6B84] px-3.5 py-2 text-white">
                  <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl rounded-br-md bg-gradient-to-br from-coral to-[#FF6B84] px-3.5 py-2 shadow-sm shadow-coral/10">
              <p className="whitespace-pre-wrap break-words text-sm text-white">
                {message.content}
              </p>
            </div>
          )}
          <p className="mt-0.5 text-right text-[10px] text-muted-foreground/60">
            {timestamp}
          </p>
        </div>
      </motion.div>
    )
  }

  // Received messages: left-aligned with avatar
  return (
    <motion.div variants={slideInLeft} className="flex gap-2 py-0.5">
      {showAvatar ? (
        <Avatar className="mt-1 h-7 w-7 flex-shrink-0 ring-1 ring-border/50">
          <AvatarImage src={message.profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-muted text-[10px] font-medium">
            {getInitials(message.profile?.display_name || '?')}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-7 flex-shrink-0" />
      )}
      <div className="max-w-[75%]">
        {showAvatar && (
          <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
            {message.profile?.display_name}
          </p>
        )}
        {isImage && message.media_url ? (
          <>
            <button
              type="button"
              onClick={() => setImageOpen(true)}
              className="overflow-hidden rounded-2xl rounded-tl-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.media_url}
                alt="Shared image"
                className="max-h-64 w-full rounded-2xl rounded-tl-md object-cover transition-transform hover:scale-[1.02]"
              />
            </button>
            {message.content && (
              <div className="mt-1 rounded-2xl rounded-tl-md bg-card px-3.5 py-2 shadow-sm">
                <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
              </div>
            )}
          </>
        ) : (
          <div
            className={cn(
              'rounded-2xl rounded-tl-md px-3.5 py-2 shadow-sm',
              'bg-card border border-border/40'
            )}
          >
            <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
          </div>
        )}
        <p className="mt-0.5 text-[10px] text-muted-foreground/60">
          {timestamp}
        </p>
      </div>

      {/* Image lightbox */}
      {isImage && message.media_url && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.media_url}
              alt="Full size"
              className="w-full rounded-2xl"
            />
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  )
}
