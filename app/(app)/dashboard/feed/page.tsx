'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFeed } from '@/lib/hooks/use-feed'
import { useUserPosts } from '@/lib/hooks/use-social'
import { useAuth } from '@/lib/providers/auth-provider'
import { PostCard } from '@/components/social/post-card'
import { CreatePostSheet } from '@/components/social/create-post-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { fadeInUp, staggerContainer, tabContent } from '@/lib/motion'
import { Plus, Compass, Users, User, RefreshCw } from 'lucide-react'

type FeedTab = 'explore' | 'following' | 'my-posts'

export default function FeedPage() {
  const [feedTab, setFeedTab] = useState<FeedTab>('explore')
  const [createOpen, setCreateOpen] = useState(false)
  const { user } = useAuth()

  // Only use useFeed for explore/following
  const feedType = feedTab === 'my-posts' ? 'explore' : feedTab
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } =
    useFeed(feedType)

  // User posts for "My Posts" tab
  const {
    data: userPostsData,
    fetchNextPage: fetchNextUserPosts,
    hasNextPage: hasNextUserPosts,
    isFetchingNextPage: isFetchingNextUserPosts,
    isLoading: isLoadingUserPosts,
  } = useUserPosts(feedTab === 'my-posts' ? user?.id : undefined)

  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!entries[0].isIntersecting) return
      if (feedTab === 'my-posts') {
        if (hasNextUserPosts && !isFetchingNextUserPosts) fetchNextUserPosts()
      } else {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
      }
    },
    [feedTab, fetchNextPage, hasNextPage, isFetchingNextPage, fetchNextUserPosts, hasNextUserPosts, isFetchingNextUserPosts]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 })
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [handleObserver])

  const posts =
    feedTab === 'my-posts'
      ? userPostsData?.pages.flatMap((p) => p.posts) || []
      : data?.pages.flatMap((p) => p.posts) || []

  const loading = feedTab === 'my-posts' ? isLoadingUserPosts : isLoading
  const loadingMore = feedTab === 'my-posts' ? isFetchingNextUserPosts : isFetchingNextPage

  const tabs: { value: FeedTab; label: string; icon: typeof Compass }[] = [
    { value: 'following', label: 'Following', icon: Users },
    { value: 'explore', label: 'Explore', icon: Compass },
    { value: 'my-posts', label: 'My Posts', icon: User },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 pb-20"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-black">Feed</h1>
        <button
          onClick={() => refetch()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Refresh feed"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </motion.div>

      {/* Tab Bar */}
      <motion.div variants={fadeInUp} className="flex gap-1.5 rounded-2xl bg-muted/50 p-1">
        {tabs.map((tab) => {
          const isActive = feedTab === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => setFeedTab(tab.value)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'text-coral-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="feed-tab-active"
                  className="absolute inset-0 rounded-xl bg-coral shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          )
        })}
      </motion.div>

      {/* Feed Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={feedTab}
          variants={tabContent}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card p-4 space-y-3 card-elevated">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-8 w-12 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                {feedTab === 'following' ? (
                  <Users className="h-8 w-8 text-muted-foreground/50" />
                ) : feedTab === 'my-posts' ? (
                  <User className="h-8 w-8 text-muted-foreground/50" />
                ) : (
                  <Compass className="h-8 w-8 text-muted-foreground/50" />
                )}
              </div>
              <p className="mt-5 font-display text-lg font-bold text-muted-foreground">
                {feedTab === 'following'
                  ? 'No posts from your people yet'
                  : feedTab === 'my-posts'
                  ? "You haven't posted yet"
                  : 'No posts to explore yet'}
              </p>
              <p className="mt-1.5 max-w-[240px] text-center font-body text-sm text-muted-foreground/70">
                {feedTab === 'following'
                  ? 'Follow some people to see their updates here.'
                  : feedTab === 'my-posts'
                  ? 'Share your first meal, workout, or milestone!'
                  : 'Be the first to share something with the community.'}
              </p>
              {feedTab !== 'following' && (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="mt-4 rounded-full bg-coral px-5 py-2 font-display text-sm font-bold text-coral-foreground shadow-sm transition-all hover:bg-coral/90 active:scale-95"
                >
                  Create your first post
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {posts.map((post) => (
                <motion.div key={post.id} variants={fadeInUp}>
                  <PostCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
      {loadingMore && (
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="h-1 w-1 rounded-full bg-coral animate-bounce [animation-delay:0ms]" />
          <div className="h-1 w-1 rounded-full bg-coral animate-bounce [animation-delay:150ms]" />
          <div className="h-1 w-1 rounded-full bg-coral animate-bounce [animation-delay:300ms]" />
        </div>
      )}

      {/* FAB */}
      <motion.button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-coral text-coral-foreground shadow-lg glow-coral transition-colors hover:bg-coral/90 md:bottom-8 md:right-8"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <CreatePostSheet open={createOpen} onOpenChange={setCreateOpen} />
    </motion.div>
  )
}
