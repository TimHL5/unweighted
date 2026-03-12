'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { PostCard } from '@/components/social/post-card'
import { useComments, useCreateComment, useDeleteComment } from '@/lib/hooks/use-social'
import { useAuth } from '@/lib/providers/auth-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Send, Trash2 } from 'lucide-react'
import { timeAgo, getInitials } from '@/lib/utils/helpers'
import type { Post } from '@/lib/types'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/motion'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [commentText, setCommentText] = useState('')

  const { data: postData, isLoading: postLoading } = useQuery<{ post: Post }>({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${id}`)
      if (!res.ok) throw new Error('Failed to fetch post')
      return res.json()
    },
  })

  const { data: commentsData, isLoading: commentsLoading } = useComments(id)
  const createComment = useCreateComment(id)
  const deleteComment = useDeleteComment(id)

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return
    try {
      await createComment.mutateAsync({ content: commentText.trim() })
      setCommentText('')
    } catch {
      // handled by mutation
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5 pb-28"
    >
      {/* Back button */}
      <motion.div variants={fadeInUp}>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Post */}
      <motion.div variants={fadeInUp}>
        {postLoading ? (
          <div className="card-elevated rounded-2xl border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : postData?.post ? (
          <PostCard post={postData.post} />
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <p className="font-display text-muted-foreground">Post not found</p>
          </div>
        )}
      </motion.div>

      {/* Comments */}
      <motion.div variants={fadeInUp} className="space-y-4">
        <h2 className="font-display text-lg font-bold">
          Comments
          {commentsData?.comments && commentsData.comments.length > 0 && (
            <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">
              {commentsData.comments.length}
            </span>
          )}
        </h2>

        {commentsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : commentsData?.comments.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {commentsData?.comments.map((comment, i) => (
              <motion.div
                key={comment.id}
                variants={fadeInUp}
                custom={i}
                className="flex gap-3 rounded-xl bg-muted/30 p-3 transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-background">
                  <AvatarImage src={comment.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-coral/10 text-coral text-[10px] font-semibold">
                    {getInitials(comment.profile?.display_name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xs font-semibold">
                      {comment.profile?.display_name || 'User'}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {timeAgo(comment.created_at)}
                    </span>
                    {user?.id === comment.user_id && (
                      <button
                        onClick={() => deleteComment.mutate(comment.id)}
                        className="ml-auto rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed">{comment.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Comment input (sticky bottom) */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t bg-card/95 p-3 backdrop-blur-sm lg:bottom-0 lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <Input
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
            className="h-11 flex-1 rounded-xl"
          />
          <Button
            size="icon"
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || createComment.isPending}
            className="h-11 w-11 rounded-xl bg-coral text-white shadow-sm shadow-coral/20 hover:bg-coral/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
