'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainerSlow } from '@/lib/motion'

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-coral/8 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-purple/6 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainerSlow}
          className="text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-coral/10 dark:bg-coral/15"
          >
            <span className="text-3xl">🚀</span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Ready to ditch{' '}
            <span className="text-gradient-coral">solo dieting</span>?
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground"
          >
            Stop tracking alone. Join a community that actually keeps you accountable
            \u2014 and makes the journey fun.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-8">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-coral px-10 text-base font-semibold text-coral-foreground shadow-lg shadow-coral/25 hover:bg-coral/90 hover:shadow-xl hover:shadow-coral/30 transition-all"
              >
                Start Free Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            className="mt-4 text-sm text-muted-foreground"
          >
            Free forever. No credit card needed.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
