import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useGamificationStore } from '@/lib/stores/gamification-store'
import type { DailyFoodLogResponse, MealType } from '@/lib/types'

export function useDailyFoodLog(date: string) {
  return useQuery<DailyFoodLogResponse>({
    queryKey: ['food-log', date],
    queryFn: async () => {
      const res = await fetch(`/api/food-log?date=${date}`)
      if (!res.ok) throw new Error('Failed to fetch food log')
      return res.json()
    },
  })
}

export function useLogFood(date: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      food_id?: string | null
      recipe_id?: string | null
      meal_type: MealType
      log_date: string
      servings: number
      calories?: number
      protein_g?: number | null
      carbs_g?: number | null
      fat_g?: number | null
      fiber_g?: number | null
      notes?: string | null
    }) => {
      const res = await fetch('/api/food-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to log food')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['food-log', date] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', date] })
      queryClient.invalidateQueries({ queryKey: ['food-log-recent'] })
      useGamificationStore.getState().processGamificationResponse(data?.gamification)
    },
  })
}

export function useUpdateFoodLog(date: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string
      meal_type?: MealType
      servings?: number
      notes?: string | null
    }) => {
      const res = await fetch(`/api/food-log/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update food log')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-log', date] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', date] })
    },
  })
}

export function useDeleteFoodLog(date: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/food-log/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete food log')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-log', date] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', date] })
    },
  })
}

export function useQuickAdd(date: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      meal_type: MealType
      log_date: string
      calories: number
      notes?: string | null
    }) => {
      const res = await fetch('/api/food-log/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to quick add')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['food-log', date] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', date] })
      useGamificationStore.getState().processGamificationResponse(data?.gamification)
    },
  })
}

export function useRecentFoods() {
  return useQuery({
    queryKey: ['food-log-recent'],
    queryFn: async () => {
      const res = await fetch('/api/food-log/recent')
      if (!res.ok) throw new Error('Failed to fetch recent foods')
      return res.json()
    },
  })
}
