'use client'

import { use } from 'react'
import Link from 'next/link'
import { useChallengeDetail, useJoinChallenge } from '@/lib/hooks/use-challenges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Target, Users, Clock, Loader2, Trophy, Sparkles } from 'lucide-react'
import { getInitials } from '@/lib/utils/helpers'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/motion'

const medals = ['🥇', '🥈', '🥉']

export default function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, isLoading } = useChallengeDetail(id)
  const joinMutation = useJoinChallenge()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (!data?.challenge) {
    return (
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center py-16 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Trophy className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="mt-4 font-display font-semibold">Challenge not found</p>
        <Link href="/dashboard/challenges">
          <Button variant="ghost" className="mt-4 text-coral">Back to Challenges</Button>
        </Link>
      </motion.div>
    )
  }

  const { challenge, leaderboard, user_participation, total_participants } = data
  // eslint-disable-next-line react-hooks/purity -- computing days remaining requires current time
  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  const progressPercent = user_participation
    ? Math.min((user_participation.current_progress / challenge.target_value) * 100, 100)
    : 0

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <Link href="/dashboard/challenges">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">{challenge.name}</h1>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </div>
      </motion.div>

      {/* Challenge Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-3">
        {[
          { icon: Target, label: 'XP Reward', value: challenge.xp_reward, color: 'text-coral' },
          { icon: Users, label: 'Participants', value: total_participants, color: 'text-teal' },
          { icon: Clock, label: 'Days Left', value: daysLeft, color: 'text-amber' },
        ].map((stat) => (
          <Card key={stat.label} className="card-elevated">
            <CardContent className="flex flex-col items-center py-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="mt-2 font-mono text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* User Progress */}
      {user_participation ? (
        <motion.div variants={fadeInUp}>
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {user_participation.completed ? 'Completed!' : 'In Progress'}
                </span>
                <span className="font-mono font-semibold">
                  {user_participation.current_progress} / {challenge.target_value}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={`h-full rounded-full ${
                    user_participation.completed
                      ? 'bg-gradient-to-r from-green to-teal'
                      : 'bg-gradient-to-r from-coral to-purple'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
              {user_participation.completed && (
                <Badge className="bg-green/10 text-green">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Challenge Complete!
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={scaleIn}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral/10">
                <Target className="h-7 w-7 text-coral" />
              </div>
              <p className="mt-4 font-display font-semibold">Ready to join?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                You haven&apos;t joined this challenge yet
              </p>
              <Button
                onClick={() => joinMutation.mutate(id)}
                disabled={joinMutation.isPending}
                className="mt-4 gap-1.5 bg-coral font-display font-semibold text-white shadow-lg shadow-coral/20 hover:bg-coral/90"
              >
                {joinMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
                Join Challenge
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Leaderboard */}
      <motion.div variants={fadeInUp}>
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <Trophy className="h-4 w-4 text-amber" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No participants yet. Be the first!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => {
                  const pct = challenge.target_value > 0
                    ? Math.min((entry.current_progress / challenge.target_value) * 100, 100)
                    : 0

                  return (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        entry.rank <= 3 ? 'bg-muted/50' : 'hover:bg-muted/30'
                      }`}
                    >
                      <span className="w-8 text-center font-mono text-sm font-bold">
                        {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
                      </span>
                      <Avatar className="h-8 w-8 ring-2 ring-background">
                        <AvatarImage src={entry.avatar_url || undefined} />
                        <AvatarFallback className="bg-coral/10 font-display text-[10px] font-semibold text-coral">
                          {getInitials(entry.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-display text-sm font-medium">{entry.display_name}</p>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              entry.completed
                                ? 'bg-gradient-to-r from-green to-teal'
                                : 'bg-gradient-to-r from-coral to-purple'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {entry.current_progress}/{challenge.target_value}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
