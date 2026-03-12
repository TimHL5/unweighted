import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useGamificationStore } from '@/lib/stores/gamification-store'
import type { WaterLog, UserStreak, UserXP, FoodLog, Profile } from '@/lib/types'

interface DashboardResponse {
  daily_totals: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    fiber_g: number
  }
  targets: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    fiber_g: number
  }
  meals: {
    breakfast: FoodLog[]
    lunch: FoodLog[]
    dinner: FoodLog[]
    snack: FoodLog[]
  }
  water_total_ml: number
  streaks: UserStreak[]
  xp: UserXP
  weekly_calories: { date: string; calories: number }[]
  profile: Profile | null
}

export function useDashboardData(date: string) {
  return useQuery<DashboardResponse>({
    queryKey: ['dashboard', date],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?date=${date}`)
      if (!res.ok) throw new Error('Failed to fetch dashboard')
      return res.json()
    },
  })
}

export function useWaterLog(date: string) {
  return useQuery<{ total_ml: number; entries: WaterLog[] }>({
    queryKey: ['water', date],
    queryFn: async () => {
      const res = await fetch(`/api/water?date=${date}`)
      if (!res.ok) throw new Error('Failed to fetch water log')
      return res.json()
    },
  })
}

export function useAddWater(date: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { amount_ml: number; log_date: string }) => {
      const res = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to log water')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['water', date] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', date] })
      useGamificationStore.getState().processGamificationResponse(data?.gamification)
    },
  })
}

export function useDeleteWater(date: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/water/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete water entry')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water', date] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', date] })
    },
  })
}

export function useStreaks() {
  return useQuery<{ streaks: UserStreak[]; xp: UserXP }>({
    queryKey: ['streaks'],
    queryFn: async () => {
      const res = await fetch('/api/streaks')
      if (!res.ok) throw new Error('Failed to fetch streaks')
      return res.json()
    },
  })
}
