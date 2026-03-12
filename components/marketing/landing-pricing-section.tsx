'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PLANS } from '@/lib/stripe/config'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowRight } from 'lucide-react'
import { fadeInUp, staggerContainerSlow } from '@/lib/motion'

export function LandingPricingSection() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainerSlow}
          className="text-center"
        >
          <motion.p
            variants={fadeInUp}
            className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber"
          >
            Pricing
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
          >
            Start free. Upgrade when you&apos;re ready. No hidden fees.
          </motion.p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <button
            onClick={() => setYearly(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              !yearly ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              yearly ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            {yearly && (
              <span className="absolute -right-2 -top-2 rounded-full bg-green px-1.5 py-0.5 text-[10px] font-bold text-white">
                -33%
              </span>
            )}
          </button>
        </motion.div>

        {/* Plan Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainerSlow}
          className="mt-12 grid gap-6 sm:grid-cols-3"
        >
          {PLANS.map((plan) => {
            const isPopular = plan.tier === 'pro'
            const price = plan.prices
              ? yearly
                ? plan.prices.yearlyAmount
                : plan.prices.monthlyAmount
              : 0
            const displayPrice = price / 100
            const monthlyEquivalent =
              yearly && plan.prices
                ? (plan.prices.yearlyAmount / 12 / 100).toFixed(2)
                : null

            return (
              <motion.div
                key={plan.tier}
                variants={fadeInUp}
                className={`relative rounded-2xl border p-8 transition-all ${
                  isPopular
                    ? 'border-coral/50 bg-card shadow-xl shadow-coral/5 dark:border-coral/30 dark:bg-card/80'
                    : 'border-border/50 bg-card/50 dark:bg-card/30'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-coral text-coral-foreground shadow-lg shadow-coral/25 hover:bg-coral px-3 py-1 text-xs font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.prices ? (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold">
                          ${yearly ? monthlyEquivalent : displayPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                      {yearly && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-mono">${(plan.prices.yearlyAmount / 100).toFixed(2)}</span> billed yearly
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold">$0</span>
                      <span className="text-sm text-muted-foreground">forever</span>
                    </div>
                  )}
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="block">
                  <Button
                    className={`w-full font-semibold ${
                      isPopular
                        ? 'bg-coral text-coral-foreground shadow-lg shadow-coral/25 hover:bg-coral/90'
                        : ''
                    }`}
                    variant={isPopular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.tier === 'free' ? 'Get Started Free' : `Start ${plan.name} Trial`}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          No hidden fees. Cancel anytime. All plans include a 14-day free trial.
        </motion.p>
      </div>
    </section>
  )
}
