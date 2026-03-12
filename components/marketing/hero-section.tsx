'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/motion'

const avatars = [
  { bg: 'bg-coral', initials: 'SK' },
  { bg: 'bg-teal', initials: 'MT' },
  { bg: 'bg-purple', initials: 'JR' },
  { bg: 'bg-amber', initials: 'AL' },
  { bg: 'bg-green', initials: 'DW' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-coral/8 blur-[100px]" />
        <div className="absolute right-1/4 top-1/3 h-[600px] w-[600px] rounded-full bg-purple/6 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/2 h-[400px] w-[400px] rounded-full bg-teal/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-4 py-20 md:items-center md:py-28 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-32">
        {/* Left: Copy */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-coral/20 bg-coral/5 px-4 py-1.5 text-sm font-medium text-coral dark:border-coral/30 dark:bg-coral/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
              </span>
              Track. Share. Transform.
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="text-foreground">Stop Tracking</span>
            <br />
            <span className="text-foreground">Alone.</span>{' '}
            <span className="text-gradient-brand">Start Losing Together.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-lg font-body text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            The only calorie tracker built around accountability groups.
            Track food, stay motivated, and transform with people who get it.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="w-full bg-coral px-8 text-base font-semibold text-coral-foreground shadow-lg shadow-coral/25 hover:bg-coral/90 hover:shadow-xl hover:shadow-coral/30 transition-all sm:w-auto"
              >
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-border/50 px-8 text-base font-medium hover:bg-muted/50 sm:w-auto"
              >
                See How It Works
              </Button>
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {avatars.map((a, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-background ${a.bg} text-[10px] font-bold text-white`}
                >
                  {a.initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Join <span className="font-mono font-semibold text-foreground">12,000+</span> members losing weight together
            </p>
          </motion.div>
        </motion.div>

        {/* Right: Phone Mockup */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="hidden justify-center lg:flex"
        >
          <div className="relative">
            {/* Glow behind phone */}
            <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-coral/20 via-purple/10 to-teal/10 blur-3xl" />

            {/* Phone */}
            <div className="animate-float relative w-[280px] rounded-[3rem] border border-white/10 bg-[#0D0D1A] p-3 shadow-2xl dark:border-white/5">
              {/* Notch */}
              <div className="absolute left-1/2 top-3 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

              {/* Screen */}
              <div className="relative overflow-hidden rounded-[2.3rem] bg-[#121225] p-5 pt-10">
                {/* Status bar */}
                <div className="mb-4 flex items-center justify-between text-[9px] text-white/40">
                  <span className="font-mono">9:41</span>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-3 rounded-sm bg-white/30" />
                    <div className="h-1.5 w-1.5 rounded-sm bg-white/30" />
                  </div>
                </div>

                {/* Greeting */}
                <div className="mb-4">
                  <p className="text-[10px] text-white/50">Good morning</p>
                  <p className="text-sm font-semibold text-white">Sarah K.</p>
                </div>

                {/* Calorie Ring */}
                <div className="mx-auto mb-5 flex h-32 w-32 items-center justify-center">
                  <svg viewBox="0 0 120 120" className="h-full w-full">
                    {/* Track */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="10"
                    />
                    {/* Progress */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="url(#coralGrad)"
                      strokeWidth="10"
                      strokeDasharray="236 314"
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      className="drop-shadow-[0_0_6px_rgba(255,77,106,0.4)]"
                    />
                    <defs>
                      <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF4D6A" />
                        <stop offset="100%" stopColor="#A855F7" />
                      </linearGradient>
                    </defs>
                    <text
                      x="60"
                      y="54"
                      textAnchor="middle"
                      fill="white"
                      fontSize="18"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      1,480
                    </text>
                    <text
                      x="60"
                      y="70"
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.4)"
                      fontSize="9"
                    >
                      of 2,100 cal
                    </text>
                  </svg>
                </div>

                {/* Macro Bars */}
                <div className="mb-5 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Protein', val: '98g', pct: 72, color: '#4ECDC4' },
                    { label: 'Carbs', val: '142g', pct: 58, color: '#3B82F6' },
                    { label: 'Fat', val: '48g', pct: 65, color: '#F59E0B' },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <p className="text-[8px] text-white/40">{m.label}</p>
                      <p className="font-mono text-[11px] font-semibold text-white">{m.val}</p>
                      <div className="mx-auto mt-1 h-1 w-full rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Meals */}
                <div className="space-y-1.5">
                  {[
                    { name: 'Oatmeal & berries', cal: 340, icon: '🥣' },
                    { name: 'Grilled chicken salad', cal: 520, icon: '🥗' },
                    { name: 'Greek yogurt parfait', cal: 220, icon: '🫐' },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2"
                    >
                      <span className="text-sm">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[10px] font-medium text-white/80">{item.name}</p>
                      </div>
                      <span className="font-mono text-[10px] text-white/40">{item.cal}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-4 flex justify-around pt-3 border-t border-white/5">
                  {['Home', 'Log', 'Group', 'You'].map((tab, i) => (
                    <div key={tab} className="flex flex-col items-center gap-0.5">
                      <div className={`h-1 w-1 rounded-full ${i === 0 ? 'bg-coral' : 'bg-transparent'}`} />
                      <span className={`text-[8px] ${i === 0 ? 'text-coral font-medium' : 'text-white/30'}`}>
                        {tab}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  )
}
