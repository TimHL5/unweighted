'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { useAuth } from '@/lib/providers/auth-provider'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { calculateTargets } from '@/lib/utils/nutrition'
import { formatWeight, kgToLbs } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Rocket,
  TrendingDown,
  Dumbbell,
  Scale,
  Repeat,
  Sofa,
  Footprints,
  Bike,
  Zap,
  Sparkles,
} from 'lucide-react'
import { format } from 'date-fns'
import type { OnboardingData } from '@/lib/types'

const TOTAL_STEPS = 6

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

export default function OnboardingPage() {
  const router = useRouter()
  const { refreshProfile } = useAuth()
  const store = useOnboardingStore()
  const [direction, setDirection] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const goNext = () => {
    if (!isStepValid(store)) return
    setDirection(1)
    store.nextStep()
  }

  const goBack = () => {
    setDirection(-1)
    store.prevStep()
  }

  const handleComplete = async () => {
    if (!store.goal_type || !store.gender || !store.activity_level || !store.date_of_birth) {
      toast.error('Please complete all required fields')
      return
    }

    setSubmitting(true)

    const onboardingData: OnboardingData = {
      goal_type: store.goal_type,
      gender: store.gender,
      date_of_birth: store.date_of_birth,
      height_cm: store.height_cm,
      current_weight_kg: store.current_weight_kg,
      goal_weight_kg: store.goal_weight_kg,
      activity_level: store.activity_level,
      diet_preferences: store.diet_preferences,
      challenges: store.challenges,
      pace_kg_per_week: store.pace_kg_per_week,
      unit_system: store.unit_system,
    }

    const targets = calculateTargets(onboardingData)

    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...onboardingData,
          daily_calorie_target: targets.daily_calories,
          protein_target_g: targets.protein_g,
          carb_target_g: targets.carbs_g,
          fat_target_g: targets.fat_g,
          fiber_target_g: targets.fiber_g,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      toast.success("Welcome to Unweighted! Let's start tracking!")
      store.reset()

      await refreshProfile()

      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  const progress = (store.step / TOTAL_STEPS) * 100

  return (
    <div className="flex min-h-screen flex-col bg-background bg-mesh-light dark:bg-mesh-dark">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-3">
            {store.step > 1 && (
              <button
                onClick={goBack}
                disabled={submitting}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-coral to-purple"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {store.step}/{TOTAL_STEPS}
            </span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={store.step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {store.step === 1 && <StepGoal />}
              {store.step === 2 && <StepGender />}
              {store.step === 3 && <StepBodyStats />}
              {store.step === 4 && <StepActivity />}
              {store.step === 5 && <StepDiet />}
              {store.step === 6 && <StepPlan />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 border-t border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div />
          {store.step < TOTAL_STEPS ? (
            <Button
              onClick={goNext}
              className="bg-coral text-coral-foreground shadow-lg shadow-coral/25 hover:bg-coral/90 font-semibold px-8"
              size="lg"
              disabled={!isStepValid(store)}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="bg-coral text-coral-foreground shadow-lg shadow-coral/25 hover:bg-coral/90 font-semibold px-8"
              size="lg"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-4 w-4" />
              )}
              Start My Journey
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function isStepValid(store: ReturnType<typeof useOnboardingStore.getState>): boolean {
  switch (store.step) {
    case 1:
      return store.goal_type !== null
    case 2:
      return store.gender !== null
    case 3:
      return (
        store.date_of_birth !== '' &&
        store.height_cm > 0 &&
        store.current_weight_kg > 0 &&
        store.goal_weight_kg > 0
      )
    case 4:
      return store.activity_level !== null
    case 5:
      return true
    case 6:
      return true
    default:
      return false
  }
}

// ============================================
// Step 1: Goal
// ============================================
function StepGoal() {
  const { goal_type, setGoalType } = useOnboardingStore()

  const goals = [
    {
      value: 'lose' as const,
      icon: TrendingDown,
      accent: 'coral',
      accentBg: 'bg-coral/10 dark:bg-coral/15',
      accentText: 'text-coral',
      accentBorder: 'border-coral',
      title: 'Lose Weight',
      desc: 'Shed fat while keeping muscle',
    },
    {
      value: 'gain' as const,
      icon: Dumbbell,
      accent: 'teal',
      accentBg: 'bg-teal/10 dark:bg-teal/15',
      accentText: 'text-teal',
      accentBorder: 'border-teal',
      title: 'Gain Muscle',
      desc: 'Build lean mass and strength',
    },
    {
      value: 'maintain' as const,
      icon: Scale,
      accent: 'blue',
      accentBg: 'bg-blue-500/10 dark:bg-blue-500/15',
      accentText: 'text-blue-500',
      accentBorder: 'border-blue-500',
      title: 'Maintain',
      desc: 'Stay where you are, improve habits',
    },
    {
      value: 'recomp' as const,
      icon: Repeat,
      accent: 'purple',
      accentBg: 'bg-purple/10 dark:bg-purple/15',
      accentText: 'text-purple',
      accentBorder: 'border-purple',
      title: 'Body Recomp',
      desc: 'Lose fat and gain muscle simultaneously',
    },
  ]

  return (
    <div>
      <h2 className="font-display text-3xl font-bold">What&apos;s your goal?</h2>
      <p className="mt-2 text-muted-foreground">
        Choose what matters most to you right now.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4">
        {goals.map((g) => {
          const isSelected = goal_type === g.value
          return (
            <motion.button
              key={g.value}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGoalType(g.value)}
              className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                isSelected
                  ? `${g.accentBorder} bg-card shadow-lg`
                  : 'border-border/50 bg-card/50 hover:border-border hover:bg-card/80'
              }`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-coral text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.div>
              )}
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${g.accentBg}`}>
                <g.icon className={`h-6 w-6 ${g.accentText}`} />
              </div>
              <h3 className="font-display font-semibold">{g.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{g.desc}</p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Step 2: Gender
// ============================================
function StepGender() {
  const { gender, setGender } = useOnboardingStore()

  const genders = [
    { value: 'male' as const, label: 'Male', emoji: '\u2642\uFE0F' },
    { value: 'female' as const, label: 'Female', emoji: '\u2640\uFE0F' },
    { value: 'non-binary' as const, label: 'Non-binary', emoji: '\u26A7\uFE0F' },
    { value: 'prefer_not_to_say' as const, label: 'Prefer not to say', emoji: '\u2014' },
  ]

  return (
    <div>
      <h2 className="font-display text-3xl font-bold">How do you identify?</h2>
      <p className="mt-2 text-muted-foreground">
        This helps us calculate accurate nutrition targets.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4">
        {genders.map((g) => {
          const isSelected = gender === g.value
          return (
            <motion.button
              key={g.value}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGender(g.value)}
              className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                isSelected
                  ? 'border-coral bg-card shadow-lg'
                  : 'border-border/50 bg-card/50 hover:border-border hover:bg-card/80'
              }`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-coral text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.div>
              )}
              <span className="mb-2 block text-2xl">{g.emoji}</span>
              <h3 className="font-display font-semibold">{g.label}</h3>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Step 3: Body Stats
// ============================================
function StepBodyStats() {
  const store = useOnboardingStore()

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 60 }, (_, i) => currentYear - 16 - i)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  const [dobMonth, setDobMonth] = useState(
    store.date_of_birth ? new Date(store.date_of_birth).getMonth() + 1 : 0
  )
  const [dobDay, setDobDay] = useState(
    store.date_of_birth ? new Date(store.date_of_birth).getDate() : 0
  )
  const [dobYear, setDobYear] = useState(
    store.date_of_birth ? new Date(store.date_of_birth).getFullYear() : 0
  )

  const updateDob = (month: number, day: number, year: number) => {
    if (month && day && year) {
      const dob = format(new Date(year, month - 1, day), 'yyyy-MM-dd')
      store.setDateOfBirth(dob)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold">Tell us about yourself</h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;ll use this to calculate your personalized targets.
          </p>
        </div>
      </div>

      {/* Unit Toggle */}
      <div className="mt-6 flex items-center justify-center">
        <div className="inline-flex rounded-xl border border-border/50 bg-muted/50 p-1">
          <button
            onClick={() => store.setUnitSystem('imperial')}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
              store.unit_system === 'imperial'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Imperial
          </button>
          <button
            onClick={() => store.setUnitSystem('metric')}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
              store.unit_system === 'metric'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Metric
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {/* Date of Birth */}
        <div>
          <Label className="mb-2 block font-display text-sm font-semibold">Date of Birth</Label>
          <div className="grid grid-cols-3 gap-2">
            <Select
              value={dobMonth ? String(dobMonth) : ''}
              onValueChange={(v) => {
                const m = Number(v)
                setDobMonth(m)
                updateDob(m, dobDay, dobYear)
              }}
            >
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={dobDay ? String(dobDay) : ''}
              onValueChange={(v) => {
                const d = Number(v)
                setDobDay(d)
                updateDob(dobMonth, d, dobYear)
              }}
            >
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Day" /></SelectTrigger>
              <SelectContent>
                {days.map((d) => (
                  <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={dobYear ? String(dobYear) : ''}
              onValueChange={(v) => {
                const y = Number(v)
                setDobYear(y)
                updateDob(dobMonth, dobDay, y)
              }}
            >
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Height */}
        <div>
          <Label className="mb-2 block font-display text-sm font-semibold">Height</Label>
          {store.unit_system === 'imperial' ? (
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={String(store.height_feet)}
                onValueChange={(v) => store.setHeightFtIn(Number(v), store.height_inches)}
              >
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[4, 5, 6, 7].map((ft) => (
                    <SelectItem key={ft} value={String(ft)}>{ft} ft</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(store.height_inches)}
                onValueChange={(v) => store.setHeightFtIn(store.height_feet, Number(v))}
              >
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>{i} in</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="relative">
              <Input
                type="number"
                value={store.height_cm || ''}
                onChange={(e) => store.setHeightCm(Number(e.target.value))}
                placeholder="Height"
                min={100}
                max={250}
                className="h-12 rounded-xl font-mono text-base"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">cm</span>
            </div>
          )}
        </div>

        {/* Current Weight */}
        <div>
          <Label className="mb-2 block font-display text-sm font-semibold">Current Weight</Label>
          <div className="relative">
            <Input
              type="number"
              value={
                store.unit_system === 'imperial'
                  ? store.weight_lbs || ''
                  : store.current_weight_kg || ''
              }
              onChange={(e) =>
                store.unit_system === 'imperial'
                  ? store.setCurrentWeightLbs(Number(e.target.value))
                  : store.setCurrentWeightKg(Number(e.target.value))
              }
              placeholder={store.unit_system === 'imperial' ? 'Weight' : 'Weight'}
              min={store.unit_system === 'imperial' ? 60 : 30}
              max={store.unit_system === 'imperial' ? 600 : 300}
              className="h-12 rounded-xl font-mono text-base"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {store.unit_system === 'imperial' ? 'lbs' : 'kg'}
            </span>
          </div>
        </div>

        {/* Goal Weight */}
        <div>
          <Label className="mb-2 block font-display text-sm font-semibold">Goal Weight</Label>
          <div className="relative">
            <Input
              type="number"
              value={
                store.unit_system === 'imperial'
                  ? store.goal_weight_lbs || ''
                  : store.goal_weight_kg || ''
              }
              onChange={(e) =>
                store.unit_system === 'imperial'
                  ? store.setGoalWeightLbs(Number(e.target.value))
                  : store.setGoalWeightKg(Number(e.target.value))
              }
              placeholder={store.unit_system === 'imperial' ? 'Goal' : 'Goal'}
              min={store.unit_system === 'imperial' ? 60 : 30}
              max={store.unit_system === 'imperial' ? 600 : 300}
              className="h-12 rounded-xl font-mono text-base"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {store.unit_system === 'imperial' ? 'lbs' : 'kg'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Step 4: Activity Level
// ============================================
function StepActivity() {
  const { activity_level, setActivityLevel } = useOnboardingStore()

  const levels = [
    {
      value: 'sedentary' as const,
      icon: Sofa,
      title: 'Sedentary',
      desc: 'Little to no exercise',
    },
    {
      value: 'light' as const,
      icon: Footprints,
      title: 'Lightly Active',
      desc: 'Light exercise 1\u20133 days/week',
    },
    {
      value: 'moderate' as const,
      icon: Bike,
      title: 'Moderately Active',
      desc: 'Moderate exercise 3\u20135 days/week',
    },
    {
      value: 'active' as const,
      icon: Dumbbell,
      title: 'Very Active',
      desc: 'Hard exercise 6\u20137 days/week',
    },
    {
      value: 'very_active' as const,
      icon: Zap,
      title: 'Extremely Active',
      desc: 'Very hard exercise, physical job',
    },
  ]

  return (
    <div>
      <h2 className="font-display text-3xl font-bold">How active are you?</h2>
      <p className="mt-2 text-muted-foreground">
        This helps us calculate your daily calorie needs.
      </p>
      <div className="mt-8 space-y-3">
        {levels.map((l) => {
          const isSelected = activity_level === l.value
          return (
            <motion.button
              key={l.value}
              whileTap={{ scale: 0.99 }}
              onClick={() => setActivityLevel(l.value)}
              className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-coral bg-card shadow-lg'
                  : 'border-border/50 bg-card/50 hover:border-border hover:bg-card/80'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isSelected ? 'bg-coral/10' : 'bg-muted'
              }`}>
                <l.icon className={`h-5 w-5 ${isSelected ? 'text-coral' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold">{l.title}</h3>
                <p className="text-sm text-muted-foreground">{l.desc}</p>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-coral text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Step 5: Diet Preferences
// ============================================
function StepDiet() {
  const { diet_preferences, toggleDietPreference } = useOnboardingStore()

  const prefs = [
    'No Restrictions',
    'Vegetarian',
    'Vegan',
    'Keto',
    'Paleo',
    'Gluten-Free',
    'Dairy-Free',
    'Halal',
    'Kosher',
  ]

  return (
    <div>
      <h2 className="font-display text-3xl font-bold">Any dietary preferences?</h2>
      <p className="mt-2 text-muted-foreground">
        Select all that apply. This is optional.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {prefs.map((p) => {
          const isSelected = diet_preferences.includes(p === 'No Restrictions' ? 'No Preference' : p)
          return (
            <motion.button
              key={p}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleDietPreference(p === 'No Restrictions' ? 'No Preference' : p)}
              className={`rounded-xl px-5 py-3 text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-coral text-white shadow-md shadow-coral/25'
                  : 'border border-border/50 bg-card/50 text-muted-foreground hover:border-border hover:bg-card/80 hover:text-foreground'
              }`}
            >
              {p}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Step 6: Your Plan
// ============================================

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prevValue = useRef(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const from = prevValue.current
    const to = value

    const controls = animate(from, to, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = Math.round(latest).toLocaleString('en-US')
      },
    })

    prevValue.current = value

    return () => controls.stop()
  }, [value])

  return <span ref={ref} className={className}>{Math.round(value).toLocaleString('en-US')}</span>
}

function StepPlan() {
  const store = useOnboardingStore()

  const targets = useMemo(() => {
    if (!store.goal_type || !store.gender || !store.date_of_birth || !store.activity_level) {
      return null
    }
    return calculateTargets({
      goal_type: store.goal_type,
      gender: store.gender,
      date_of_birth: store.date_of_birth,
      height_cm: store.height_cm,
      current_weight_kg: store.current_weight_kg,
      goal_weight_kg: store.goal_weight_kg,
      activity_level: store.activity_level,
      diet_preferences: store.diet_preferences,
      challenges: store.challenges,
      pace_kg_per_week: store.pace_kg_per_week,
      unit_system: store.unit_system,
    })
  }, [
    store.goal_type, store.gender, store.date_of_birth, store.height_cm,
    store.current_weight_kg, store.goal_weight_kg, store.activity_level,
    store.diet_preferences, store.challenges, store.pace_kg_per_week, store.unit_system,
  ])

  const isLosing = store.goal_type === 'lose'
  const isGaining = store.goal_type === 'gain'
  const showPaceSlider = isLosing || isGaining

  const paceMin = isLosing ? 0.25 : 0.1
  const paceMax = isLosing ? 1.0 : 0.5
  const paceStep = 0.05

  const paceDisplay =
    store.unit_system === 'imperial'
      ? `${Math.round(kgToLbs(store.pace_kg_per_week) * 10) / 10} lbs/week`
      : `${store.pace_kg_per_week} kg/week`

  // Calorie ring animation
  const caloriePercent = targets ? Math.min(100, (targets.daily_calories / 3000) * 100) : 0
  const circumference = 2 * Math.PI * 54
  const strokeDasharray = `${(caloriePercent / 100) * circumference} ${circumference}`

  return (
    <div>
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-amber" />
        <h2 className="font-display text-3xl font-bold">Your personalized plan</h2>
      </div>
      <p className="mt-2 text-muted-foreground">
        {showPaceSlider
          ? 'Adjust your pace and see targets update in real time.'
          : 'Here are your daily targets based on your profile.'}
      </p>

      {showPaceSlider && (
        <div className="mt-8 rounded-2xl border border-border/50 bg-card/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <Label className="font-display text-sm font-semibold">Pace</Label>
            <span className="rounded-lg bg-coral/10 px-3 py-1 font-mono text-sm font-semibold text-coral">
              {paceDisplay}
            </span>
          </div>
          <Slider
            value={[store.pace_kg_per_week]}
            onValueChange={([v]) => store.setPaceKgPerWeek(Math.round(v * 100) / 100)}
            min={paceMin}
            max={paceMax}
            step={paceStep}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slow & steady</span>
            <span>Aggressive</span>
          </div>
        </div>
      )}

      {targets && (
        <div className="mt-8 space-y-5">
          {/* Calorie Ring + Big Number */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-36 w-36 items-center justify-center">
              <svg viewBox="0 0 120 120" className="h-full w-full">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/50"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#planGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  transform="rotate(-90 60 60)"
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="drop-shadow-[0_0_8px_rgba(255,77,106,0.4)]"
                />
                <defs>
                  <linearGradient id="planGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF4D6A" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Daily Calories</p>
              <p className="mt-1 font-mono text-4xl font-bold text-coral sm:text-5xl">
                <AnimatedNumber value={targets.daily_calories} />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">calories / day</p>
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Protein', value: targets.protein_g, color: '#4ECDC4', bgClass: 'bg-teal/10' },
              { label: 'Carbs', value: targets.carbs_g, color: '#3B82F6', bgClass: 'bg-blue-500/10' },
              { label: 'Fat', value: targets.fat_g, color: '#F59E0B', bgClass: 'bg-amber/10' },
            ].map((macro) => (
              <div
                key={macro.label}
                className="rounded-2xl border border-border/50 bg-card/50 p-4 text-center"
              >
                <p className="text-xs text-muted-foreground">{macro.label}</p>
                <p className="mt-1 font-mono text-xl font-bold" style={{ color: macro.color }}>
                  <AnimatedNumber value={macro.value} />
                  <span className="text-sm font-normal">g</span>
                </p>
                <div className="mx-auto mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: macro.color }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        100,
                        ((macro.value * (macro.label === 'Fat' ? 9 : 4)) / targets.daily_calories) * 100
                      )}%`,
                    }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Projected Goal */}
          {showPaceSlider && (
            <div className="rounded-2xl border border-border/50 bg-card/50 p-5 text-center">
              <p className="text-sm text-muted-foreground">
                At this pace, you&apos;ll reach{' '}
                <span className="font-medium text-foreground">
                  {formatWeight(store.goal_weight_kg, store.unit_system)}
                </span>{' '}
                by
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-teal">
                {format(new Date(targets.projected_goal_date), 'MMMM d, yyyy')}
              </p>
            </div>
          )}

          {/* Note */}
          <p className="text-center text-xs text-muted-foreground">
            These are starting points \u2014 adjust anytime in your settings.
          </p>
        </div>
      )}
    </div>
  )
}
