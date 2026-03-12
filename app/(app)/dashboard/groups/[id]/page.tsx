'use client'

import { use, useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Copy, Check, Send, Loader2,
  LogOut, Trash2, Paperclip, Crown, MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { ChatMessage } from '@/components/groups/chat-message'
import { useGroup, useGroupStats, useLeaveGroup, useDeleteGroup } from '@/lib/hooks/use-groups'
import { useGroupMessages, useSendMessage, useGroupChatRealtime } from '@/lib/hooks/use-group-chat'
import { useAuth } from '@/lib/providers/auth-provider'
import { getInitials } from '@/lib/utils/helpers'
import { fadeIn, fadeInUp, staggerContainer } from '@/lib/motion'
import Link from 'next/link'

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { data, isLoading } = useGroup(id)
  const { data: statsData } = useGroupStats(id)
  const messagesQuery = useGroupMessages(id)
  const sendMessage = useSendMessage(id)
  const leaveGroup = useLeaveGroup()
  const deleteGroup = useDeleteGroup()

  useGroupChatRealtime(id)

  const [messageInput, setMessageInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const topSentinelRef = useRef<HTMLDivElement>(null)

  const group = data?.group
  const isAdmin = data?.user_role === 'admin'
  const members = group?.members || []

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  // Get all messages reversed (oldest first)
  const allMessages = messagesQuery.data?.pages.flatMap((p) => p.messages).reverse() || []

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom()
    }
  }, [allMessages.length, scrollToBottom])

  // Initial scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [messagesQuery.isSuccess, scrollToBottom])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50
  }

  // IntersectionObserver for loading older messages
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = messagesQuery
  useEffect(() => {
    if (!topSentinelRef.current || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          const scrollContainer = scrollRef.current
          const prevScrollHeight = scrollContainer?.scrollHeight || 0

          fetchNextPage().then(() => {
            requestAnimationFrame(() => {
              if (scrollContainer) {
                const newScrollHeight = scrollContainer.scrollHeight
                scrollContainer.scrollTop = newScrollHeight - prevScrollHeight
              }
            })
          })
        }
      },
      { root: scrollRef.current, threshold: 0.1 }
    )

    observer.observe(topSentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleSend = () => {
    const content = messageInput.trim()
    if (!content) return

    setMessageInput('')
    sendMessage.mutate({ content })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyInviteCode = async () => {
    if (!group?.invite_code) return
    await navigator.clipboard.writeText(group.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeave = async () => {
    await leaveGroup.mutateAsync(id)
    router.push('/dashboard/groups')
  }

  const handleDelete = async () => {
    await deleteGroup.mutateAsync(id)
    router.push('/dashboard/groups')
  }

  // Sort stats members by food_logs_this_week for leaderboard
  const sortedMembers = [...(statsData?.members || [])].sort(
    (a, b) => b.food_logs_this_week - a.food_logs_this_week
  )

  if (isLoading) {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <Skeleton className="h-10 w-48 rounded-2xl" />
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (!group) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Group not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/groups">Back to Groups</Link>
        </Button>
      </div>
    )
  }

  const podiumColors = ['text-amber-400', 'text-zinc-400', 'text-amber-600']
  const podiumBg = [
    'bg-amber-500/10 border-amber-500/20',
    'bg-zinc-500/10 border-zinc-500/20',
    'bg-amber-700/10 border-amber-700/20',
  ]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="flex h-[calc(100vh-8rem)] flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 pb-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
          <Link href="/dashboard/groups">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {group.avatar_url ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={group.avatar_url} />
                <AvatarFallback className="bg-coral/10 text-coral text-xs font-bold">
                  {getInitials(group.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-coral/15 to-purple/15">
                <span className="font-display text-xs font-bold text-coral">
                  {getInitials(group.name)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate font-display text-base font-bold">{group.name}</h1>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-mono">{members.length}</span> member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyInviteCode}
          className="h-8 gap-1.5 text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Invite
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="chat" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-0 mt-2 w-full bg-muted/50">
          <TabsTrigger value="chat" className="flex-1 font-medium">Chat</TabsTrigger>
          <TabsTrigger value="members" className="flex-1 font-medium">Members</TabsTrigger>
          <TabsTrigger value="stats" className="flex-1 font-medium">Stats</TabsTrigger>
        </TabsList>

        {/* ─── Chat Tab ─── */}
        <TabsContent value="chat" className="flex min-h-0 flex-1 flex-col">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="scrollbar-thin flex-1 overflow-y-auto px-2 py-2"
          >
            {/* Top sentinel for infinite scroll */}
            <div ref={topSentinelRef} className="h-1" />
            {messagesQuery.isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {allMessages.length === 0 && !messagesQuery.isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Send className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No messages yet
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Be the first to say hello!
                </p>
              </div>
            )}

            {allMessages.map((msg, i) => {
              const prevMsg = i > 0 ? allMessages[i - 1] : null
              const showAvatar =
                !prevMsg ||
                prevMsg.user_id !== msg.user_id ||
                prevMsg.message_type === 'system' ||
                prevMsg.message_type === 'celebration'

              return (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isOwn={msg.user_id === user?.id}
                  showAvatar={showAvatar}
                />
              )
            })}
          </div>

          {/* Message input bar */}
          <div className="flex items-center gap-2 border-t border-border/50 bg-background/80 px-3 py-3 backdrop-blur-sm">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-full border-border/50 bg-muted/50 px-4"
              maxLength={2000}
            />
            <Button
              onClick={handleSend}
              disabled={!messageInput.trim() || sendMessage.isPending}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full bg-coral hover:bg-coral/90 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* ─── Members Tab ─── */}
        <TabsContent value="members" className="flex-1 overflow-y-auto scrollbar-thin">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-2 py-3"
          >
            {/* Invite code card */}
            <motion.div variants={fadeInUp}>
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Invite Code</p>
                    <p className="font-mono text-lg font-bold tracking-[0.15em]">
                      {group.invite_code}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyInviteCode} className="gap-1.5">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Members list */}
            <div className="mt-3 space-y-1">
              <p className="px-1 text-xs font-medium text-muted-foreground">
                <span className="font-mono">{members.length}</span> Members
              </p>
              {members.map((member) => {
                const profile = member.profile as {
                  id: string
                  display_name: string
                  avatar_url: string | null
                }
                const memberStats = statsData?.members?.find(
                  (m) => m.user_id === member.user_id
                )

                return (
                  <motion.div
                    key={member.user_id}
                    variants={fadeInUp}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-border/30">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-xs font-medium">
                        {getInitials(profile?.display_name || '?')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {profile?.display_name}
                        </p>
                        {member.role === 'admin' && (
                          <Badge className="gap-0.5 bg-coral/15 px-1.5 py-0 text-[10px] font-semibold text-coral hover:bg-coral/20">
                            <Crown className="h-2.5 w-2.5" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      {memberStats && (
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            <span className="font-mono">{memberStats.current_streak}</span> day streak
                          </span>
                          <span>
                            <span className="font-mono">{memberStats.food_logs_this_week}</span> meals this week
                          </span>
                        </div>
                      )}
                    </div>
                    {isAdmin && member.user_id !== user?.id && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2 border-t pt-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setLeaveOpen(true)}
              >
                <LogOut className="h-4 w-4" />
                Leave Group
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Group
                </Button>
              )}
            </div>
          </motion.div>
        </TabsContent>

        {/* ─── Stats Tab ─── */}
        <TabsContent value="stats" className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-4 py-3">
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Weekly Leaderboard
              </h2>
              <p className="text-xs text-muted-foreground/60">Ranked by meals logged this week</p>
            </div>

            {!statsData ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : sortedMembers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">No stats yet this week</p>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                {sortedMembers.map((member, index) => {
                  const rank = index + 1
                  const isTopThree = rank <= 3

                  return (
                    <motion.div
                      key={member.user_id}
                      variants={fadeInUp}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                        isTopThree ? podiumBg[index] : 'border-border/50'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
                        {rank === 1 ? (
                          <span className="text-lg">🥇</span>
                        ) : rank === 2 ? (
                          <span className="text-lg">🥈</span>
                        ) : rank === 3 ? (
                          <span className="text-lg">🥉</span>
                        ) : (
                          <span className="font-mono text-sm font-bold text-muted-foreground">
                            #{rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted text-xs font-medium">
                          {getInitials(member.display_name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name + stats */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{member.display_name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-mono">{member.current_streak}d</span> streak
                          <span className="font-mono">{member.xp_total.toLocaleString()}</span> XP
                        </div>
                      </div>

                      {/* Meal count */}
                      <div className="text-right">
                        <p className={`font-mono text-lg font-bold ${isTopThree ? podiumColors[index] : ''}`}>
                          {member.food_logs_this_week}
                        </p>
                        <p className="text-[10px] text-muted-foreground">meals</p>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Leave confirmation */}
      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Leave Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave &ldquo;{group.name}&rdquo;? You&apos;ll need a new invite code to rejoin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={leaveGroup.isPending}
            >
              {leaveGroup.isPending ? 'Leaving...' : 'Leave'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{group.name}&rdquo;? This action cannot be undone and all messages will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteGroup.isPending}
            >
              {deleteGroup.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
