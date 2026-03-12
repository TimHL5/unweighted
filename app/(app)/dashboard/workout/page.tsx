'use client'

import { Dumbbell, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { scaleIn, fadeInUp, staggerContainer } from '@/lib/motion'

export default function WorkoutPage() {
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
          className="relative"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple/20">
            <Dumbbell className="h-10 w-10 text-blue-500" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber text-[10px] font-bold text-white shadow-sm">
            Soon
          </div>
        </motion.div>

        <motion.h1 variants={fadeInUp} className="mt-6 font-display text-2xl font-bold">
          Workouts
        </motion.h1>

        <motion.p variants={fadeInUp} className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Workout tracking is coming soon. You&apos;ll be able to log exercises,
          track sets and reps, and monitor your strength progress over time.
        </motion.p>

        <motion.div variants={fadeInUp}>
          <Button
            variant="outline"
            className="mt-6 gap-2 rounded-xl"
            onClick={() => {/* TODO: notify me */}}
          >
            <Bell className="h-4 w-4" />
            Notify Me
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
