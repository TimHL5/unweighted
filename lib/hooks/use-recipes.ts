import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useGamificationStore } from '@/lib/stores/gamification-store'
import type { Recipe } from '@/lib/types'

export function useRecipes() {
  return useQuery<{ recipes: Recipe[] }>({
    queryKey: ['recipes'],
    queryFn: async () => {
      const res = await fetch('/api/recipes')
      if (!res.ok) throw new Error('Failed to fetch recipes')
      return res.json()
    },
  })
}

export function useRecipe(id: string) {
  return useQuery<{ recipe: Recipe }>({
    queryKey: ['recipes', id],
    queryFn: async () => {
      const res = await fetch(`/api/recipes/${id}`)
      if (!res.ok) throw new Error('Failed to fetch recipe')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string | null
      servings?: number
      prep_time_min?: number | null
      cook_time_min?: number | null
      instructions?: string | null
      is_public?: boolean
      ingredients: {
        food_id: string
        quantity: number
        unit?: string | null
        order_index: number
      }[]
    }) => {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create recipe')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      useGamificationStore.getState().processGamificationResponse(data?.gamification)
    },
  })
}

export function useUpdateRecipe(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name?: string
      description?: string | null
      servings?: number
      prep_time_min?: number | null
      cook_time_min?: number | null
      instructions?: string | null
      is_public?: boolean
      ingredients?: {
        food_id: string
        quantity: number
        unit?: string | null
        order_index: number
      }[]
    }) => {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update recipe')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipes', id] })
    },
  })
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete recipe')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export function useLogRecipe(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      meal_type: string
      log_date: string
      servings?: number
      notes?: string | null
    }) => {
      const res = await fetch(`/api/recipes/${id}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to log recipe')
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['food-log', variables.log_date] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.log_date] })
    },
  })
}
