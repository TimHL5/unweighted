'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/providers/auth-provider'
import { useUserProfile, useFollow, useUnfollow } from '@/lib/hooks/use-social'
import { UserListSheet } from '@/components/social/user-list-sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getInitials } from '@/lib/utils/helpers'
import { getXPForLevel } from '@/lib/utils/xp'
import { Flame, Loader2, UserPlus, UserCheck, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/motion'

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const { data: profileData, isLoading } = useUserProfile(id)
  const follow = useFollow()
  const unfollow = useUnfollow()

  const [followListType, setFollowListType] = useState<'followers' | 'following' | null>(null)

  // Redirect to own profile
  useEffect(() => {
    if (user && id === user.id) {
      router.replace('/dashboard/profile')
    }
  }, [user, id, router])

  if (user && id === user.id) return null

  if (isLoading || !profileData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    )
  }

  const { profile, followers_count, following_count, post_count, is_following, xp, streaks, achievements, posts } = profileData
  const level = xp?.current_level || 1
  const totalXP = xp?.total_xp || 0
  const currentLevelXP = getXPForLevel(level)
  const nextLevelXP = getXPForLevel(level + 1)
  const xpProgress = nextLevelXP > currentLevelXP
    ? ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 100

  const handleFollowToggle = () => {
    if (is_following) {
      unfollow.mutate(id)
    } else {
      follow.mutate(id)
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-start gap-4">
        <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-coral/20 to-purple/20 font-display text-xl font-bold text-coral">
            {getInitials(profile.display_name || 'U')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <h1 className="font-display text-xl font-bold">{profile.display_name}</h1>
          {profile.bio && <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}
          <Button
            variant={is_following ? 'outline' : 'default'}
            size="sm"
            className={`mt-2 gap-1.5 rounded-lg font-display ${
              !is_following
                ? 'bg-coral text-white shadow-sm shadow-coral/20 hover:bg-coral/90'
                : ''
            }`}
            onClick={handleFollowToggle}
            disabled={follow.isPending || unfollow.isPending}
          >
            {follow.isPending || unfollow.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : is_following ? (
              <UserCheck className="h-3.5 w-3.5" />
            ) : (
              <UserPlus className="h-3.5 w-3.5" />
            )}
            {is_following ? 'Following' : 'Follow'}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="flex gap-6">
        {[
          { label: 'Posts', value: post_count, onClick: undefined },
          { label: 'Followers', value: followers_count, onClick: () => setFollowListType('followers') },
          { label: 'Following', value: following_count, onClick: () => setFollowListType('following') },
        ].map((stat) => (
          <button
            key={stat.label}
            className="text-center transition-opacity hover:opacity-70"
            onClick={stat.onClick}
            disabled={!stat.onClick}
          >
            <p className="font-mono text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </button>
        ))}
      </motion.div>

      {/* Level / XP */}
      <motion.div variants={fadeInUp}>
        <Card className="card-elevated overflow-hidden">
          <CardContent className="space-y-3 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-purple to-coral font-display text-white shadow-sm">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Level {level}
                </Badge>
                <span className="font-mono text-sm text-muted-foreground">{totalXP} XP</span>
              </div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple to-coral"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streaks */}
      {streaks.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <h2 className="font-display text-sm font-bold">Streaks</h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {streaks.map((streak) => (
              <Card key={streak.id} className="card-elevated flex-shrink-0">
                <CardContent className="flex items-center gap-2.5 px-3.5 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold">{streak.current_count} days</p>
                    <p className="text-[10px] capitalize text-muted-foreground">
                      {streak.streak_type.replace('_', ' ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <h2 className="font-display text-sm font-bold">Achievements</h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {achievements.map((ua) => (
              <Card key={ua.achievement_id} className="card-elevated flex-shrink-0">
                <CardContent className="flex items-center gap-2.5 px-3.5 py-2.5">
                  <span className="text-xl">{ua.achievement?.icon || '🏆'}</span>
                  <div>
                    <p className="font-display text-xs font-semibold">{ua.achievement?.name}</p>
                    <p className="text-[10px] capitalize text-muted-foreground">{ua.achievement?.rarity}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Posts Grid */}
      <motion.div variants={fadeInUp} className="space-y-3">
        <h2 className="font-display text-sm font-bold">Posts</h2>
        {posts.length === 0 ? (
          <motion.div variants={scaleIn} className="flex flex-col items-center py-10 text-center">
            <p className="text-sm text-muted-foreground">No posts yet</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/dashboard/feed/${post.id}`}
                className="group aspect-square overflow-hidden rounded-xl bg-muted transition-transform hover:scale-[1.02]"
              >
                {post.media_urls && post.media_urls.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.media_urls[0]}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-2">
                    <p className="text-[10px] text-muted-foreground line-clamp-4 text-center">
                      {post.content}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Follow List Sheet */}
      {followListType && (
        <UserListSheet
          open={!!followListType}
          onOpenChange={() => setFollowListType(null)}
          userId={id}
          type={followListType}
        />
      )}
    </motion.div>
  )
}
