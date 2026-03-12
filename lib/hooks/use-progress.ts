import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useGamificationStore } from '@/lib/stores/gamification-store'
import type { WeightLog, ProgressPhoto, DailyCheckIn } from '@/lib/types'

export function useWeightLog(range: string = '90') {
  return useQuery<{ entries: WeightLog[]; goal_weight_kg: number | null }>({
    queryKey: ['weight-log', range],
    queryFn: async () => {
      const res = await fetch(`/api/weight?range=${range}`)
      if (!res.ok) throw new Error('Failed to fetch weight log')
      return res.json()
    },
  })
}

export function useLogWeight() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      weight_kg: number
      body_fat_pct?: number | null
      log_date: string
      notes?: string | null
    }) => {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to log weight')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['weight-log'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['streaks'] })
      useGamificationStore.getState().processGamificationResponse(data?.gamification)
    },
  })
}

export function useDeleteWeight() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/weight/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete weight entry')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight-log'] })
    },
  })
}

export function useProgressPhotos() {
  return useQuery<{ photos: ProgressPhoto[] }>({
    queryKey: ['progress-photos'],
    queryFn: async () => {
      const res = await fetch('/api/progress/photos')
      if (!res.ok) throw new Error('Failed to fetch progress photos')
      return res.json()
    },
  })
}

export function useUploadProgressPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      image_url: string
      photo_type: 'front' | 'side' | 'back'
      log_date: string
      weight_at_time?: number | null
    }) => {
      const res = await fetch('/api/progress/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to upload progress photo')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['progress-photos'] })
      useGamificationStore.getState().processGamificationResponse(data?.gamification)
    },
  })
}

export function useCheckIn(date: string) {
  return useQuery<{ check_in: DailyCheckIn | null }>({
    queryKey: ['check-in', date],
    queryFn: async () => {
      const res = await fetch(`/api/check-in?date=${date}`)
      if (!res.ok) throw new Error('Failed to fetch check-in')
      return res.json()
    },
    enabled: !!date,
  })
}

export function useSaveCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      check_in_date: string
      mood?: number | null
      energy?: number | null
      sleep_hours?: number | null
      sleep_quality?: number | null
      stress_level?: number | null
      hunger_level?: number | null
      notes?: string | null
    }) => {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to save check-in')
      return res.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['check-in', variables.check_in_date] })
      queryClient.invalidateQueries({ queryKey: ['check-in-history'] })
      queryClient.invalidateQueries({ queryKey: ['streaks'] })
      useGamificationStore.getState().processGamificationResponse(data?.gamification)
    },
  })
}

export function useCheckInHistory(limit: number = 14) {
  return useQuery<{ check_ins: DailyCheckIn[] }>({
    queryKey: ['check-in-history', limit],
    queryFn: async () => {
      const res = await fetch(`/api/check-in/history?limit=${limit}`)
      if (!res.ok) throw new Error('Failed to fetch check-in history')
      return res.json()
    },
  })
}
