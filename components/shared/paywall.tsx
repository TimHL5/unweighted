'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/providers/auth-provider'
import { canAccess, getRequiredTier, type GatedFeature } from '@/lib/utils/subscription'
import type { PlanTier } from '@/lib/stripe/config'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Sparkles, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { scaleIn } from '@/lib/motion'

interface PaywallProps {
  feature: GatedFeature
  children: React.ReactNode
}

const tierNames: Record<PlanTier, string> = {
  free: 'Free',
  pro: 'Pro',
  premium: 'Premium',
}

export function Paywall({ feature, children }: PaywallProps) {
  const { profile } = useAuth()
  const userTier = (profile?.subscription_tier || 'free') as PlanTier

  if (canAccess(userTier, feature)) {
    return <>{children}</>
  }

  const requiredTier = getRequiredTier(feature)

  return (
    <motion.div variants={scaleIn} initial="hidden" animate="visible">
      <Card className="border-dashed border-coral/20 bg-gradient-to-b from-card to-coral/5">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral/10">
              <Lock className="h-7 w-7 text-coral" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-coral shadow-sm shadow-coral/30">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          <h3 className="mt-5 font-display text-lg font-bold">
            {tierNames[requiredTier]} Feature
          </h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Upgrade to {tierNames[requiredTier]} to unlock this feature and supercharge your journey
          </p>
          <Button
            asChild
            className="mt-5 gap-2 bg-coral font-display font-semibold text-white shadow-lg shadow-coral/20 hover:bg-coral/90"
          >
            <Link href="/dashboard/settings/billing">
              Upgrade Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
