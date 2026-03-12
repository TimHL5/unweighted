'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Loader2, Sparkles, ShieldAlert, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/providers/auth-provider'
import { useGroupLookup, useJoinGroup } from '@/lib/hooks/use-groups'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { scaleIn } from '@/lib/motion'

export default function JoinGroupPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { data, isLoading, error } = useGroupLookup(user ? code : null)
  const joinGroup = useJoinGroup()
  const [joinError, setJoinError] = useState<string | null>(null)

  const group = data?.group

  const handleJoin = async () => {
    if (!group) return
    setJoinError(null)

    try {
      await joinGroup.mutateAsync({ groupId: group.id, invite_code: code })
      router.push(`/dashboard/groups/${group.id}`)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join group')
    }
  }

  // Not authenticated
  if (!authLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh-light p-4 dark:bg-mesh-dark">
        <motion.div variants={scaleIn} initial="hidden" animate="visible">
          <Card className="card-elevated w-full max-w-sm">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-coral/20 to-purple/20">
                <Users className="h-8 w-8 text-coral" />
              </div>
              <h1 className="font-display text-xl font-bold">You&apos;ve been invited!</h1>
              <p className="text-sm text-muted-foreground">
                Log in or sign up to join this accountability group.
              </p>
              <div className="flex w-full gap-2">
                <Button asChild variant="outline" className="flex-1 rounded-xl font-display">
                  <Link href={`/login?redirect=/join/${code}`}>Log In</Link>
                </Button>
                <Button asChild className="flex-1 rounded-xl bg-coral font-display font-semibold text-white shadow-sm shadow-coral/20 hover:bg-coral/90">
                  <Link href={`/signup?redirect=/join/${code}`}>Sign Up</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Loading
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    )
  }

  // Group not found / invalid code
  if (error || !group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh-light p-4 dark:bg-mesh-dark">
        <motion.div variants={scaleIn} initial="hidden" animate="visible">
          <Card className="card-elevated w-full max-w-sm">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="font-display text-xl font-bold">Invalid Invite</h1>
              <p className="text-sm text-muted-foreground">
                This invite code is invalid or the group no longer exists.
              </p>
              <Button asChild variant="outline" className="rounded-xl font-display">
                <Link href="/dashboard/groups">Go to Groups</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Already a member
  if (group.is_already_member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh-light p-4 dark:bg-mesh-dark">
        <motion.div variants={scaleIn} initial="hidden" animate="visible">
          <Card className="card-elevated w-full max-w-sm">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green/10">
                <UserCheck className="h-8 w-8 text-green" />
              </div>
              <h1 className="font-display text-xl font-bold">Already a Member</h1>
              <p className="text-sm text-muted-foreground">
                You&apos;re already in &ldquo;{group.name}&rdquo;.
              </p>
              <Button asChild className="rounded-xl bg-coral font-display font-semibold text-white shadow-sm shadow-coral/20 hover:bg-coral/90">
                <Link href={`/dashboard/groups/${group.id}`}>Go to Group</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Group full
  if (group.is_full) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh-light p-4 dark:bg-mesh-dark">
        <motion.div variants={scaleIn} initial="hidden" animate="visible">
          <Card className="card-elevated w-full max-w-sm">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber/10">
                <Users className="h-8 w-8 text-amber" />
              </div>
              <h1 className="font-display text-xl font-bold">Group is Full</h1>
              <p className="text-sm text-muted-foreground">
                &ldquo;{group.name}&rdquo; has reached its maximum of {group.max_members} members.
              </p>
              <Button asChild variant="outline" className="rounded-xl font-display">
                <Link href="/dashboard/groups">Go to Groups</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Show join card
  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh-light p-4 dark:bg-mesh-dark">
      <motion.div variants={scaleIn} initial="hidden" animate="visible">
        <Card className="card-elevated w-full max-w-sm">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-coral/20 to-purple/20">
              <Users className="h-8 w-8 text-coral" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">{group.name}</h1>
              {group.description && (
                <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
              )}
            </div>
            <Badge variant="secondary" className="gap-1 font-mono">
              <Users className="h-3 w-3" />
              {group.member_count}/{group.max_members} members
            </Badge>

            {joinError && (
              <p className="text-sm text-destructive">{joinError}</p>
            )}

            <Button
              onClick={handleJoin}
              disabled={joinGroup.isPending}
              className="w-full gap-2 rounded-xl bg-coral font-display font-semibold text-white shadow-lg shadow-coral/20 hover:bg-coral/90"
            >
              {joinGroup.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Join Group
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
