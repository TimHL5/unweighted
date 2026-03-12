'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import { kgToLbs, lbsToKg } from '@/lib/utils/helpers'

interface WeightInputProps {
  value: number | null
  onChange: (kg: number | null) => void
  unitSystem: 'imperial' | 'metric'
}

export function WeightInput({ value, onChange, unitSystem }: WeightInputProps) {
  const isImperial = unitSystem === 'imperial'
  const step = isImperial ? 0.5 : 0.1
  const suffix = isImperial ? 'lbs' : 'kg'

  const displayValue = value !== null
    ? isImperial
      ? Math.round(kgToLbs(value) * 10) / 10
      : Math.round(value * 10) / 10
    : ''

  const handleChange = (displayVal: string) => {
    if (!displayVal) {
      onChange(null)
      return
    }
    const num = parseFloat(displayVal)
    if (isNaN(num)) return
    onChange(isImperial ? lbsToKg(num) : num)
  }

  const adjust = (delta: number) => {
    const currentDisplay = typeof displayValue === 'number' ? displayValue : 0
    const newDisplay = Math.round((currentDisplay + delta) * 10) / 10
    if (newDisplay <= 0) return
    onChange(isImperial ? lbsToKg(newDisplay) : newDisplay)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-12 w-12 shrink-0 rounded-xl border-border/50 text-muted-foreground hover:border-coral/30 hover:text-coral"
        onClick={() => adjust(-step)}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <div className="relative flex-1">
        <Input
          type="number"
          step={step}
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          className="h-12 rounded-xl pr-14 text-center font-mono text-xl font-bold"
          inputMode="decimal"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
          {suffix}
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-12 w-12 shrink-0 rounded-xl border-border/50 text-muted-foreground hover:border-coral/30 hover:text-coral"
        onClick={() => adjust(step)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
