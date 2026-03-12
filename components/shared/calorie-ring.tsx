'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface CalorieRingProps {
  consumed: number
  target: number
  size?: number
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0)
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 80, damping: 25 })

  useEffect(() => {
    motionVal.set(value)
  }, [value, motionVal])

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      setDisplay(Math.round(v))
    })
    return unsubscribe
  }, [spring])

  return <span className={className}>{display.toLocaleString()}</span>
}

export function CalorieRing({ consumed, target, size = 220 }: CalorieRingProps) {
  const pct = target > 0 ? consumed / target : 0
  const clampedPct = Math.min(pct, 1.25)
  const isOver = pct > 1
  const isAtGoal = pct >= 0.98 && pct <= 1.02

  const strokeWidth = size * 0.065
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  const remaining = target - consumed
  const gradientId = `calorie-gradient-${size}`
  const glowId = `calorie-glow-${size}`
  const bgGlowId = `calorie-bg-glow-${size}`

  // Determine gradient stops based on progress
  const getGradientStops = () => {
    if (pct <= 0.5) {
      return { start: '#4ECDC4', mid: '#3B82F6', end: '#3B82F6' }
    }
    if (pct <= 0.8) {
      return { start: '#4ECDC4', mid: '#3B82F6', end: '#A855F7' }
    }
    if (pct <= 1.0) {
      return { start: '#4ECDC4', mid: '#3B82F6', end: '#FF4D6A' }
    }
    return { start: '#FF4D6A', mid: '#EF4444', end: '#DC2626' }
  }

  const colors = getGradientStops()

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          {/* Gradient for the progress stroke */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="50%" stopColor={colors.mid} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>

          {/* Glow filter on progress end */}
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={isOver ? 6 : 3}
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle background glow */}
          <filter id={bgGlowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
        </defs>

        {/* Ambient glow behind the ring */}
        {pct > 0.1 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={isOver ? '#FF4D6A' : '#4ECDC4'}
            strokeWidth={strokeWidth * 2.5}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clampedPct)}
            opacity={0.08}
            filter={`url(#${bgGlowId})`}
          />
        )}

        {/* Background track ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
          strokeLinecap="round"
        />

        {/* Subtle tick marks at 25%, 50%, 75% */}
        {[0.25, 0.5, 0.75].map((tick) => {
          const angle = tick * 2 * Math.PI - Math.PI / 2
          const innerR = radius - strokeWidth * 0.8
          const outerR = radius + strokeWidth * 0.8
          return (
            <line
              key={tick}
              x1={center + innerR * Math.cos(angle + Math.PI / 2)}
              y1={center + innerR * Math.sin(angle + Math.PI / 2)}
              x2={center + outerR * Math.cos(angle + Math.PI / 2)}
              y2={center + outerR * Math.sin(angle + Math.PI / 2)}
              stroke="currentColor"
              strokeWidth={1}
              className="text-muted-foreground/15"
            />
          )
        })}

        {/* Progress ring with gradient */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter={`url(#${glowId})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference * (1 - clampedPct),
          }}
          transition={{
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </svg>

      {/* Center content */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          ...(isAtGoal ? { scale: [1, 1.02, 1] } : {}),
        }}
        transition={{
          duration: 0.6,
          delay: 0.3,
          ...(isAtGoal
            ? { scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }
            : {}),
        }}
      >
        <AnimatedNumber
          value={consumed}
          className="font-mono text-4xl font-bold tracking-tight"
        />
        <span className="mt-0.5 text-xs font-body text-muted-foreground">
          of {target.toLocaleString()} cal
        </span>
        <motion.span
          className={`mt-1 font-mono text-sm font-semibold ${
            remaining >= 0
              ? 'text-green'
              : 'text-coral'
          }`}
          initial={{ opacity: 0, y: 4 }}
          animate={{
            opacity: 1,
            y: 0,
            ...(isOver ? { x: [0, -2, 2, -2, 0] } : {}),
          }}
          transition={{
            delay: 0.8,
            duration: 0.4,
            ...(isOver ? { x: { duration: 0.4, delay: 1.5 } } : {}),
          }}
        >
          {remaining >= 0
            ? `${Math.round(remaining).toLocaleString()} left`
            : `${Math.round(Math.abs(remaining)).toLocaleString()} over`}
        </motion.span>
      </motion.div>
    </div>
  )
}
