'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Background mesh */}
      <div className="fixed inset-0 bg-mesh-dark dark:bg-mesh-dark" />
      <div className="fixed inset-0 bg-mesh-light dark:hidden" />

      {/* Decorative gradient orbs */}
      <div className="pointer-events-none fixed left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-coral/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-purple/5 blur-[100px]" />

      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-coral to-coral/80 shadow-lg shadow-coral/20">
            <span className="font-display text-lg font-extrabold text-white">U</span>
          </div>
          <span className="font-display text-2xl font-bold text-foreground">
            Unweighted
          </span>
        </Link>

        {children}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
