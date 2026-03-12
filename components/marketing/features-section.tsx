'use client'

import { motion } from 'framer-motion'
import { Target, Users, Trophy } from 'lucide-react'
import { fadeInUp, staggerContainerSlow } from '@/lib/motion'

const pillars = [
  {
    icon: Target,
    accent: 'coral',
    iconBg: 'bg-coral/10 dark:bg-coral/15',
    iconColor: 'text-coral',
    borderHover: 'hover:border-coral/30',
    title: 'Smart Tracking',
    description: 'Log meals in seconds with our 1M+ food database',
    features: [
      'Barcode scanning for packaged foods',
      'Search 1M+ foods via USDA database',
      'Recipe builder for home cooking',
      'Beautiful macro dashboard',
    ],
    mockup: {
      items: [
        { name: 'Chicken Breast', cal: '165', pct: 85 },
        { name: 'Brown Rice', cal: '216', pct: 70 },
        { name: 'Broccoli', cal: '55', pct: 45 },
      ],
      color: '#FF4D6A',
    },
  },
  {
    icon: Users,
    accent: 'teal',
    iconBg: 'bg-teal/10 dark:bg-teal/15',
    iconColor: 'text-teal',
    borderHover: 'hover:border-teal/30',
    title: 'Social Accountability',
    description: 'Join groups that keep each other honest',
    features: [
      'Groups of 2\u20134 like-minded people',
      'Real-time group chat',
      'Auto celebrations for milestones',
      'Weekly stats and check-ins',
    ],
    mockup: {
      items: [
        { name: 'Sarah logged breakfast', time: '2m ago' },
        { name: 'Marcus hit his protein goal', time: '15m ago' },
        { name: 'Jenna completed 7-day streak', time: '1h ago' },
      ],
      color: '#4ECDC4',
    },
  },
  {
    icon: Trophy,
    accent: 'amber',
    iconBg: 'bg-amber/10 dark:bg-amber/15',
    iconColor: 'text-amber',
    borderHover: 'hover:border-amber/30',
    title: 'Gamified Progress',
    description: 'Level up, earn achievements, compete in challenges',
    features: [
      '27 unique achievements to unlock',
      'XP-based leveling system',
      'Community challenges',
      'Leaderboards and streaks',
    ],
    mockup: {
      items: [
        { name: 'First Week', icon: '🔥', xp: '+50 XP' },
        { name: 'Protein Master', icon: '💪', xp: '+100 XP' },
        { name: 'Social Butterfly', icon: '🦋', xp: '+75 XP' },
      ],
      color: '#F59E0B',
    },
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainerSlow}
          className="text-center"
        >
          <motion.p
            variants={fadeInUp}
            className="mb-3 text-sm font-semibold uppercase tracking-wider text-teal"
          >
            Everything You Need
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Three pillars of{' '}
            <span className="text-gradient-brand">lasting change</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
          >
            Smart tracking, real accountability, and meaningful gamification \u2014
            the trifecta that actually makes weight loss stick.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainerSlow}
          className="mt-16 grid gap-8 lg:grid-cols-3"
        >
          {pillars.map((p, idx) => (
            <motion.div
              key={p.title}
              variants={fadeInUp}
              className={`group relative rounded-2xl border border-border/50 bg-card/50 p-8 transition-all ${p.borderHover} hover:shadow-xl dark:bg-card/30 dark:hover:bg-card/50`}
            >
              {/* Icon */}
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${p.iconBg}`}>
                <p.icon className={`h-6 w-6 ${p.iconColor}`} />
              </div>

              <h3 className="font-display text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>

              {/* Feature list */}
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: p.mockup.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Mini Mockup */}
              <div className="mt-6 overflow-hidden rounded-xl border border-border/30 bg-muted/30 p-3 transition-transform group-hover:scale-[1.02] dark:bg-[#0D0D1A]/50">
                {idx === 0 && (
                  <div className="space-y-2">
                    {p.mockup.items.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[11px] font-medium text-foreground/80">{item.name}</p>
                          <div className="mt-1 h-1 w-full rounded-full bg-muted">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(item as { pct?: number }).pct || 0}%`, backgroundColor: p.mockup.color }}
                            />
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {(item as { cal?: string }).cal} cal
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {idx === 1 && (
                  <div className="space-y-2">
                    {p.mockup.items.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 rounded-lg bg-background/50 px-2 py-1.5">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.mockup.color }} />
                        <p className="flex-1 truncate text-[10px] text-foreground/70">{item.name}</p>
                        <span className="text-[9px] text-muted-foreground">{(item as { time?: string }).time}</span>
                      </div>
                    ))}
                  </div>
                )}
                {idx === 2 && (
                  <div className="space-y-2">
                    {p.mockup.items.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 rounded-lg bg-background/50 px-2 py-1.5">
                        <span className="text-sm">{(item as { icon?: string }).icon}</span>
                        <p className="flex-1 text-[10px] font-medium text-foreground/70">{item.name}</p>
                        <span className="font-mono text-[9px] font-semibold" style={{ color: p.mockup.color }}>
                          {(item as { xp?: string }).xp}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
