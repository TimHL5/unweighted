'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/motion'

interface UpgradeBannerProps {
  message?: string
}

export function UpgradeBanner({
  message = 'Upgrade to Pro for the full experience',
}: UpgradeBannerProps) {
  const { profile } = useAuth()

  if (profile?.subscription_tier !== 'free') return null

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="overflow-hidden rounded-xl border border-coral/20 bg-gradient-to-r from-coral/10 via-purple/5 to-coral/10"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-coral/15">
          <Sparkles className="h-4 w-4 text-coral" />
        </div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <Button
          asChild
          size="sm"
          className="gap-1 bg-coral font-display text-xs font-semibold text-white shadow-sm shadow-coral/20 hover:bg-coral/90"
        >
          <Link href="/dashboard/settings/billing">
            Upgrade
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}
