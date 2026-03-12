import { create } from 'zustand'
import { format } from 'date-fns'
import type { Food, MealType } from '@/lib/types'

interface FoodLogState {
  selectedDate: string
  selectedMealType: MealType
  pendingFood: Partial<Food> | null

  setSelectedDate: (date: string) => void
  setSelectedMealType: (mealType: MealType) => void
  goToNextDay: () => void
  goToPrevDay: () => void
  goToToday: () => void
  setPendingFood: (food: Partial<Food> | null) => void
  reset: () => void
}

const today = () => format(new Date(), 'yyyy-MM-dd')

export const useFoodLogStore = create<FoodLogState>((set) => ({
  selectedDate: today(),
  selectedMealType: 'breakfast',
  pendingFood: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedMealType: (mealType) => set({ selectedMealType: mealType }),

  goToNextDay: () =>
    set((s) => {
      const d = new Date(s.selectedDate)
      d.setDate(d.getDate() + 1)
      return { selectedDate: format(d, 'yyyy-MM-dd') }
    }),

  goToPrevDay: () =>
    set((s) => {
      const d = new Date(s.selectedDate)
      d.setDate(d.getDate() - 1)
      return { selectedDate: format(d, 'yyyy-MM-dd') }
    }),

  goToToday: () => set({ selectedDate: today() }),

  setPendingFood: (food) => set({ pendingFood: food }),

  reset: () =>
    set({
      selectedDate: today(),
      selectedMealType: 'breakfast',
      pendingFood: null,
    }),
}))
