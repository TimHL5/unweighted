'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/providers/auth-provider'
import { useUserProfile, useUpdateProfile } from '@/lib/hooks/use-social'
import { UserListSheet } from '@/components/social/user-list-sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUpload } from '@/components/shared/image-upload'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { getInitials } from '@/lib/utils/helpers'
import { getXPForLevel } from '@/lib/utils/xp'
import {
  Pencil, Flame, Loader2, ChevronRight, UtensilsCrossed,
  Dumbbell, Scale, Droplets, SmilePlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { fadeIn, fadeInUp, staggerContainer, scaleIn } from '@/lib/motion'
import { cn } from '@/lib/utils'

const streakIcons: Record<string, { icon: typeof Flame; color: string }> = {
  food_log: { icon: UtensilsCrossed, color: 'text-coral' },
  workout: { icon: Dumbbell, color: 'text-purple' },
  weigh_in: { icon: Scale, color: 'text-green' },
  water: { icon: Droplets, color: 'text-water' },
  check_in: { icon: SmilePlus, color: 'text-amber' },
}

export default function OwnProfilePage() {
  const { user } = useAuth()
  const { data: profileData, isLoading } = useUserProfile(user?.id)

  const [editOpen, setEditOpen] = useState(false)
  const [followListType, setFollowListType] = useState<'followers' | 'following' | null>(null)

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
        <div className="flex gap-6">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    )
  }

  const { profile, followers_count, following_count, post_count, xp, streaks, achievements, posts } = profileData
  const level = xp?.current_level || 1
  const totalXP = xp?.total_xp || 0
  const currentLevelXP = getXPForLevel(level)
  const nextLevelXP = getXPForLevel(level + 1)
  const xpProgress = nextLevelXP > currentLevelXP
    ? ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 100

  // Show latest 6 achievements
  const displayAchievements = achievements.slice(0, 6)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6 pb-20"
    >
      {/* Header with avatar */}
      <motion.div variants={fadeInUp} className="flex items-start gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24 ring-4 ring-coral/20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-coral/15 to-purple/15 font-display text-2xl font-bold text-coral">
              {getInitials(profile.display_name || 'U')}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-coral text-white shadow-sm transition-transform hover:scale-110"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 space-y-1 pt-1">
          <h1 className="font-display text-xl font-bold">{profile.display_name}</h1>
          {profile.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-2 gap-1.5 text-xs"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3 w-3" />
            Edit Profile
          </Button>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={fadeInUp} className="flex gap-0">
        {[
          { label: 'Posts', value: post_count, onClick: undefined },
          { label: 'Followers', value: followers_count, onClick: () => setFollowListType('followers') },
          { label: 'Following', value: following_count, onClick: () => setFollowListType('following') },
        ].map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={stat.onClick}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors',
              stat.onClick && 'hover:bg-muted/50 rounded-lg'
            )}
          >
            <p className="font-mono text-lg font-bold">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
          </button>
        ))}
      </motion.div>

      {/* Level / XP */}
      <motion.div variants={fadeInUp}>
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Badge className="bg-gradient-to-r from-coral to-purple text-white border-0 px-2.5 py-0.5 text-xs font-bold">
                  Level {level}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  {totalXP.toLocaleString()} XP
                </span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                {nextLevelXP - totalXP} to Lvl {level + 1}
              </span>
            </div>
            <Progress value={xpProgress} className="mt-2.5 h-2.5" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Streaks row */}
      {streaks.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-2">
          <h2 className="font-display text-sm font-bold">Streaks</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {streaks.map((streak) => {
              const config = streakIcons[streak.streak_type] || { icon: Flame, color: 'text-orange-500' }
              const Icon = config.icon
              const isActive = streak.current_count > 0

              return (
                <motion.div
                  key={streak.id}
                  variants={scaleIn}
                  className={cn(
                    'flex flex-shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all',
                    isActive ? 'border-border bg-card' : 'border-border/50 opacity-50'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? config.color : 'text-muted-foreground')} />
                  <div>
                    <p className="font-mono text-sm font-bold">
                      {streak.current_count}
                      <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">days</span>
                    </p>
                    <p className="text-[10px] capitalize text-muted-foreground">
                      {streak.streak_type.replace('_', ' ')}
                    </p>
                  </div>
                  {isActive && streak.current_count >= 7 && (
                    <Flame className="h-3 w-3 animate-fire-pulse text-amber" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Achievements showcase */}
      {displayAchievements.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold">Achievements</h2>
            <Link
              href="/dashboard/achievements"
              className="flex items-center gap-0.5 text-xs text-coral hover:underline"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 gap-2 sm:grid-cols-6"
          >
            {displayAchievements.map((ua) => (
              <motion.div
                key={ua.achievement_id}
                variants={scaleIn}
                className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
              >
                <span className="text-2xl">{ua.achievement?.icon || '🏆'}</span>
                <p className="text-center text-[10px] font-medium leading-tight line-clamp-2">
                  {ua.achievement?.name}
                </p>
                <Badge variant="secondary" className="text-[8px] px-1.5 py-0 capitalize">
                  {ua.achievement?.rarity}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Posts Grid */}
      <motion.div variants={fadeInUp} className="space-y-2">
        <h2 className="font-display text-sm font-bold">Posts</h2>
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
            <p className="text-sm text-muted-foreground">No posts yet</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/dashboard/feed">Share your first post</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/dashboard/feed/${post.id}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
              >
                {post.media_urls && post.media_urls.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.media_urls[0]}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-2.5">
                    <p className="line-clamp-4 text-center text-[10px] text-muted-foreground">
                      {post.content}
                    </p>
                  </div>
                )}
                {/* Hover overlay with stats */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-3 text-xs font-medium text-white">
                    <span>❤️ <span className="font-mono">{post.like_count}</span></span>
                    <span>💬 <span className="font-mono">{post.comment_count}</span></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit Profile Sheet */}
      <EditProfileSheet open={editOpen} onOpenChange={setEditOpen} profile={profile} />

      {/* Follow List Sheet */}
      {followListType && user && (
        <UserListSheet
          open={!!followListType}
          onOpenChange={() => setFollowListType(null)}
          userId={user.id}
          type={followListType}
        />
      )}
    </motion.div>
  )
}

function EditProfileSheet({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: { display_name: string; bio: string | null; avatar_url: string | null }
}) {
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const updateProfile = useUpdateProfile()

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      })
      toast.success('Profile updated!')
      onOpenChange(false)
    } catch {
      toast.error('Failed to update profile')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="font-display">Edit Profile</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Avatar</label>
            <div className="mt-2 flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-border/30">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-coral/10 font-display text-xl text-coral">
                  {getInitials(displayName || 'U')}
                </AvatarFallback>
              </Avatar>
              <ImageUpload
                bucket="avatars"
                folder="avatars"
                onUploadComplete={(url) => setAvatarUrl(url)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Tell us about yourself..."
              className="resize-none"
            />
            <span className="text-xs text-muted-foreground">
              <span className="font-mono">{bio.length}</span>/500
            </span>
          </div>

          <Button
            onClick={handleSave}
            disabled={!displayName.trim() || updateProfile.isPending}
            className="w-full bg-coral hover:bg-coral/90 text-white"
            size="lg"
          >
            {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
