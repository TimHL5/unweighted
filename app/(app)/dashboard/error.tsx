'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { scaleIn, fadeInUp, staggerContainer } from '@/lib/motion'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex max-w-sm flex-col items-center text-center"
      >
        <motion.div
          variants={scaleIn}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10"
        >
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </motion.div>

        <motion.h2
          variants={fadeInUp}
          className="mt-5 font-display text-xl font-bold"
        >
          Something went wrong
        </motion.h2>

        <motion.p
          variants={fadeInUp}
          className="mt-2 text-sm text-muted-foreground"
        >
          {process.env.NODE_ENV === 'development'
            ? error.message
            : 'An unexpected error occurred. Please try again.'}
        </motion.p>

        <motion.div variants={fadeInUp}>
          <Button
            onClick={reset}
            className="mt-6 gap-2 bg-coral font-display font-semibold text-white hover:bg-coral/90"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
