'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { fadeInUp, staggerContainerSlow } from '@/lib/motion'

const testimonials = [
  {
    quote:
      "I've tried every calorie tracker out there. Unweighted is the first one I've stuck with past two weeks \u2014 because my group actually notices when I miss a day.",
    name: 'Sarah K.',
    detail: 'Lost 15 lbs in 8 weeks',
    avatar: { bg: 'bg-coral', initials: 'SK' },
    accentBorder: 'border-l-coral',
    stars: 5,
  },
  {
    quote:
      "The accountability group is a game changer. It's like having a built-in support system that keeps you honest without being preachy.",
    name: 'Marcus T.',
    detail: 'Lost 22 lbs in 12 weeks',
    avatar: { bg: 'bg-teal', initials: 'MT' },
    accentBorder: 'border-l-teal',
    stars: 5,
  },
  {
    quote:
      'I love the achievements and streaks. It turns something boring into something I actually look forward to. Plus my group celebrates every milestone with me.',
    name: 'Jenna R.',
    detail: 'Lost 12 lbs in 6 weeks',
    avatar: { bg: 'bg-purple', initials: 'JR' },
    accentBorder: 'border-l-purple',
    stars: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="relative py-24 lg:py-32">
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
            className="mb-3 text-sm font-semibold uppercase tracking-wider text-green"
          >
            Real Stories
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            What our members say
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
          >
            Real feedback from people on the same journey.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainerSlow}
          className="mt-16 grid gap-6 sm:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeInUp}
              className={`relative rounded-2xl border border-border/50 border-l-4 ${t.accentBorder} bg-card/50 p-6 backdrop-blur-sm dark:bg-card/30`}
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber text-amber" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${t.avatar.bg} text-xs font-bold text-white`}
                >
                  {t.avatar.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{t.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-10 text-center text-xs text-muted-foreground"
        >
          * Beta testimonials. Individual results may vary.
        </motion.p>
      </div>
    </section>
  )
}
