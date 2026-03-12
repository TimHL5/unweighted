'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  Plus, Search, Zap, ScanBarcode, Pencil, Trash2,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { format, parseISO, isToday, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { MealSelector } from '@/components/food/meal-selector'
import { MacroBar } from '@/components/shared/macro-bar'
import { useDailyFoodLog, useUpdateFoodLog, useDeleteFoodLog } from '@/lib/hooks/use-food-log'
import { useFoodLogStore } from '@/lib/stores/food-log-store'
import { fadeInUp, staggerContainer, scaleIn, radialMenuVariants } from '@/lib/motion'
import type { FoodLog, MealType } from '@/lib/types'
import { toast } from 'sonner'

const mealConfig: { type: MealType; label: string; emoji: string }[] = [
  { type: 'breakfast', label: 'Breakfast', emoji: '\u2615' },
  { type: 'lunch', label: 'Lunch', emoji: '\u2600\uFE0F' },
  { type: 'dinner', label: 'Dinner', emoji: '\uD83C\uDF19' },
  { type: 'snack', label: 'Snacks', emoji: '\uD83C\uDF6A' },
]

// Animated counter component
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString())
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    })
    const unsubscribe = rounded.on('change', setDisplay)
    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [value, motionValue, rounded])

  return <span className={className}>{display}</span>
}

export default function FoodDiaryPage() {
  const router = useRouter()
  const { selectedDate, setSelectedDate } = useFoodLogStore()
  const { data, isLoading } = useDailyFoodLog(selectedDate)
  const updateMutation = useUpdateFoodLog(selectedDate)
  const deleteMutation = useDeleteFoodLog(selectedDate)

  const [editingLog, setEditingLog] = useState<FoodLog | null>(null)
  const [editServings, setEditServings] = useState(1)
  const [editMealType, setEditMealType] = useState<MealType>('breakfast')
  const [editNotes, setEditNotes] = useState('')
  const [fabOpen, setFabOpen] = useState(false)
  const [collapsedMeals, setCollapsedMeals] = useState<Set<MealType>>(new Set())
  const [weekOffset, setWeekOffset] = useState(0)

  const dateStripRef = useRef<HTMLDivElement>(null)

  // Week days for date strip
  const weekDays = useMemo(() => {
    const today = new Date()
    const weekStart = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i)
      return {
        date: format(d, 'yyyy-MM-dd'),
        dayLabel: format(d, 'EEE'),
        dayNum: format(d, 'd'),
        isToday: isToday(d),
        isSelected: isSameDay(d, parseISO(selectedDate)),
      }
    })
  }, [weekOffset, selectedDate])

  const toggleMealCollapse = (type: MealType) => {
    setCollapsedMeals((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const openEditSheet = (log: FoodLog) => {
    setEditingLog(log)
    setEditServings(log.servings)
    setEditMealType(log.meal_type as MealType)
    setEditNotes(log.notes || '')
  }

  const handleSaveEdit = async () => {
    if (!editingLog) return
    try {
      await updateMutation.mutateAsync({
        id: editingLog.id,
        servings: editServings,
        meal_type: editMealType,
        notes: editNotes || null,
      })
      toast.success('Entry updated')
      setEditingLog(null)
    } catch {
      toast.error('Failed to update entry')
    }
  }

  const handleDeleteEntry = async () => {
    if (!editingLog) return
    try {
      await deleteMutation.mutateAsync(editingLog.id)
      toast.success('Entry deleted')
      setEditingLog(null)
    } catch {
      toast.error('Failed to delete entry')
    }
  }

  const navigateToSearch = (mealType: MealType) => {
    router.push(`/dashboard/food/search?meal=${mealType}&date=${selectedDate}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 rounded-lg bg-muted shimmer" />
        </div>
        {/* Date strip skeleton */}
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-12 h-16 rounded-xl bg-muted shimmer" />
          ))}
        </div>
        {/* Summary skeleton */}
        <div className="h-36 rounded-2xl bg-muted shimmer" />
        {/* Meal sections skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted shimmer" />
        ))}
      </div>
    )
  }

  const totals = data?.totals || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  const targets = data?.targets || { calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 65, fiber_g: 30 }
  const remaining = Math.max(0, targets.calories - totals.calories)
  const calPct = targets.calories > 0 ? Math.min((totals.calories / targets.calories) * 100, 100) : 0

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 pb-36"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Food Diary</h1>
        {!isToday(parseISO(selectedDate)) && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-full border-coral/30 px-3 text-xs font-medium text-coral hover:bg-coral/5"
            onClick={() => {
              setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
              setWeekOffset(0)
            }}
          >
            Today
          </Button>
        )}
      </motion.div>

      {/* Date Strip */}
      <motion.div variants={fadeInUp} className="flex items-center gap-1">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div
          ref={dateStripRef}
          className="flex flex-1 gap-1.5 overflow-x-auto scrollbar-thin"
        >
          {weekDays.map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={`relative flex flex-1 min-w-[44px] flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition-all ${
                day.isSelected
                  ? 'bg-coral text-coral-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="font-body text-[10px] font-medium uppercase">
                {day.dayLabel}
              </span>
              <span className={`font-mono text-sm font-bold tabular-nums ${
                day.isSelected ? '' : ''
              }`}>
                {day.dayNum}
              </span>
              {day.isToday && !day.isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-coral" />
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </motion.div>

      {/* Daily Nutrition Summary */}
      <motion.div variants={scaleIn}>
        <Card className="card-elevated overflow-hidden border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-5">
              {/* Calorie Ring */}
              <div className="relative flex-shrink-0">
                <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
                  {/* Background ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/50"
                  />
                  {/* Progress ring */}
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#calRingGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 50}
                    initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 50 * (1 - calPct / 100),
                    }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  />
                  <defs>
                    <linearGradient id="calRingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF4D6A" />
                      <stop offset="100%" stopColor="#FF8A9E" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                  <AnimatedNumber
                    value={remaining}
                    className="font-mono text-xl font-black tabular-nums text-foreground"
                  />
                  <span className="font-body text-[10px] text-muted-foreground">remaining</span>
                </div>
              </div>

              {/* Macro Summary */}
              <div className="flex-1 space-y-2.5">
                <MacroBar
                  label="Protein"
                  current={totals.protein_g}
                  target={targets.protein_g}
                  color="var(--color-protein)"
                />
                <MacroBar
                  label="Carbs"
                  current={totals.carbs_g}
                  target={targets.carbs_g}
                  color="var(--color-carbs)"
                />
                <MacroBar
                  label="Fat"
                  current={totals.fat_g}
                  target={targets.fat_g}
                  color="var(--color-fat)"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Meal Sections */}
      {mealConfig.map(({ type, label, emoji }, index) => {
        const meals = data?.meals?.[type] || []
        const mealCals = meals.reduce((sum, m) => sum + (m.calories || 0), 0)
        const isCollapsed = collapsedMeals.has(type)

        return (
          <motion.div
            key={type}
            variants={fadeInUp}
            custom={index}
          >
            <Card className="card-elevated overflow-hidden border-0">
              {/* Meal Header */}
              <button
                type="button"
                onClick={() => toggleMealCollapse(type)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{emoji}</span>
                  <span className="font-display text-sm font-bold">{label}</span>
                  {mealCals > 0 && (
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {mealCals.toLocaleString()} cal
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 rounded-full px-2.5 text-xs text-coral hover:bg-coral/5 hover:text-coral"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateToSearch(type)
                    }}
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                  <motion.div
                    animate={{ rotate: isCollapsed ? -90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-[-90deg]" />
                  </motion.div>
                </div>
              </button>

              {/* Meal Content */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3">
                      <Separator className="mb-2" />
                      {meals.length === 0 ? (
                        <div className="py-4 text-center">
                          <p className="font-body text-sm text-muted-foreground/60">
                            Nothing logged yet
                          </p>
                          <button
                            onClick={() => navigateToSearch(type)}
                            className="mt-1 font-body text-xs font-medium text-coral hover:underline"
                          >
                            + Add your first {label.toLowerCase()} item
                          </button>
                        </div>
                      ) : (
                        <motion.div
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="space-y-0.5"
                        >
                          {meals.map((log) => (
                            <motion.div key={log.id} variants={fadeInUp}>
                              <FoodEntryRow log={log} onEdit={openEditSheet} />
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )
      })}

      {/* Grand Total Sticky Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="fixed bottom-[72px] left-0 right-0 z-20 border-t bg-card/95 backdrop-blur-md md:bottom-0"
      >
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-1">
            <span className="font-body text-xs text-muted-foreground">Total</span>
            <span className="font-mono text-base font-bold tabular-nums text-foreground">
              {totals.calories.toLocaleString()}
            </span>
            <span className="font-body text-xs text-muted-foreground">cal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--color-protein)' }}
              />
              <span className="font-mono text-xs font-semibold tabular-nums">
                {Math.round(totals.protein_g)}g
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--color-carbs)' }}
              />
              <span className="font-mono text-xs font-semibold tabular-nums">
                {Math.round(totals.carbs_g)}g
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--color-fat)' }}
              />
              <span className="font-mono text-xs font-semibold tabular-nums">
                {Math.round(totals.fat_g)}g
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FAB */}
      <div className="fixed bottom-36 right-4 z-30 md:bottom-20 md:right-8">
        <div className="relative">
          <AnimatePresence>
            {fabOpen && (
              <>
                <motion.div
                  variants={radialMenuVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="absolute bottom-16 right-0 mb-2 space-y-2"
                >
                  <Button
                    size="sm"
                    className="w-full justify-start gap-2 rounded-xl bg-card text-foreground shadow-lg border hover:bg-muted"
                    onClick={() => {
                      setFabOpen(false)
                      router.push(`/dashboard/food/search?meal=breakfast&date=${selectedDate}`)
                    }}
                  >
                    <Search className="h-4 w-4 text-coral" /> Search Food
                  </Button>
                  <Button
                    size="sm"
                    className="w-full justify-start gap-2 rounded-xl bg-card text-foreground shadow-lg border hover:bg-muted"
                    onClick={() => {
                      setFabOpen(false)
                      router.push(`/dashboard/food/search?meal=breakfast&date=${selectedDate}&quickadd=1`)
                    }}
                  >
                    <Zap className="h-4 w-4 text-amber" /> Quick Add
                  </Button>
                  <Button
                    size="sm"
                    className="w-full justify-start gap-2 rounded-xl bg-card text-foreground shadow-lg border hover:bg-muted"
                    onClick={() => {
                      setFabOpen(false)
                      router.push(`/dashboard/food/barcode?date=${selectedDate}`)
                    }}
                  >
                    <ScanBarcode className="h-4 w-4 text-teal" /> Barcode
                  </Button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          <motion.button
            className="flex h-14 w-14 items-center justify-center rounded-full bg-coral text-coral-foreground shadow-lg glow-coral"
            onClick={() => setFabOpen(!fabOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: fabOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="h-6 w-6" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit Sheet */}
      <Sheet open={!!editingLog} onOpenChange={(open) => !open && setEditingLog(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">
              {editingLog?.food?.name || editingLog?.notes || 'Quick Add'}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-5 py-4">
            {/* Servings adjuster */}
            <div className="space-y-2">
              <label className="font-body text-sm font-medium">Servings</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                  onClick={() => setEditServings(Math.max(0.5, editServings - 0.5))}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={editServings}
                  onChange={(e) => setEditServings(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-20 text-center font-mono text-lg tabular-nums"
                  step={0.5}
                  min={0.1}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                  onClick={() => setEditServings(editServings + 0.5)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Meal selector */}
            <div className="space-y-2">
              <label className="font-body text-sm font-medium">Meal</label>
              <MealSelector value={editMealType} onChange={setEditMealType} />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="font-body text-sm font-medium">Notes</label>
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add a note..."
                className="rounded-xl"
              />
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1 rounded-xl bg-coral text-coral-foreground hover:bg-coral/90 h-11"
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button
                variant="destructive"
                className="rounded-xl h-11 px-4"
                onClick={handleDeleteEntry}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}

// Individual food entry row
function FoodEntryRow({
  log,
  onEdit,
}: {
  log: FoodLog
  onEdit: (log: FoodLog) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onEdit(log)}
      className="group flex w-full items-center justify-between rounded-xl px-2 py-2 text-left transition-all hover:bg-muted/50 active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-sm font-medium">
          {log.food?.name || log.notes || 'Quick add'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {log.servings !== 1 && (
            <span className="font-body text-xs text-muted-foreground">
              {log.servings} servings
            </span>
          )}
          {/* Mini P/C/F dots */}
          <div className="flex items-center gap-1">
            {log.protein_g != null && log.protein_g > 0 && (
              <span className="flex items-center gap-0.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-protein)' }} />
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{Math.round(log.protein_g)}</span>
              </span>
            )}
            {log.carbs_g != null && log.carbs_g > 0 && (
              <span className="flex items-center gap-0.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-carbs)' }} />
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{Math.round(log.carbs_g)}</span>
              </span>
            )}
            {log.fat_g != null && log.fat_g > 0 && (
              <span className="flex items-center gap-0.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-fat)' }} />
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{Math.round(log.fat_g)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="ml-3 flex items-center gap-2">
        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
          {log.calories}
        </span>
        <span className="font-body text-xs text-muted-foreground">cal</span>
        {/* Edit/Delete on desktop hover */}
        <div className="hidden items-center gap-1 opacity-0 transition-opacity group-hover:flex group-hover:opacity-100">
          <span className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-coral">
            <Pencil className="h-3 w-3" />
          </span>
        </div>
      </div>
    </button>
  )
}
