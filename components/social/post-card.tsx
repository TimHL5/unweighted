'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, UtensilsCrossed, Dumbbell, Camera, Trophy } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/providers/auth-provider'
import { useLikePost, useUnlikePost } from '@/lib/hooks/use-social'
import { useDeletePost } from '@/lib/hooks/use-feed'
import { heartPop } from '@/lib/motion'
import { timeAgo, getInitials } from '@/lib/utils/helpers'
import type { Post } from '@/lib/types'

const postTypeConfig: Record<string, {
  label: string
  icon: typeof Heart
  borderColor: string
  bgColor: string
  textColor: string
}> = {
  meal: {
    label: 'Meal',
    icon: UtensilsCrossed,
    borderColor: 'border-l-teal',
    bgColor: 'bg-teal/10',
    textColor: 'text-teal',
  },
  workout: {
    label: 'Workout',
    icon: Dumbbell,
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
  },
  progress: {
    label: 'Progress',
    icon: Camera,
    borderColor: 'border-l-purple',
    bgColor: 'bg-purple/10',
    textColor: 'text-purple',
  },
  milestone: {
    label: 'Milestone',
    icon: Trophy,
    borderColor: 'border-l-amber',
    bgColor: 'bg-amber/10',
    textColor: 'text-amber',
  },
  text: {
    label: 'Post',
    icon: MessageCircle,
    borderColor: 'border-l-muted-foreground/20',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
}

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth()
  const likePost = useLikePost()
  const unlikePost = useUnlikePost()
  const deletePost = useDeletePost()
  const [justLiked, setJustLiked] = useState(false)

  const isOwner = user?.id === post.user_id
  const config = postTypeConfig[post.post_type] || postTypeConfig.text
  const TypeIcon = config.icon
  const isMilestone = post.post_type === 'milestone'

  const handleLikeToggle = () => {
    if (post.liked_by_user) {
      unlikePost.mutate(post.id)
    } else {
      likePost.mutate(post.id)
      setJustLiked(true)
      setTimeout(() => setJustLiked(false), 600)
    }
  }

  return (
    <motion.div
      layout
      className={`relative overflow-hidden rounded-2xl border bg-card card-elevated transition-all ${
        isMilestone
          ? 'border-amber/30'
          : `border-l-[3px] ${config.borderColor}`
      }`}
    >
      {/* Milestone golden shimmer overlay */}
      {isMilestone && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber/5 via-transparent to-amber/5 animate-gradient" />
      )}

      <div className="relative p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/profile/${post.user_id}`}>
            <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
              <AvatarImage src={post.profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-coral/10 text-coral font-display text-xs font-bold">
                {getInitials(post.profile?.display_name || 'U')}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/profile/${post.user_id}`}
                className="font-display text-sm font-bold truncate hover:underline"
              >
                {post.profile?.display_name || 'User'}
              </Link>
              {/* Post type badge */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bgColor} ${config.textColor}`}
              >
                <TypeIcon className="h-2.5 w-2.5" />
                {config.label}
              </span>
            </div>
            <p className="font-body text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem
                  className="text-destructive gap-2"
                  onClick={() => deletePost.mutate(post.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        )}

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className={`grid gap-1.5 overflow-hidden rounded-xl ${
            post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            {post.media_urls.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`Post media ${i + 1}`}
                className="w-full object-cover max-h-80 rounded-xl"
              />
            ))}
          </div>
        )}

        {/* Meal nutrition card (for meal posts) */}
        {post.post_type === 'meal' && post.food_log_id && (
          <div className="flex items-center gap-3 rounded-xl bg-teal/5 border border-teal/10 px-3 py-2">
            <UtensilsCrossed className="h-4 w-4 text-teal flex-shrink-0" />
            <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
              <span className="font-semibold text-foreground">Logged meal</span>
              <span className="text-muted-foreground">Tap to view details</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1">
          {/* Like button */}
          <button
            onClick={handleLikeToggle}
            className="group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-coral/5"
          >
            <div className="relative">
              <motion.div
                variants={heartPop}
                animate={justLiked ? 'liked' : 'idle'}
              >
                <Heart
                  className={`h-5 w-5 transition-all duration-200 ${
                    post.liked_by_user
                      ? 'fill-coral text-coral'
                      : 'text-muted-foreground group-hover:text-coral'
                  }`}
                />
              </motion.div>
              {/* Like burst particles */}
              <AnimatePresence>
                {justLiked && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-coral"
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: Math.cos((i * 60 * Math.PI) / 180) * 16,
                          y: Math.sin((i * 60 * Math.PI) / 180) * 16,
                          opacity: 0,
                          scale: 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </div>
            <span className={`font-mono text-xs tabular-nums ${
              post.liked_by_user ? 'text-coral font-semibold' : 'text-muted-foreground'
            }`}>
              {post.like_count || 0}
            </span>
          </button>

          {/* Comment button */}
          <Link
            href={`/dashboard/feed/${post.id}`}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-mono text-xs tabular-nums">{post.comment_count || 0}</span>
          </Link>

          {/* Share button */}
          <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
