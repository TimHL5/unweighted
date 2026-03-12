'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, Target, Dumbbell, TrendingDown, Scale, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { useCreateGroup } from '@/lib/hooks/use-groups'
import { cn } from '@/lib/utils'
import { fadeIn, fadeInUp, staggerContainer, scaleIn } from '@/lib/motion'
import Link from 'next/link'

const GOAL_TYPES = [
  { value: null, label: 'General', icon: Target, desc: 'Any fitness goal' },
  { value: 'lose', label: 'Lose Weight', icon: TrendingDown, desc: 'Fat loss focus' },
  { value: 'gain', label: 'Build Muscle', icon: Dumbbell, desc: 'Muscle gain focus' },
  { value: 'maintain', label: 'Maintain', icon: Scale, desc: 'Stay on track' },
] as const

export default function NewGroupPage() {
  const createGroup = useCreateGroup()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [goalType, setGoalType] = useState<string | null>(null)
  const [maxMembers, setMaxMembers] = useState(4)
  const [created, setCreated] = useState<{ id: string; invite_code: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return

    try {
      const result = await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        goal_type: goalType,
        max_members: maxMembers,
      })
      setCreated(result.group)
    } catch {
      // Error handled by mutation
    }
  }

  const copyCode = async () => {
    if (!created) return
    await navigator.clipboard.writeText(created.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyLink = async () => {
    if (!created) return
    await navigator.clipboard.writeText(`${window.location.origin}/join/${created.invite_code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── Success State ───
  if (created) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mx-auto max-w-md space-y-6 py-8"
      >
        <motion.div variants={fadeInUp} className="text-center">
          <motion.div
            variants={scaleIn}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green/10"
          >
            <Check className="h-8 w-8 text-green" />
          </motion.div>
          <h1 className="mt-4 font-display text-2xl font-bold">Group Created!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Share the invite code with your friends to get started
          </p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Invite Code
              </p>
              <p className="font-mono text-4xl font-bold tracking-[0.3em] text-coral">
                {created.invite_code}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyCode} className="gap-1.5">
                  {copied ? <Check className="h-3.5 w-3.5 text-green" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Code
                </Button>
                <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Button
            asChild
            className="w-full bg-coral hover:bg-coral/90 text-white"
            size="lg"
          >
            <Link href={`/dashboard/groups/${created.id}`}>Go to Group</Link>
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  // ─── Create Form ───
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="mx-auto max-w-md space-y-6 pb-20"
    >
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/groups">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Link>
      </Button>

      <div>
        <h1 className="font-display text-2xl font-bold">Create Group</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start an accountability group with friends
        </p>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
        {/* Name */}
        <motion.div variants={fadeInUp}>
          <label className="mb-1.5 block text-sm font-medium">Group Name *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning Accountability"
            maxLength={100}
            className="text-base"
          />
        </motion.div>

        {/* Description */}
        <motion.div variants={fadeInUp}>
          <label className="mb-1.5 block text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this group about?"
            maxLength={500}
            rows={3}
            className="resize-none"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            <span className="font-mono">{description.length}</span>/500
          </p>
        </motion.div>

        {/* Goal type selector */}
        <motion.div variants={fadeInUp}>
          <label className="mb-2 block text-sm font-medium">Goal Type</label>
          <div className="grid grid-cols-2 gap-2">
            {GOAL_TYPES.map((gt) => {
              const Icon = gt.icon
              const isSelected = goalType === gt.value
              return (
                <button
                  key={gt.label}
                  type="button"
                  onClick={() => setGoalType(gt.value)}
                  className={cn(
                    'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all',
                    isSelected
                      ? 'border-coral bg-coral/5 shadow-sm shadow-coral/10'
                      : 'border-border hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isSelected ? 'text-coral' : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        isSelected ? 'text-coral' : ''
                      )}
                    >
                      {gt.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{gt.desc}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Max members slider */}
        <motion.div variants={fadeInUp}>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium">Max Members</label>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-sm font-bold">{maxMembers}</span>
            </div>
          </div>
          <Slider
            value={[maxMembers]}
            onValueChange={([v]) => setMaxMembers(v)}
            min={2}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
            <span className="font-mono">2</span>
            <span className="font-mono">10</span>
          </div>
        </motion.div>

        {/* Create button */}
        <motion.div variants={fadeInUp}>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || createGroup.isPending}
            className="w-full bg-coral hover:bg-coral/90 text-white"
            size="lg"
          >
            {createGroup.isPending ? 'Creating...' : 'Create Group'}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
