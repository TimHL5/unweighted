'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChallenges, useJoinChallenge } from '@/lib/hooks/use-challenges'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Target, Users, Trophy, CheckCircle2, Clock, Flame, Zap } from 'lucide-react'
import { staggerContainer, fadeInUp, fadeIn } from '@/lib/motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ChallengeWithStatus } from '@/lib/types'

type TabType = 'active' | 'completed' | 'available'

export default function ChallengesPage() {
  const [tab, setTab] = useState<TabType>('active')
  const { data, isLoading } = useChallenges()
  const joinMutation = useJoinChallenge()

  const challenges = data?.challenges || []
  const activeChallenges = challenges.filter((c) => c.joined && !c.completed)
  const completedChallenges = challenges.filter((c) => c.completed)
  const availableChallenges = challenges.filter((c) => !c.joined && !c.completed)

  const displayed =
    tab === 'active'
      ? activeChallenges
      : tab === 'completed'
        ? completedChallenges
        : availableChallenges

  const tabs: { key: TabType; label: string; icon: typeof Target; count: number }[] = [
    { key: 'active', label: 'Active', icon: Flame, count: activeChallenges.length },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, count: completedChallenges.length },
    { key: 'available', label: 'Available', icon: Zap, count: availableChallenges.length },
  ]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6 pb-20"
    >
      <div>
        <h1 className="font-display text-2xl font-bold">Challenges</h1>
        <p className="text-sm text-muted-foreground">Compete with others and earn bonus XP</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
                tab === t.key
                  ? 'bg-coral text-white shadow-sm shadow-coral/20'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {t.count > 0 && (
                <span className={cn(
                  'ml-0.5 font-mono text-[10px]',
                  tab === t.key ? 'text-white/80' : 'text-muted-foreground/60'
                )}>
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <motion.div variants={fadeInUp}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Trophy className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="mt-4 font-display text-base font-bold">
                {tab === 'active'
                  ? 'No active challenges'
                  : tab === 'completed'
                    ? 'No completed challenges yet'
                    : 'No challenges available'}
              </p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                {tab === 'active'
                  ? 'Join a challenge to start competing!'
                  : tab === 'completed'
                    ? 'Complete challenges to earn XP and badges'
                    : 'Check back later for new challenges'}
              </p>
              {tab === 'active' && availableChallenges.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTab('available')}
                  className="mt-4"
                >
                  Browse Available
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {displayed.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={() => joinMutation.mutate(challenge.id)}
                isJoining={joinMutation.isPending}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

function ChallengeCard({
  challenge,
  onJoin,
  isJoining,
}: {
  challenge: ChallengeWithStatus
  onJoin: () => void
  isJoining: boolean
}) {
  const progressPercent =
    challenge.target_value > 0
      ? Math.min((challenge.current_progress / challenge.target_value) * 100, 100)
      : 0
  /* eslint-disable react-hooks/purity -- daysLeft requires current time */
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )
  /* eslint-enable react-hooks/purity */

  const isCompleted = challenge.completed
  const isJoined = challenge.joined

  return (
    <motion.div variants={fadeInUp} layout>
      <Link href={`/dashboard/challenges/${challenge.id}`}>
        <Card
          className={cn(
            'overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md',
            isCompleted && 'border-green/30 bg-green/5'
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              {/* Left: icon + info */}
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl',
                    isCompleted
                      ? 'bg-green/10'
                      : 'bg-gradient-to-br from-coral/10 to-purple/10'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green" />
                  ) : (
                    <Trophy className="h-5 w-5 text-coral" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-bold">{challenge.name}</h3>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {challenge.description}
                  </p>
                </div>
              </div>

              {/* Right: action */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <Badge className="bg-green/15 text-green border-green/20 text-[10px] font-semibold hover:bg-green/20">
                    <CheckCircle2 className="mr-0.5 h-3 w-3" />
                    Done
                  </Badge>
                ) : isJoined ? (
                  <Badge variant="secondary" className="text-[10px] font-semibold">
                    Joined
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      onJoin()
                    }}
                    disabled={isJoining}
                    className="h-7 bg-coral hover:bg-coral/90 text-white text-xs"
                  >
                    Join
                  </Button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {isJoined && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono font-bold">
                    {challenge.current_progress}
                    <span className="text-muted-foreground/60">/{challenge.target_value}</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      'h-full rounded-full',
                      isCompleted
                        ? 'bg-green'
                        : 'bg-gradient-to-r from-coral to-[#FF8A9E]'
                    )}
                  />
                </div>
              </div>
            )}

            {/* Meta row */}
            <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3 text-purple" />
                <span className="font-mono">{challenge.xp_reward}</span> XP
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="font-mono">{challenge.participant_count}</span>
              </span>
              {!isCompleted && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="font-mono">{daysLeft}</span>d left
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
