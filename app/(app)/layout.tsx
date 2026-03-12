'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/providers/auth-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getInitials, getGreeting } from '@/lib/utils/helpers'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Globe,
  Users,
  Trophy,
  Settings,
  LogOut,
  User,
  Flame,
  Sun,
  Moon as MoonIcon,
  Plus,
  X,
  Droplets,
  Scale,
  Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '@/lib/motion'
import { NotificationBell } from '@/components/shared/notification-bell'
import { GamificationListener } from '@/components/gamification/gamification-listener'
import { LevelProgress } from '@/components/gamification/level-progress'
import { useStreaks } from '@/lib/hooks/use-dashboard'
import { useTheme } from 'next-themes'

// ---------- Nav Definitions ----------
const sidebarPrimaryItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/food', icon: UtensilsCrossed, label: 'Food Log' },
  { href: '/dashboard/feed', icon: Globe, label: 'Feed' },
  { href: '/dashboard/groups', icon: Users, label: 'Groups' },
]

const sidebarSecondaryItems = [
  { href: '/dashboard/achievements', icon: Trophy, label: 'Achievements' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

const mobileNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/food', icon: UtensilsCrossed, label: 'Food' },
  // Center FAB is injected separately
  { href: '/dashboard/feed', icon: Globe, label: 'Feed' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
]

const fabActions = [
  { href: '/dashboard/food/search?meal=breakfast', icon: UtensilsCrossed, label: 'Log Food', color: '#FF4D6A' },
  { href: '/dashboard/food?water=1', icon: Droplets, label: 'Log Water', color: '#38BDF8' },
  { href: '/dashboard/progress', icon: Scale, label: 'Log Weight', color: '#F59E0B' },
  { href: '/dashboard/food/search?quick=1', icon: Zap, label: 'Quick Add', color: '#A855F7' },
]

// ---------- Theme Toggle ----------
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- standard hydration pattern
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />

  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9 overflow-hidden"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {isDark ? <MoonIcon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </motion.div>
    </Button>
  )
}

// ---------- Streak Badge (header) ----------
function StreakBadge({ count }: { count: number }) {
  const active = count > 0
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1">
      <Flame
        className={`h-4 w-4 ${
          active
            ? 'text-coral animate-fire-pulse'
            : 'text-muted-foreground'
        }`}
      />
      <span
        className={`font-mono text-sm font-semibold tabular-nums ${
          active ? 'text-coral fire-glow' : 'text-muted-foreground'
        }`}
      >
        {count}
      </span>
    </div>
  )
}

// ---------- Mobile FAB ----------
function MobileFAB() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleAction = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  // Positions for 4 items in a semicircle above the FAB
  const getPosition = (index: number, total: number) => {
    const startAngle = Math.PI * 0.15
    const endAngle = Math.PI * 0.85
    const angle = startAngle + (endAngle - startAngle) * (index / (total - 1))
    const distance = 88
    return {
      x: -Math.cos(angle) * distance,
      y: -Math.sin(angle) * distance,
    }
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Radial menu items */}
      <AnimatePresence>
        {open &&
          fabActions.map((action, i) => {
            const pos = getPosition(i, fabActions.length)
            return (
              <motion.button
                key={action.label}
                className="fixed z-50 flex flex-col items-center gap-1"
                style={{
                  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
                  left: '50%',
                }}
                initial={{ x: '-50%', y: 0, opacity: 0, scale: 0.3 }}
                animate={{
                  x: `calc(-50% + ${pos.x}px)`,
                  y: pos.y,
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ x: '-50%', y: 0, opacity: 0, scale: 0.3 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 22,
                  delay: i * 0.04,
                }}
                onClick={() => handleAction(action.href)}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full shadow-lg"
                  style={{ backgroundColor: action.color }}
                >
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-body text-[10px] font-medium text-white drop-shadow-lg">
                  {action.label}
                </span>
              </motion.button>
            )
          })}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        className="relative z-50 -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-coral shadow-lg shadow-coral/30"
        onClick={() => setOpen(!open)}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        whileTap={{ scale: 0.9 }}
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </motion.button>
    </>
  )
}

// ---------- Main Layout ----------
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()
  const { data: streaksData } = useStreaks()
  const [sidebarHover, setSidebarHover] = useState(false)

  const foodLogStreak = streaksData?.streaks?.find(
    (s) => s.streak_type === 'food_log'
  )
  const currentStreak = foodLogStreak?.current_count ?? 0

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && profile && !profile.onboarding_completed) {
      router.push('/onboarding')
    }
  }, [loading, user, profile, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-coral/80">
            <span className="font-display text-xl font-bold text-white">UW</span>
          </div>
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-4 w-32" />
            <Skeleton className="mx-auto h-3 w-24" />
          </div>
        </motion.div>
      </div>
    )
  }

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className="fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ width: sidebarHover ? 260 : 72 }}
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
      >
        {/* Logo */}
        <div className="flex h-16 items-center px-5 border-b border-border/40">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-coral to-coral/80 shadow-sm">
              <span className="font-display text-sm font-bold text-white">UW</span>
            </div>
            <motion.span
              className="font-display text-lg font-bold text-foreground whitespace-nowrap"
              animate={{
                opacity: sidebarHover ? 1 : 0,
                x: sidebarHover ? 0 : -8,
              }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              Unweighted
            </motion.span>
          </Link>
        </div>

        {/* Primary Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarPrimaryItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Tooltip key={item.href} delayDuration={sidebarHover ? 9999 : 300}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`group relative flex h-10 items-center gap-3 rounded-xl px-3 transition-all duration-200 ${
                      active
                        ? 'bg-coral/10 text-coral'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <motion.div
                        className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-coral shadow-[0_0_8px_rgba(255,77,106,0.5)]"
                        layoutId="sidebar-indicator"
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                    )}
                    <item.icon className="h-5 w-5 shrink-0" />
                    <motion.span
                      className="font-body text-sm font-medium whitespace-nowrap overflow-hidden"
                      animate={{
                        opacity: sidebarHover ? 1 : 0,
                        width: sidebarHover ? 'auto' : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                </TooltipTrigger>
                {!sidebarHover && (
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}

          {/* Separator */}
          <div className="py-3">
            <div className="h-px bg-border/50" />
          </div>

          {/* Secondary Nav */}
          {sidebarSecondaryItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Tooltip key={item.href} delayDuration={sidebarHover ? 9999 : 300}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`group relative flex h-10 items-center gap-3 rounded-xl px-3 transition-all duration-200 ${
                      active
                        ? 'bg-coral/10 text-coral'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    {active && (
                      <motion.div
                        className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-coral shadow-[0_0_8px_rgba(255,77,106,0.5)]"
                        layoutId="sidebar-indicator"
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                    )}
                    <item.icon className="h-5 w-5 shrink-0" />
                    <motion.span
                      className="font-body text-sm font-medium whitespace-nowrap overflow-hidden"
                      animate={{
                        opacity: sidebarHover ? 1 : 0,
                        width: sidebarHover ? 'auto' : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                </TooltipTrigger>
                {!sidebarHover && (
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* User Section (bottom) */}
        <div className="border-t border-border/40 p-3">
          <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/40">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-coral/10 text-coral text-xs font-display">
                {getInitials(profile?.display_name || 'U')}
              </AvatarFallback>
            </Avatar>
            <motion.div
              className="flex-1 min-w-0 overflow-hidden"
              animate={{
                opacity: sidebarHover ? 1 : 0,
                width: sidebarHover ? 'auto' : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <p className="truncate font-body text-sm font-medium">
                {profile?.display_name || 'User'}
              </p>
              <LevelProgress
                totalXP={streaksData?.xp?.total_xp ?? 0}
                currentLevel={streaksData?.xp?.current_level ?? 1}
                size="sm"
              />
            </motion.div>
            <motion.div
              animate={{
                opacity: sidebarHover ? 1 : 0,
                width: sidebarHover ? 'auto' : 0,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-coral shrink-0"
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </aside>

      {/* ===== DESKTOP TOP BAR ===== */}
      <header
        className="fixed top-0 right-0 z-40 hidden lg:flex h-14 items-center justify-between border-b border-border/40 bg-card/80 backdrop-blur-xl px-6 transition-all duration-300"
        style={{ left: sidebarHover ? 260 : 72 }}
      >
        {/* Left: Greeting */}
        <h2 className="font-display text-sm font-semibold text-foreground">
          {getGreeting()}, {profile?.display_name?.split(' ')[0] || 'there'}
        </h2>

        {/* Right: Streak, notifications, theme toggle, avatar */}
        <div className="flex items-center gap-2">
          <StreakBadge count={currentStreak} />
          <NotificationBell />
          <ThemeToggle />
          <Link href="/dashboard/profile">
            <Avatar className="h-8 w-8 border-2 border-transparent hover:border-coral/30 transition-colors">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-coral/10 text-coral text-xs font-display">
                {getInitials(profile?.display_name || 'U')}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* ===== MOBILE TOP BAR ===== */}
      <header className="fixed top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/40 bg-card/80 backdrop-blur-xl px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-coral to-coral/80">
            <span className="font-display text-xs font-bold text-white">UW</span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5">
          <StreakBadge count={currentStreak} />
          <NotificationBell />
          <Link href="/dashboard/profile">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-coral/10 text-coral text-xs font-display">
                {getInitials(profile?.display_name || 'U')}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="min-h-screen pb-24 pt-14 lg:pb-0 lg:pt-14 lg:pl-[72px] transition-all duration-300">
        <div className="mx-auto max-w-5xl p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <GamificationListener />

      {/* ===== MOBILE BOTTOM TAB BAR ===== */}
      <nav className="fixed bottom-0 z-40 flex w-full items-end justify-around border-t border-border/40 bg-card/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)] lg:hidden">
        {/* First two tabs */}
        {mobileNavItems.slice(0, 2).map((item) => {
          const active = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-body font-medium transition-colors ${
                active ? 'text-coral' : 'text-muted-foreground'
              }`}
            >
              {active && (
                <motion.div
                  className="absolute -top-px left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-coral"
                  layoutId="mobile-tab-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Center FAB */}
        <div className="flex flex-col items-center justify-end px-2">
          <MobileFAB />
          <span className="mt-0.5 pb-2.5 text-[10px] font-body text-muted-foreground">Add</span>
        </div>

        {/* Last two tabs */}
        {mobileNavItems.slice(2).map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-body font-medium transition-colors ${
                active ? 'text-coral' : 'text-muted-foreground'
              }`}
            >
              {active && (
                <motion.div
                  className="absolute -top-px left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-coral"
                  layoutId="mobile-tab-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
