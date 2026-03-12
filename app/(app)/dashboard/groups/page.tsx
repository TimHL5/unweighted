'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Plus, LogIn, Search, Globe } from 'lucide-react'
import { UpgradeBanner } from '@/components/billing/upgrade-banner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { GroupCard } from '@/components/groups/group-card'
import { useGroups } from '@/lib/hooks/use-groups'
import { staggerContainer, fadeInUp, fadeIn } from '@/lib/motion'
import Link from 'next/link'

export default function GroupsPage() {
  const router = useRouter()
  const { data, isLoading } = useGroups()
  const [joinCode, setJoinCode] = useState('')
  const [joinOpen, setJoinOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const groups = data?.groups || []
  const filteredGroups = searchQuery
    ? groups.filter(
        (g) =>
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groups

  const handleJoin = () => {
    const code = joinCode.trim()
    if (code.length === 6) {
      setJoinOpen(false)
      router.push(`/join/${code}`)
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6 pb-20"
    >
      <UpgradeBanner message="Upgrade to Pro for accountability groups" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">My Groups</h1>
          {groups.length > 0 && (
            <p className="text-sm text-muted-foreground">
              <span className="font-mono">{groups.length}</span> group{groups.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-coral/30 text-coral hover:bg-coral/10 hover:text-coral"
        >
          <Link href="/dashboard/groups/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Group
          </Link>
        </Button>
      </div>

      {/* Search */}
      {groups.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Group list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredGroups.length === 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Search className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            No groups matching &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : groups.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-coral/10 to-purple/10">
            <Users className="h-10 w-10 text-coral/60" />
          </div>
          <h2 className="mt-6 font-display text-xl font-bold">No groups yet</h2>
          <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
            Create a group to start tracking progress with friends, or join one with an invite code.
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setJoinOpen(true)}
            >
              <LogIn className="mr-1.5 h-4 w-4" />
              Join Group
            </Button>
            <Button asChild className="bg-coral hover:bg-coral/90 text-white">
              <Link href="/dashboard/groups/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Create Group
              </Link>
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </motion.div>
      )}

      {/* Join a Group section */}
      {groups.length > 0 && (
        <motion.div variants={fadeInUp}>
          <div className="rounded-2xl border-2 border-dashed border-border/60 p-6 text-center">
            <h3 className="font-display text-base font-bold">Join a group</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter an invite code to join an existing group
            </p>
            <div className="mx-auto mt-4 flex max-w-xs gap-2">
              <Input
                placeholder="6-char code"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="text-center font-mono text-lg tracking-widest"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              <Button
                onClick={handleJoin}
                disabled={joinCode.trim().length !== 6}
                className="bg-coral hover:bg-coral/90 text-white"
              >
                Join
              </Button>
            </div>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Globe className="h-3 w-3" />
              Browse public groups
            </button>
          </div>
        </motion.div>
      )}

      {/* Join Sheet (for empty state) */}
      <Sheet open={joinOpen} onOpenChange={setJoinOpen}>
        <SheetTrigger asChild>
          <span />
        </SheetTrigger>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display">Join a Group</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Invite Code</label>
              <Input
                placeholder="Enter 6-character code"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono tracking-widest"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>
            <Button
              onClick={handleJoin}
              disabled={joinCode.trim().length !== 6}
              className="w-full bg-coral hover:bg-coral/90 text-white"
            >
              Join Group
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}
