import type { Variants } from 'framer-motion'

// Shared easing curves
export const easings = {
  smooth: [0.22, 1, 0.36, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  snappy: [0.25, 0.46, 0.45, 0.94] as const,
}

// Page / section entrance
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easings.smooth },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: easings.smooth },
  },
}

// Container that staggers children
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

// Card / widget entrance
export const scaleIn: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

export const slideInRight: Variants = {
  hidden: { x: 30, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: easings.smooth },
  },
}

export const slideInLeft: Variants = {
  hidden: { x: -30, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: easings.smooth },
  },
}

// For the floating action button radial expand
export const radialMenuVariants: Variants = {
  closed: {
    scale: 0,
    opacity: 0,
    transition: { type: 'spring', stiffness: 400, damping: 28 },
  },
  open: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 22 },
  },
}

// Achievement unlock
export const achievementPopIn: Variants = {
  hidden: { scale: 0.3, opacity: 0, rotate: -10 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 15,
      delay: 0.1,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.3, ease: easings.smooth },
  },
}

// Like heart animation
export const heartPop: Variants = {
  idle: { scale: 1 },
  liked: {
    scale: [1, 1.3, 0.9, 1.1, 1],
    transition: { duration: 0.4, ease: easings.bounce },
  },
}

// Number counter animation hook helper
export const counterSpring = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
}

// Page transitions for AnimatePresence
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easings.smooth },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: easings.snappy },
  },
}

// Tab content switch
export const tabContent: Variants = {
  initial: { opacity: 0, x: 10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: easings.smooth },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.15 },
  },
}
