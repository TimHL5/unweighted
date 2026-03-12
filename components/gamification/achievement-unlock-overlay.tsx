'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Share2 } from 'lucide-react'
import { achievementPopIn, fadeIn } from '@/lib/motion'

interface AchievementUnlockOverlayProps {
  name: string
  icon: string
  xp: number
  rarity: string
  onDismiss: () => void
}

const rarityConfig: Record<string, { bg: string; glow: string; label: string }> = {
  common: {
    bg: 'bg-zinc-500',
    glow: '',
    label: 'Common',
  },
  uncommon: {
    bg: 'bg-green-500',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
    label: 'Uncommon',
  },
  rare: {
    bg: 'bg-blue-500',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
    label: 'Rare',
  },
  epic: {
    bg: 'bg-purple-500',
    glow: 'shadow-[0_0_40px_rgba(168,85,247,0.4)]',
    label: 'Epic',
  },
  legendary: {
    bg: 'bg-amber-500',
    glow: 'shadow-[0_0_50px_rgba(245,158,11,0.5)]',
    label: 'Legendary',
  },
}

// Pre-computed confetti data (module-level to avoid impure calls during render)
const CONFETTI_DATA = Array.from({ length: 24 }, () => ({
  distance: 80 + Math.random() * 120,
  size: 4 + Math.random() * 6,
  delay: Math.random() * 0.3,
  rotate: Math.random() * 720 - 360,
  duration: 1.2 + Math.random() * 0.6,
}))

// Confetti piece component — random values passed as props to keep render pure
function ConfettiPiece({
  index,
  total,
  distance,
  size,
  delay,
  rotate,
  duration,
}: {
  index: number
  total: number
  distance: number
  size: number
  delay: number
  rotate: number
  duration: number
}) {
  const angle = (index / total) * 360
  const colors = ['#FF4D6A', '#4ECDC4', '#F59E0B', '#A855F7', '#3B82F6', '#22C55E']
  const color = colors[index % colors.length]

  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance + 100,
        opacity: 0,
        scale: 0.5,
        rotate,
      }}
      transition={{
        duration,
        delay: 0.2 + delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="absolute left-1/2 top-1/2 rounded-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    />
  )
}

export function AchievementUnlockOverlay({
  name,
  icon,
  xp,
  rarity,
  onDismiss,
}: AchievementUnlockOverlayProps) {
  const [showName, setShowName] = useState(false)
  const [showXP, setShowXP] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [mounted, setMounted] = useState(false)

  const config = rarityConfig[rarity] || rarityConfig.common

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Achievement Unlocked!',
          text: `I just unlocked "${name}" on Unweighted! ${icon}`,
        })
      } catch {
        // User cancelled or share failed
      }
    }
    onDismiss()
  }, [name, icon, onDismiss])

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    const nameTimer = setTimeout(() => setShowName(true), 300)
    const xpTimer = setTimeout(() => setShowXP(true), 500)
    const buttonTimer = setTimeout(() => setShowButtons(true), 800)
    const autoDismiss = setTimeout(onDismiss, 4000)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(nameTimer)
      clearTimeout(xpTimer)
      clearTimeout(buttonTimer)
      clearTimeout(autoDismiss)
    }
  }, [onDismiss])

  const confettiPieces = CONFETTI_DATA.map((p, i) => (
    <ConfettiPiece key={i} index={i} total={24} {...p} />
  ))

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget && showButtons) onDismiss()
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Content container */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Confetti burst */}
          <div className="pointer-events-none absolute inset-0">
            {confettiPieces}
          </div>

          {/* Achievement badge */}
          <motion.div
            variants={achievementPopIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-card to-card/80 ${config.glow}`}
          >
            {/* Pulsing ring behind badge */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className={`absolute inset-0 rounded-3xl border-2 ${
                rarity === 'legendary'
                  ? 'border-amber-400'
                  : rarity === 'epic'
                    ? 'border-purple-400'
                    : rarity === 'rare'
                      ? 'border-blue-400'
                      : 'border-border'
              }`}
            />
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="text-5xl"
            >
              {icon}
            </motion.span>
          </motion.div>

          {/* "Achievement Unlocked!" label */}
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate={showName ? 'visible' : 'hidden'}
            className="mt-5 font-display text-xs font-bold uppercase tracking-[0.2em] text-amber"
          >
            Achievement Unlocked!
          </motion.p>

          {/* Achievement name */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={showName ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 text-center font-display text-2xl font-bold text-white"
          >
            {name}
          </motion.h2>

          {/* Rarity badge + XP */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={showXP ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 flex items-center gap-3"
          >
            <Badge
              variant="outline"
              className={`${config.bg} border-0 text-xs font-semibold text-white`}
            >
              {config.label}
            </Badge>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={showXP ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-mono text-sm font-bold text-purple"
            >
              +{xp} XP
            </motion.span>
          </motion.div>

          {/* Action buttons */}
          <AnimatePresence>
            {showButtons && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 flex gap-3"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Share2 className="mr-1.5 h-3.5 w-3.5" />
                  Share
                </Button>
                <Button
                  onClick={onDismiss}
                  size="sm"
                  className="bg-coral hover:bg-coral/90 text-white"
                >
                  Awesome!
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
