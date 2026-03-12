'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
} from '@/lib/motion'
import { useAuth } from '@/lib/providers/auth-provider'
import { getGreeting } from '@/lib/utils/helpers'
import { useDashboardData, useAddWater } from '@/lib/hooks/use-dashboard'
import { useFoodLogStore } from '@/lib/stores/food-log-store'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DateNavigator } from '@/components/shared/date-navigator'
import { CalorieRing } from '@/components/shared/calorie-ring'
import { MacroBar } from '@/components/shared/macro-bar'
import { UpgradeBanner } from '@/components/billing/upgrade-banner'

import {
  Coffee,
  Sun,
  Moon,
  Cookie,
  Droplets,
  Flame,
  Scale,
  Plus,
  Trophy,
  TrendingDown,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Cell,
} from 'recharts'
import { toast } from 'sonner'

// ---------- Meal configuration ----------
const mealConfig = {
  breakfast: { icon: Coffee, emoji: '\uD83C\uDF73', label: 'Breakfast' },
  lunch: { icon: Sun, emoji: '\uD83C\uDF5D', label: 'Lunch' },
  dinner: { icon: Moon, emoji: '\uD83C\uDF56', label: 'Dinner' },
  snack: { icon: Cookie, emoji: '\uD83C\uDF6A', label: 'Snacks' },
} as const

// ---------- Custom Recharts Tooltip ----------
function CustomChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl border border-border/30 px-3 py-2 shadow-xl">
      <p className="font-body text-xs text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold text-coral">
        {payload[0].value.toLocaleString()} cal
      </p>
    </div>
  )
}

// ---------- Streak Calendar Dots ----------
function StreakDots({ count }: { count: number }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  // Show last 7 days active status (simplified: assume streak covers recent consecutive days)
  return (
    <div className="flex gap-1.5">
      {days.map((day, i) => {
        const isActive = i >= 7 - count
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`h-2 w-2 rounded-full transition-colors ${
                isActive
                  ? 'bg-green shadow-[0_0_4px_rgba(34,197,94,0.5)]'
                  : 'bg-muted'
              }`}
            />
            <span className="text-[9px] text-muted-foreground">{day}</span>
          </div>
        )
      })}
    </div>
  )
}

// ---------- Main Dashboard ----------
export default function DashboardPage() {
  const { profile } = useAuth()
  const { selectedDate, setSelectedDate } = useFoodLogStore()
  const { data, isLoading } = useDashboardData(selectedDate)
  const addWaterMutation = useAddWater(selectedDate)

  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)

  const handleAddWater = async (ml: number) => {
    try {
      await addWaterMutation.mutateAsync({ amount_ml: ml, log_date: selectedDate })
      toast.success(`+${ml}ml water logged`)
    } catch {
      toast.error('Failed to log water')
    }
  }

  if (isLoading) return <DashboardSkeleton />

  const totals = data?.daily_totals || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  const targets = data?.targets || { calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 65, fiber_g: 30 }
  const meals = data?.meals || { breakfast: [], lunch: [], dinner: [], snack: [] }
  const streaks = data?.streaks || []
  const xp = data?.xp || { total_xp: 0, current_level: 1 }
  const waterTotal = data?.water_total_ml || 0
  const waterTarget = 2500
  const weeklyData = (data?.weekly_calories || []).map((d) => ({
    day: format(parseISO(d.date), 'EEE'),
    calories: d.calories,
  }))

  const foodLogStreak = streaks.find((s) => s.streak_type === 'food_log')
  const mainStreak = foodLogStreak?.current_count ?? 0
  const longestStreak = foodLogStreak?.longest_count ?? 0

  return (
    <motion.div
      className="space-y-6 pb-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ===== HEADER ===== */}
      <motion.div variants={fadeInUp} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
            {getGreeting()},{' '}
            <span className="text-gradient-coral">
              {profile?.display_name?.split(' ')[0] || 'there'}
            </span>
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary" className="bg-purple/10 text-purple border-purple/20 gap-1">
              <Sparkles className="h-3 w-3" />
              <span className="font-mono text-xs">Lvl {xp.current_level}</span>
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              {xp.total_xp.toLocaleString()} XP
            </span>
          </div>
        </div>
        <DateNavigator date={selectedDate} onDateChange={setSelectedDate} />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <UpgradeBanner message="Unlock recipes, groups & unlimited tracking with Pro" />
      </motion.div>

      {/* ===== CALORIE RING + MACROS (side-by-side on desktop) ===== */}
      <motion.div variants={fadeInUp} className="grid gap-4 lg:grid-cols-2">
        {/* Calorie Ring Card */}
        <Card className="card-elevated overflow-hidden transition-transform hover:scale-[1.02]">
          <CardContent className="flex flex-col items-center py-8">
            <div className="block sm:hidden">
              <CalorieRing consumed={totals.calories} target={targets.calories} size={220} />
            </div>
            <div className="hidden sm:block">
              <CalorieRing consumed={totals.calories} target={targets.calories} size={260} />
            </div>
          </CardContent>
        </Card>

        {/* Macro Dashboard Card */}
        <Card className="card-elevated flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Macronutrients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MacroBar
              label="Protein"
              current={totals.protein_g}
              target={targets.protein_g}
              color="#4ECDC4"
            />
            <MacroBar
              label="Carbs"
              current={totals.carbs_g}
              target={targets.carbs_g}
              color="#3B82F6"
            />
            <MacroBar
              label="Fat"
              current={totals.fat_g}
              target={targets.fat_g}
              color="#F59E0B"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== TODAY'S MEALS ===== */}
      <motion.div variants={fadeInUp}>
        <Card className="card-elevated transition-transform hover:scale-[1.01]">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">Today&apos;s Meals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-border/40">
            {(Object.entries(mealConfig) as [keyof typeof mealConfig, typeof mealConfig.breakfast][]).map(
              ([type, config]) => {
                const mealEntries = meals[type] || []
                const cals = mealEntries.reduce((s, m) => s + (m.calories || 0), 0)
                const isExpanded = expandedMeal === type

                return (
                  <div key={type} className="py-3 first:pt-0 last:pb-0">
                    <button
                      className="flex w-full items-center gap-3 text-left group"
                      onClick={() =>
                        setExpandedMeal(isExpanded ? null : type)
                      }
                    >
                      <span className="text-xl">{config.emoji}</span>
                      <span className="font-display text-sm font-semibold flex-1">
                        {config.label}
                      </span>
                      <span className="flex-1 border-b border-dotted border-muted-foreground/20" />
                      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                        {cals > 0 ? `${cals.toLocaleString()} cal` : '--'}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {/* Expanded meal items */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: isExpanded ? 'auto' : 0,
                        opacity: isExpanded ? 1 : 0,
                      }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 ml-9 space-y-1.5">
                        {mealEntries.length > 0 ? (
                          mealEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="font-body text-muted-foreground truncate max-w-[200px]">
                                {entry.food?.name || 'Food item'}
                              </span>
                              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                                {entry.calories} cal
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            Nothing logged yet
                          </p>
                        )}
                        <Link href={`/dashboard/food/search?meal=${type}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-7 gap-1 text-xs text-coral hover:text-coral hover:bg-coral/10"
                          >
                            <Plus className="h-3 w-3" />
                            Log Food
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                )
              }
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== WIDGET ROW: Water, Weight, Streak ===== */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        {/* Water Widget */}
        <motion.div variants={scaleIn}>
          <Card className="card-elevated h-full transition-transform hover:scale-[1.02]">
            <CardContent className="flex flex-col gap-3 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-water/10">
                    <Droplets className="h-4 w-4 text-water" />
                  </div>
                  <span className="font-display text-sm font-semibold">Water</span>
                </div>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {(waterTotal / 1000).toFixed(1)} / {(waterTarget / 1000).toFixed(1)}L
                </span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-water/80 to-water"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((waterTotal / waterTarget) * 100, 100)}%`,
                  }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 flex-1 text-xs"
                  onClick={() => handleAddWater(250)}
                  disabled={addWaterMutation.isPending}
                >
                  +250ml
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 flex-1 text-xs"
                  onClick={() => handleAddWater(500)}
                  disabled={addWaterMutation.isPending}
                >
                  +500ml
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weight Widget */}
        <motion.div variants={scaleIn}>
          <Card className="card-elevated h-full transition-transform hover:scale-[1.02]">
            <CardContent className="flex flex-col gap-3 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10">
                    <Scale className="h-4 w-4 text-amber" />
                  </div>
                  <span className="font-display text-sm font-semibold">Weight</span>
                </div>
                {profile?.goal_type === 'lose' ? (
                  <TrendingDown className="h-4 w-4 text-green" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-coral" />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-bold tabular-nums">
                  {profile?.current_weight_kg
                    ? profile.unit_system === 'imperial'
                      ? Math.round(profile.current_weight_kg * 2.20462)
                      : profile.current_weight_kg
                    : '--'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {profile?.unit_system === 'imperial' ? 'lbs' : 'kg'}
                </span>
              </div>
              <Link href="/dashboard/progress">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-full text-xs"
                >
                  Log Weight
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak Widget */}
        <motion.div variants={scaleIn}>
          <Card className="card-elevated h-full transition-transform hover:scale-[1.02]">
            <CardContent className="flex flex-col gap-3 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral/10">
                    <Flame
                      className={`h-4 w-4 text-coral ${
                        mainStreak > 0 ? 'animate-fire-pulse' : ''
                      }`}
                    />
                  </div>
                  <span className="font-display text-sm font-semibold">Streak</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`font-mono text-3xl font-bold tabular-nums ${
                    mainStreak > 0 ? 'text-coral fire-glow' : 'text-muted-foreground'
                  }`}
                >
                  {mainStreak}
                </span>
                <span className="text-xs text-muted-foreground">days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  longest: <span className="font-mono font-semibold">{longestStreak}</span>
                </span>
                <StreakDots count={Math.min(mainStreak, 7)} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ===== ACTIVE CHALLENGES ===== */}
      <motion.div variants={fadeInUp}>
        <Card className="card-elevated transition-transform hover:scale-[1.01]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber" />
              <CardTitle className="font-display text-base">Active Challenges</CardTitle>
            </div>
            <Link href="/dashboard/challenges">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Placeholder challenges using streak data */}
            <ChallengeItem
              name="7-Day Logging Streak"
              progress={Math.min(mainStreak, 7)}
              total={7}
            />
            <ChallengeItem
              name="Drink 2.5L Water Daily"
              progress={Math.min(Math.round(waterTotal / 100), 25)}
              total={25}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== WEEKLY TREND ===== */}
      <motion.div variants={fadeInUp}>
        <Card className="card-elevated transition-transform hover:scale-[1.01]">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Weekly Trend</CardTitle>
          </CardHeader>
          <CardContent className="pr-2 pb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 11,
                      fill: 'var(--muted-foreground)',
                      fontFamily: 'var(--font-body)',
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: 'var(--muted-foreground)',
                      fontFamily: 'var(--font-mono)',
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <RechartsTooltip content={<CustomChartTooltip />} />
                  <ReferenceLine
                    y={targets.calories}
                    stroke="var(--muted-foreground)"
                    strokeDasharray="4 4"
                    strokeOpacity={0.4}
                    label={{
                      value: 'Goal',
                      fill: 'var(--muted-foreground)',
                      fontSize: 10,
                      fontFamily: 'var(--font-body)',
                      position: 'right',
                    }}
                  />
                  <Bar
                    dataKey="calories"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  >
                    {weeklyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.calories > targets.calories
                            ? '#FF4D6A'
                            : entry.calories > targets.calories * 0.8
                            ? '#F59E0B'
                            : '#4ECDC4'
                        }
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ---------- Challenge Item ----------
function ChallengeItem({
  name,
  progress,
  total,
}: {
  name: string
  progress: number
  total: number
}) {
  const pct = total > 0 ? Math.min((progress / total) * 100, 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-body text-sm font-medium">{name}</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {progress}/{total}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/50">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber/80 to-amber"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
    </div>
  )
}

// ---------- Skeleton (inline fallback) ----------
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-52 rounded-lg bg-muted shimmer" />
          <div className="mt-2 h-4 w-28 rounded bg-muted shimmer" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-muted shimmer" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6 flex items-center justify-center">
          <div className="h-[220px] w-[220px] rounded-full bg-muted shimmer" />
        </div>
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-muted shimmer" />
          <div className="h-3 w-full rounded-full bg-muted shimmer" />
          <div className="h-3 w-full rounded-full bg-muted shimmer" />
          <div className="h-3 w-full rounded-full bg-muted shimmer" />
        </div>
      </div>
      <div className="glass rounded-2xl p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted shimmer" />
            <div className="h-4 flex-1 rounded bg-muted shimmer" />
            <div className="h-4 w-16 rounded bg-muted shimmer" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-muted shimmer" />
              <div className="h-4 w-16 rounded bg-muted shimmer" />
            </div>
            <div className="h-6 w-20 rounded bg-muted shimmer" />
            <div className="h-2.5 w-full rounded-full bg-muted shimmer" />
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl p-6">
        <div className="h-48 rounded-xl bg-muted shimmer" />
      </div>
    </div>
  )
}
