'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/shared/image-upload'
import { useCreatePost } from '@/lib/hooks/use-feed'
import { toast } from 'sonner'
import {
  Loader2, Type, Camera, UtensilsCrossed, TrendingUp, Trophy,
  Globe, Users, X,
} from 'lucide-react'

const postTypes = [
  { value: 'text', label: 'Text', icon: Type, color: 'text-muted-foreground' },
  { value: 'meal', label: 'Meal', icon: UtensilsCrossed, color: 'text-teal' },
  { value: 'progress', label: 'Progress', icon: TrendingUp, color: 'text-purple' },
  { value: 'workout', label: 'Photo', icon: Camera, color: 'text-blue-500' },
  { value: 'milestone', label: 'Milestone', icon: Trophy, color: 'text-amber' },
] as const

type PostType = (typeof postTypes)[number]['value']

const visibilityOptions = [
  { value: 'public', label: 'Public', icon: Globe },
  { value: 'followers', label: 'Followers', icon: Users },
] as const

type Visibility = (typeof visibilityOptions)[number]['value']

interface CreatePostSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePostSheet({ open, onOpenChange }: CreatePostSheetProps) {
  const [postType, setPostType] = useState<PostType>('text')
  const [content, setContent] = useState('')
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [visibility, setVisibility] = useState<Visibility>('public')

  const createPost = useCreatePost()

  const canPost = content.trim().length > 0 || mediaUrls.length > 0

  const handlePost = async () => {
    if (!canPost) return

    try {
      await createPost.mutateAsync({
        content: content.trim() || undefined,
        post_type: postType,
        media_urls: mediaUrls,
        visibility,
      })
      toast.success('Post created!')
      setContent('')
      setMediaUrls([])
      setPostType('text')
      setVisibility('public')
      onOpenChange(false)
    } catch {
      toast.error('Failed to create post')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="pb-3">
          <SheetTitle className="font-display text-lg">Create Post</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 overflow-y-auto pb-4">
          {/* Post Type Selector */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
            {postTypes.map((pt) => {
              const isActive = postType === pt.value
              return (
                <motion.button
                  key={pt.value}
                  onClick={() => setPostType(pt.value)}
                  className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-coral text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <pt.icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : pt.color}`} />
                  {pt.label}
                </motion.button>
              )
            })}
          </div>

          {/* Content */}
          <div className="relative">
            <Textarea
              placeholder={
                postType === 'meal'
                  ? 'Share what you ate today...'
                  : postType === 'progress'
                  ? 'Share your progress update...'
                  : postType === 'milestone'
                  ? 'Celebrate your achievement...'
                  : "What's on your mind?"
              }
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 2000))}
              rows={6}
              className="resize-none rounded-xl font-body text-sm placeholder:text-muted-foreground/50"
            />
            <span className="absolute bottom-2.5 right-3 font-mono text-[10px] tabular-nums text-muted-foreground/50">
              {content.length}/2000
            </span>
          </div>

          {/* Image Upload */}
          {mediaUrls.length < 4 && (
            <ImageUpload
              bucket="post-media"
              folder="posts"
              onUploadComplete={(url) => setMediaUrls((prev) => [...prev, url])}
            />
          )}

          {/* Uploaded images preview */}
          {mediaUrls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
              {mediaUrls.map((url, i) => (
                <div key={i} className="relative flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  <button
                    onClick={() => setMediaUrls((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm transition-transform hover:scale-110"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Visibility Selector (segmented control) */}
          <div className="space-y-2">
            <p className="font-body text-xs font-medium text-muted-foreground">Visibility</p>
            <div className="flex rounded-xl bg-muted p-1">
              {visibilityOptions.map((v) => {
                const isActive = visibility === v.value
                return (
                  <button
                    key={v.value}
                    onClick={() => setVisibility(v.value)}
                    className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="visibility-pill"
                        className="absolute inset-0 rounded-lg bg-card shadow-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <v.icon className="relative z-10 h-3.5 w-3.5" />
                    <span className="relative z-10">{v.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Post Button */}
          <Button
            onClick={handlePost}
            disabled={!canPost || createPost.isPending}
            className="h-12 w-full rounded-xl bg-coral text-coral-foreground hover:bg-coral/90 font-display font-bold text-base shadow-lg disabled:opacity-40"
          >
            {createPost.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Post
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
