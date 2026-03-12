'use client'

import { motion } from 'framer-motion'
import { UserX, BatteryLow, RefreshCw } from 'lucide-react'
import { fadeInUp, staggerContainerSlow } from '@/lib/motion'

const problems = [
  {
    icon: UserX,
    iconColor: 'text-coral',
    iconBg: 'bg-coral/10 dark:bg-coral/15',
    title: 'Tracking feels lonely',
    description:
      'Calorie counting in isolation is boring and unsustainable. Without anyone noticing, skipping a day turns into skipping a week.',
  },
  {
    icon: BatteryLow,
    iconColor: 'text-amber',
    iconBg: 'bg-amber/10 dark:bg-amber/15',
    title: 'Motivation fades after week 2',
    description:
      'Most apps are just databases. No motivation, no community, no reason to open the app after the novelty wears off.',
  },
  {
    icon: RefreshCw,
    iconColor: 'text-purple',
    iconBg: 'bg-purple/10 dark:bg-purple/15',
    title: "Generic apps don't understand you",
    description:
      'Every January, every Monday \u2014 a fresh start that leads to the same result. The cycle continues because the approach never changes.',
  },
]

export function ProblemSection() {
  return (
    <section className="relative py-24 lg:py-32">
      {/* Subtle top divider */}
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
            className="mb-3 text-sm font-semibold uppercase tracking-wider text-coral"
          >
            Sound familiar?
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Why most dieters{' '}
            <span className="text-gradient-coral">give up</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
          >
            The problem isn&apos;t willpower. It&apos;s the approach.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainerSlow}
          className="mt-16 grid gap-6 sm:grid-cols-3"
        >
          {problems.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeInUp}
              className="group relative rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-border hover:shadow-lg dark:bg-card/30 dark:hover:bg-card/50"
            >
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${p.iconBg}`}
              >
                <p.icon className={`h-6 w-6 ${p.iconColor}`} />
              </div>
              <h3 className="font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stat callout */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 rounded-2xl border border-coral/20 bg-coral/5 px-6 py-4 dark:border-coral/15 dark:bg-coral/10">
            <span className="font-mono text-3xl font-bold text-coral">73%</span>
            <p className="text-left text-sm text-muted-foreground">
              of dieters quit within
              <br />
              <span className="font-medium text-foreground">the first 2 weeks</span>
            </p>
          </div>
          <p className="mt-6 text-base text-muted-foreground">
            Unweighted breaks this cycle with a simple idea:{' '}
            <span className="font-medium text-foreground">
              you&apos;re more likely to stick with it when someone&apos;s counting on you.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
