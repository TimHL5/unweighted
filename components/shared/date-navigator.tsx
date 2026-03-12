'use client'

import { format, parseISO, isToday, addDays, subDays, startOfWeek, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DateNavigatorProps {
  date: string // YYYY-MM-DD
  onDateChange: (date: string) => void
}

export function DateNavigator({ date, onDateChange }: DateNavigatorProps) {
  const [open, setOpen] = useState(false)
  const parsed = parseISO(date)
  const isCurrentDay = isToday(parsed)

  // Generate week days centered around selected date
  const weekStart = startOfWeek(parsed, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const goToPrev = () => {
    onDateChange(format(subDays(parsed, 1), 'yyyy-MM-dd'))
  }

  const goToNext = () => {
    onDateChange(format(addDays(parsed, 1), 'yyyy-MM-dd'))
  }

  const goToToday = () => {
    onDateChange(format(new Date(), 'yyyy-MM-dd'))
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Compact date picker */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          onClick={goToPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="min-w-[120px] font-display text-sm font-semibold"
            >
              {isCurrentDay ? 'Today' : format(parsed, 'EEE, MMM d')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={parsed}
              onSelect={(day) => {
                if (day) {
                  onDateChange(format(day, 'yyyy-MM-dd'))
                  setOpen(false)
                }
              }}
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          onClick={goToNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <AnimatePresence>
          {!isCurrentDay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="ml-1 h-7 rounded-full border-coral/30 px-3 text-xs font-medium text-coral hover:bg-coral/10"
                onClick={goToToday}
              >
                Today
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Week day strip */}
      <div className="flex gap-1">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, parsed)
          const isTodayDot = isToday(day)
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDateChange(format(day, 'yyyy-MM-dd'))}
              className={`flex h-10 w-10 flex-col items-center justify-center rounded-xl text-xs transition-all ${
                isSelected
                  ? 'bg-coral text-white shadow-md shadow-coral/20'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className="text-[10px] font-medium uppercase leading-none">
                {format(day, 'EEE').charAt(0)}
              </span>
              <span className={`font-mono text-xs font-semibold leading-tight ${isSelected ? '' : ''}`}>
                {format(day, 'd')}
              </span>
              {isTodayDot && !isSelected && (
                <div className="mt-0.5 h-1 w-1 rounded-full bg-coral" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
