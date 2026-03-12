'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/providers/auth-provider'
import { useBillingStatus, usePortal } from '@/lib/hooks/use-billing'
import { PricingTable } from '@/components/billing/pricing-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink, Loader2, CreditCard, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/motion'

const tierNames: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  premium: 'Premium',
}

const tierColors: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-coral/10 text-coral',
  premium: 'bg-purple/10 text-purple',
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  )
}

function BillingContent() {
  const searchParams = useSearchParams()
  const { profile } = useAuth()
  const { data: billing, isLoading } = useBillingStatus()
  const portal = usePortal()

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated! Welcome to your new plan.')
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout canceled. No changes were made.')
    }
  }, [searchParams])

  const tier = billing?.tier || profile?.subscription_tier || 'free'
  const isPaid = tier !== 'free'

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20"
    >
      <motion.h1 variants={fadeInUp} className="font-display text-2xl font-bold">
        Billing & Subscription
      </motion.h1>

      {/* Current Plan */}
      <motion.div variants={fadeInUp}>
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="font-display text-lg">Current Plan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl font-bold">
                    {tierNames[tier] || tier}
                  </span>
                  {billing?.status && (
                    <Badge className={tierColors[tier] || tierColors.free}>
                      {isPaid && <Sparkles className="mr-1 h-3 w-3" />}
                      {billing.status}
                    </Badge>
                  )}
                </div>

                {billing?.subscription && (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-mono font-semibold text-foreground">
                        {billing.subscription.plan_amount
                          ? `$${(billing.subscription.plan_amount / 100).toFixed(2)}`
                          : ''}
                      </span>{' '}
                      / {billing.subscription.plan_interval}
                    </p>
                    <p>
                      Next billing:{' '}
                      <span className="font-mono">
                        {new Date(
                          billing.subscription.current_period_end * 1000
                        ).toLocaleDateString()}
                      </span>
                    </p>
                    {billing.subscription.cancel_at_period_end && (
                      <p className="font-medium text-destructive">
                        Cancels at end of current period
                      </p>
                    )}
                  </div>
                )}

                {isPaid && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => portal.mutate()}
                    disabled={portal.isPending}
                  >
                    {portal.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    Manage Subscription
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pricing Table */}
      <motion.div variants={fadeInUp}>
        <PricingTable />
      </motion.div>
    </motion.div>
  )
}
