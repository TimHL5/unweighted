'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/providers/auth-provider'
import { useCheckout } from '@/lib/hooks/use-billing'
import { PLANS, TIER_RANK, type PlanTier } from '@/lib/stripe/config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/motion'

export function PricingTable() {
  const { profile } = useAuth()
  const checkout = useCheckout()
  const [yearly, setYearly] = useState(false)
  const currentTier = (profile?.subscription_tier || 'free') as PlanTier

  const handleUpgrade = (tier: PlanTier, interval: 'monthly' | 'yearly') => {
    checkout.mutate({ tier, interval })
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Billing toggle */}
      <motion.div variants={fadeInUp} className="flex items-center justify-center gap-1">
        <div className="flex rounded-full bg-muted p-1">
          <button
            onClick={() => setYearly(false)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              !yearly
                ? 'bg-card font-semibold text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              yearly
                ? 'bg-card font-semibold text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
          </button>
        </div>
        {yearly && (
          <Badge className="ml-2 bg-green/10 font-mono text-[10px] text-green">
            -33%
          </Badge>
        )}
      </motion.div>

      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan, i) => {
          const isCurrentPlan = currentTier === plan.tier
          const isHigherTier = TIER_RANK[plan.tier] > TIER_RANK[currentTier]
          const isPopular = plan.tier === 'pro'
          const price = plan.prices
            ? yearly
              ? plan.prices.yearlyAmount
              : plan.prices.monthlyAmount
            : 0
          const displayPrice = price / 100
          const monthlyEquivalent = yearly && plan.prices
            ? (plan.prices.yearlyAmount / 12 / 100).toFixed(2)
            : null

          return (
            <motion.div key={plan.tier} variants={fadeInUp} custom={i}>
              <Card
                className={`relative overflow-hidden transition-all ${
                  isPopular
                    ? 'border-coral shadow-lg shadow-coral/10 ring-1 ring-coral/20'
                    : 'card-elevated'
                }`}
              >
                {isPopular && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-coral via-purple to-coral" />
                )}
                {isPopular && (
                  <Badge className="absolute -top-0 right-4 rounded-b-lg rounded-t-none bg-coral px-3 py-1 font-display text-[10px] font-semibold text-white shadow-sm">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-3">
                    {plan.prices ? (
                      <>
                        <span className="font-display text-4xl font-bold">
                          ${yearly ? monthlyEquivalent : displayPrice.toFixed(2)}
                        </span>
                        <span className="ml-1 text-sm text-muted-foreground">/mo</span>
                        {yearly && (
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            ${(plan.prices.yearlyAmount / 100).toFixed(2)} billed yearly
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="font-display text-4xl font-bold">$0</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green/10">
                          <Check className="h-3 w-3 text-green" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrentPlan ? (
                    <Button disabled className="w-full rounded-xl font-display" variant="outline">
                      Current Plan
                    </Button>
                  ) : isHigherTier && plan.prices ? (
                    <Button
                      className={`w-full rounded-xl font-display font-semibold ${
                        isPopular
                          ? 'bg-coral text-white shadow-lg shadow-coral/20 hover:bg-coral/90'
                          : 'bg-foreground text-background hover:bg-foreground/90'
                      }`}
                      onClick={() =>
                        handleUpgrade(plan.tier, yearly ? 'yearly' : 'monthly')
                      }
                      disabled={checkout.isPending}
                    >
                      {checkout.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Upgrade to {plan.name}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
