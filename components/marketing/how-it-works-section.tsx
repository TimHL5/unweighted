'use client'

import { motion } from 'framer-motion'
import { Target, Users, Sparkles } from 'lucide-react'
import { fadeInUp, staggerContainerSlow } from '@/lib/motion'

const steps = [
  {
    number: 1,
    icon: Target,
    iconColor: 'text-coral',
    iconBg: 'bg-coral/10 dark:bg-coral/15',
    ringColor: 'ring-coral/20',
    title: 'Set Your Goals',
    description:
      'Tell us about yourself and your goals. Our algorithm creates personalized calorie and macro targets tuned to your body.',
  },
  {
    number: 2,
    icon: Users,
    iconColor: 'text-teal',
    iconBg: 'bg-teal/10 dark:bg-teal/15',
    ringColor: 'ring-teal/20',
    title: 'Join Your Crew',
    description:
      'Create a group and invite friends, or get matched with like-minded people on the same journey. Accountability starts day one.',
  },
  {
    number: 3,
    icon: Sparkles,
    iconColor: 'text-purple',
    iconBg: 'bg-purple/10 dark:bg-purple/15',
    ringColor: 'ring-purple/20',
    title: 'Transform Together',
    description:
      'Track meals, earn achievements, climb leaderboards, and celebrate milestones with your crew. Progress becomes inevitable.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32">
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
            className="mb-3 text-sm font-semibold uppercase tracking-wider text-purple"
          >
            How It Works
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Get started in{' '}
            <span className="font-mono text-coral">3</span> minutes
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
          >
            No complicated setup. No long onboarding. Just start tracking.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainerSlow}
          className="relative mt-20"
        >
          {/* Connecting dotted line (desktop) */}
          <div className="absolute left-0 right-0 top-16 hidden h-px sm:block">
            <div className="mx-auto w-2/3 border-t-2 border-dashed border-border/60" />
          </div>

          {/* Vertical dotted line (mobile) */}
          <div className="absolute left-8 top-20 bottom-20 w-px border-l-2 border-dashed border-border/60 sm:hidden" />

          <div className="grid gap-12 sm:grid-cols-3 sm:gap-8">
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                className="relative flex gap-5 sm:flex-col sm:items-center sm:text-center"
              >
                {/* Step number circle */}
                <div className="relative z-10 shrink-0">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${step.iconBg} ring-4 ${step.ringColor} ring-offset-2 ring-offset-background`}>
                    <step.icon className={`h-7 w-7 ${step.iconColor}`} />
                  </div>
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                    <span className="font-mono text-xs font-bold">{step.number}</span>
                  </div>
                </div>

                <div className="pt-1 sm:pt-0">
                  <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
