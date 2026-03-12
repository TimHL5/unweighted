'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { Camera, Scale, SmilePlus, Plus, Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Tooltip, CartesianGrid,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { WeightInput } from '@/components/shared/weight-input'
import { RatingSelector } from '@/components/shared/rating-selector'
import { ImageUpload } from '@/components/shared/image-upload'
import { useAuth } from '@/lib/providers/auth-provider'
import {
  useWeightLog, useLogWeight, useDeleteWeight,
  useProgressPhotos, useUploadProgressPhoto,
  useCheckIn, useSaveCheckIn, useCheckInHistory,
} from '@/lib/hooks/use-progress'
import { formatWeight, kgToLbs } from '@/lib/utils/helpers'
import { fadeIn, fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { PhotoType } from '@/lib/types'
import { toast } from 'sonner'

const RANGES = [
  { label: '1W', value: '7' },
  { label: '1M', value: '30' },
  { label: '3M', value: '90' },
  { label: '6M', value: '180' },
  { label: '1Y', value: '365' },
  { label: 'All', value: '3650' },
]

const moodEmojis = ['😫', '😟', '😐', '🙂', '😊']
const energyLabels = ['🪫', '🔋', '🔋', '🔋', '⚡']
const stressLabels = ['😌', '😐', '😰', '😤', '🤯']
const hungerLabels = ['🍽️', '🍴', '🍴', '🍴', '🍴']

const PHOTO_TYPES = ['all', 'front', 'side', 'back'] as const

function ProgressContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { profile } = useAuth()
  const unitSystem = profile?.unit_system || 'metric'
  const defaultTab = searchParams.get('tab') || 'weight'

  const handleTabChange = (value: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', value)
    router.replace(url.pathname + url.search, { scroll: false })
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-4 pb-20"
    >
      <h1 className="font-display text-2xl font-bold">Progress</h1>

      <Tabs defaultValue={defaultTab} onValueChange={handleTabChange}>
        <TabsList className="w-full bg-muted/50">
          <TabsTrigger value="weight" className="flex-1 font-medium">
            <Scale className="mr-1.5 h-3.5 w-3.5" /> Weight
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex-1 font-medium">
            <Camera className="mr-1.5 h-3.5 w-3.5" /> Photos
          </TabsTrigger>
          <TabsTrigger value="checkin" className="flex-1 font-medium">
            <SmilePlus className="mr-1.5 h-3.5 w-3.5" /> Check-in
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weight">
          <WeightTab unitSystem={unitSystem} />
        </TabsContent>
        <TabsContent value="photos">
          <PhotosTab />
        </TabsContent>
        <TabsContent value="checkin">
          <CheckInTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

// ─── Weight Tab ──────────────────────────────
function WeightTab({ unitSystem }: { unitSystem: 'imperial' | 'metric' }) {
  const [range, setRange] = useState('90')
  const [logOpen, setLogOpen] = useState(false)
  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [bodyFat, setBodyFat] = useState('')
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useWeightLog(range)
  const logMutation = useLogWeight()
  const deleteMutation = useDeleteWeight()

  const entries = data?.entries || []
  const goalKg = data?.goal_weight_kg

  // Calculate 7-day moving average
  const chartData = entries.map((e, i) => {
    const weight = unitSystem === 'imperial' ? Math.round(kgToLbs(e.weight_kg) * 10) / 10 : e.weight_kg
    // Moving average: take last 7 entries or fewer
    const start = Math.max(0, i - 6)
    const slice = entries.slice(start, i + 1)
    const avg = slice.reduce((sum, s) => sum + s.weight_kg, 0) / slice.length
    const trendWeight = unitSystem === 'imperial' ? Math.round(kgToLbs(avg) * 10) / 10 : Math.round(avg * 10) / 10

    return {
      date: format(parseISO(e.log_date), 'MMM d'),
      weight,
      trend: trendWeight,
    }
  })

  const first = entries[0]
  const last = entries[entries.length - 1]
  const startWeight = first ? first.weight_kg : null
  const currentWeight = last ? last.weight_kg : null
  const change = startWeight && currentWeight ? currentWeight - startWeight : null
  const goalWeight = goalKg

  // Determine trend direction
  const trendingTowardGoal = goalWeight && currentWeight && startWeight
    ? (goalWeight < startWeight ? change! < 0 : change! > 0)
    : null

  const handleLog = async () => {
    if (!weightKg) {
      toast.error('Enter your weight')
      return
    }
    try {
      await logMutation.mutateAsync({
        weight_kg: weightKg,
        body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
        log_date: logDate,
        notes: notes || null,
      })
      toast.success('Weight logged')
      setLogOpen(false)
      setWeightKg(null)
      setBodyFat('')
      setNotes('')
    } catch {
      toast.error('Failed to log weight')
    }
  }

  const goalDisplay = goalKg
    ? unitSystem === 'imperial'
      ? Math.round(kgToLbs(goalKg) * 10) / 10
      : goalKg
    : null

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4 pt-4">
      {/* Actions row */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <Button
          className="bg-coral hover:bg-coral/90 text-white"
          onClick={() => setLogOpen(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" /> Log Weight
        </Button>
        <div className="flex gap-0.5 rounded-full bg-muted p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-medium transition-all',
                range === r.value
                  ? 'bg-coral text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div variants={fadeInUp}>
        {isLoading ? (
          <Skeleton className="h-56 w-full rounded-2xl" />
        ) : chartData.length > 1 ? (
          <Card className="overflow-hidden">
            <CardContent className="px-2 py-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                      width={45}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} ${unitSystem === 'imperial' ? 'lbs' : 'kg'}`,
                        name === 'trend' ? '7-day average' : 'Weight',
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--card)',
                        fontSize: '12px',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                    {goalDisplay && (
                      <ReferenceLine
                        y={goalDisplay}
                        stroke="#22C55E"
                        strokeDasharray="6 4"
                        strokeOpacity={0.6}
                        label={{ value: 'Goal', position: 'right', fontSize: 10, fill: '#22C55E' }}
                      />
                    )}
                    {/* Trend line (dashed) */}
                    <Line
                      type="monotone"
                      dataKey="trend"
                      stroke="var(--muted-foreground)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      strokeOpacity={0.5}
                    />
                    {/* Actual weight line */}
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke={trendingTowardGoal === true ? '#22C55E' : trendingTowardGoal === false ? '#FF4D6A' : '#FF4D6A'}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: trendingTowardGoal === true ? '#22C55E' : '#FF4D6A', strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--card)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Scale className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 font-display text-sm font-bold text-muted-foreground">
                Log at least 2 entries to see your chart
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Stats row */}
      {startWeight && currentWeight && (
        <motion.div variants={fadeInUp} className="grid grid-cols-4 gap-2">
          {[
            { label: 'Starting', value: formatWeight(startWeight, unitSystem) },
            { label: 'Current', value: formatWeight(currentWeight, unitSystem) },
            {
              label: 'Goal',
              value: goalWeight ? formatWeight(goalWeight, unitSystem) : '--',
            },
            {
              label: 'Change',
              value: change !== null
                ? `${change > 0 ? '+' : ''}${formatWeight(Math.abs(change), unitSystem)}`
                : '--',
              color: change && change < 0 ? 'text-green' : change && change > 0 ? 'text-coral' : '',
              icon: change && change < 0 ? TrendingDown : change && change > 0 ? TrendingUp : Minus,
            },
          ].map((stat) => {
            const Icon = (stat as { icon?: typeof TrendingDown }).icon
            return (
              <Card key={stat.label}>
                <CardContent className="py-3 text-center">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    {Icon && <Icon className={cn('h-3 w-3', (stat as { color?: string }).color)} />}
                    <p className={cn('font-mono text-sm font-bold', (stat as { color?: string }).color)}>
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </motion.div>
      )}

      {/* Recent entries */}
      {entries.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-2">
          <h3 className="font-display text-sm font-bold">Recent Entries</h3>
          {[...entries]
            .reverse()
            .slice(0, 10)
            .map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-2.5 transition-colors hover:bg-muted"
              >
                <div>
                  <p className="font-mono text-sm font-bold">
                    {formatWeight(entry.weight_kg, unitSystem)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(entry.log_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={async () => {
                    await deleteMutation.mutateAsync(entry.id)
                    toast.success('Entry deleted')
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
        </motion.div>
      )}

      {/* Log Sheet */}
      <Sheet open={logOpen} onOpenChange={setLogOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display">Log Weight</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Weight</Label>
              <WeightInput value={weightKg} onChange={setWeightKg} unitSystem={unitSystem} />
            </div>
            <div className="space-y-2">
              <Label>Body Fat % (optional)</Label>
              <Input
                type="number"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="e.g. 15"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. after breakfast" />
            </div>
            <Button
              className="w-full bg-coral hover:bg-coral/90 text-white"
              onClick={handleLog}
              disabled={logMutation.isPending}
              size="lg"
            >
              Save Weight
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}

// ─── Photos Tab ──────────────────────────────
function PhotosTab() {
  const { data, isLoading } = useProgressPhotos()
  const uploadMutation = useUploadProgressPhoto()
  const { profile } = useAuth()

  const [addOpen, setAddOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoType, setPhotoType] = useState<PhotoType>('front')
  const [photoDate, setPhotoDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [photoWeight, setPhotoWeight] = useState('')
  const [viewUrl, setViewUrl] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<typeof PHOTO_TYPES[number]>('all')

  const photos = data?.photos || []
  const filteredPhotos =
    filterType === 'all' ? photos : photos.filter((p) => p.photo_type === filterType)

  const handleSavePhoto = async () => {
    if (!photoUrl) {
      toast.error('Upload a photo first')
      return
    }
    try {
      await uploadMutation.mutateAsync({
        image_url: photoUrl,
        photo_type: photoType,
        log_date: photoDate,
        weight_at_time: photoWeight ? parseFloat(photoWeight) : null,
      })
      toast.success('Photo saved')
      setAddOpen(false)
      setPhotoUrl('')
    } catch {
      toast.error('Failed to save photo')
    }
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4 pt-4">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <Button
          className="bg-coral hover:bg-coral/90 text-white"
          onClick={() => setAddOpen(true)}
        >
          <Camera className="mr-1.5 h-4 w-4" /> Add Photo
        </Button>

        {/* Filter tabs */}
        <div className="flex gap-0.5 rounded-full bg-muted p-0.5">
          {PHOTO_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-medium capitalize transition-all',
                filterType === t
                  ? 'bg-coral text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <motion.div variants={fadeInUp}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Camera className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h3 className="mt-4 font-display text-base font-bold">Track your transformation</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Upload progress photos to see your changes over time
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-3 gap-2 md:grid-cols-4"
        >
          {filteredPhotos.map((photo) => (
            <motion.button
              key={photo.id}
              variants={fadeInUp}
              type="button"
              onClick={() => setViewUrl(photo.image_url)}
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.image_url}
                alt={photo.photo_type}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2">
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 capitalize">
                  {photo.photo_type}
                </Badge>
                <p className="mt-0.5 text-[10px] text-white/80">
                  {format(parseISO(photo.log_date), 'MMM d')}
                </p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Add Photo Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display">Add Progress Photo</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 overflow-y-auto">
            <ImageUpload
              bucket="progress-photos"
              folder={profile?.id || 'unknown'}
              onUploadComplete={setPhotoUrl}
            />
            <div className="space-y-2">
              <Label>Photo Type</Label>
              <div className="flex gap-2">
                {(['front', 'side', 'back'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPhotoType(t)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all',
                      photoType === t
                        ? 'bg-coral text-white shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={photoDate} onChange={(e) => setPhotoDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Weight at time (optional)</Label>
              <Input
                type="number"
                value={photoWeight}
                onChange={(e) => setPhotoWeight(e.target.value)}
                placeholder="kg"
                inputMode="decimal"
              />
            </div>
            <Button
              className="w-full bg-coral hover:bg-coral/90 text-white"
              onClick={handleSavePhoto}
              disabled={uploadMutation.isPending || !photoUrl}
              size="lg"
            >
              Save Photo
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* View Photo Dialog */}
      <Dialog open={!!viewUrl} onOpenChange={() => setViewUrl(null)}>
        <DialogContent className="max-w-lg overflow-hidden rounded-2xl p-0">
          {viewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={viewUrl} alt="Progress photo" className="w-full rounded-2xl" />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ─── Check-in Tab ──────────────────────────────
function CheckInTab() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [selectedDate] = useState(today)

  const { data: checkInData } = useCheckIn(selectedDate)
  const saveMutation = useSaveCheckIn()
  const { data: historyData } = useCheckInHistory(7)

  const existing = checkInData?.check_in

  const [mood, setMood] = useState<number | null>(null)
  const [energy, setEnergy] = useState<number | null>(null)
  const [sleepHours, setSleepHours] = useState('')
  const [sleepQuality, setSleepQuality] = useState<number | null>(null)
  const [stress, setStress] = useState<number | null>(null)
  const [hunger, setHunger] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  // Pre-populate when existing check-in loads
  const [populated, setPopulated] = useState(false)
  if (existing && !populated) {
    setMood(existing.mood)
    setEnergy(existing.energy)
    setSleepHours(existing.sleep_hours ? String(existing.sleep_hours) : '')
    setSleepQuality(existing.sleep_quality)
    setStress(existing.stress_level)
    setHunger(existing.hunger_level)
    setNotes(existing.notes || '')
    setPopulated(true)
  }

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        check_in_date: selectedDate,
        mood,
        energy,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
        sleep_quality: sleepQuality,
        stress_level: stress,
        hunger_level: hunger,
        notes: notes || null,
      })
      toast.success('Check-in saved')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error('Failed to save check-in')
    }
  }

  const history = historyData?.check_ins || []

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 pt-4">
      <motion.div variants={fadeInUp}>
        <Card>
          <CardContent className="space-y-5 py-5">
            {/* Mood - Emoji scale */}
            <div className="space-y-2">
              <Label className="font-display font-bold">How are you feeling?</Label>
              <RatingSelector value={mood} onChange={setMood} icons={moodEmojis} />
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <Label className="font-display font-bold">Energy Level</Label>
              <RatingSelector value={energy} onChange={setEnergy} icons={energyLabels} />
            </div>

            {/* Sleep */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-display font-bold">Sleep (hours)</Label>
                <Input
                  type="number"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  placeholder="e.g. 7.5"
                  inputMode="decimal"
                  step={0.5}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-display font-bold">Sleep Quality</Label>
                <RatingSelector
                  value={sleepQuality}
                  onChange={setSleepQuality}
                  labels={['1', '2', '3', '4', '5']}
                  size="sm"
                />
              </div>
            </div>

            {/* Stress */}
            <div className="space-y-2">
              <Label className="font-display font-bold">Stress Level</Label>
              <RatingSelector value={stress} onChange={setStress} icons={stressLabels} />
            </div>

            {/* Hunger */}
            <div className="space-y-2">
              <Label className="font-display font-bold">Hunger Level</Label>
              <RatingSelector value={hunger} onChange={setHunger} icons={hungerLabels} />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="font-display font-bold">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you doing today?"
                rows={3}
                className="resize-none"
              />
            </div>

            <Button
              className={cn(
                'w-full text-white transition-all',
                saved
                  ? 'bg-green hover:bg-green/90'
                  : 'bg-coral hover:bg-coral/90'
              )}
              onClick={handleSave}
              disabled={saveMutation.isPending}
              size="lg"
            >
              {saved ? (
                <>
                  <SmilePlus className="mr-1.5 h-4 w-4" />
                  Saved! You&apos;re doing great
                </>
              ) : existing ? (
                'Update Check-in'
              ) : (
                'Save Check-in'
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Check-ins - Weekly patterns */}
      {history.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <h3 className="font-display text-sm font-bold">This Week</h3>
          <div className="flex gap-1.5">
            {history.map((ci) => (
              <Card key={ci.id} className="flex-1 overflow-hidden">
                <CardContent className="flex flex-col items-center gap-1 py-2.5 px-1">
                  <span className="text-lg">
                    {ci.mood ? moodEmojis[ci.mood - 1] : '—'}
                  </span>
                  <span className="text-[10px] font-medium">
                    {format(parseISO(ci.check_in_date), 'EEE')}
                  </span>
                  <div className="flex flex-col items-center gap-0.5 text-[9px] text-muted-foreground">
                    <span>E: <span className="font-mono">{ci.energy || '—'}</span></span>
                    <span>
                      {ci.sleep_hours ? (
                        <span className="font-mono">{ci.sleep_hours}h</span>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function ProgressPage() {
  return (
    <Suspense fallback={<div className="p-4"><Skeleton className="h-8 w-32" /></div>}>
      <ProgressContent />
    </Suspense>
  )
}
