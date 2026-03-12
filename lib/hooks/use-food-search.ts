import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Food } from '@/lib/types'

export function useFoodSearch(query: string, enabled: boolean = true) {
  return useQuery<{ foods: Food[] }>({
    queryKey: ['food-search', query],
    queryFn: async () => {
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}&limit=20`)
      if (!res.ok) throw new Error('Failed to search foods')
      return res.json()
    },
    enabled: enabled && query.length >= 1,
    staleTime: 60 * 1000,
  })
}

export function useBarcodeLookup(code: string, enabled: boolean = true) {
  return useQuery<{ food: Food }>({
    queryKey: ['barcode', code],
    queryFn: async () => {
      const res = await fetch(`/api/foods/barcode/${code}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('Product not found')
        throw new Error('Barcode lookup failed')
      }
      return res.json()
    },
    enabled: enabled && code.length >= 8,
    retry: false,
  })
}

export function useCreateCustomFood() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      brand?: string | null
      barcode?: string | null
      serving_size_g?: number | null
      serving_unit?: string | null
      calories_per_serving: number
      protein_g?: number | null
      carbs_g?: number | null
      fat_g?: number | null
      fiber_g?: number | null
      sugar_g?: number | null
      sodium_mg?: number | null
    }) => {
      const res = await fetch('/api/foods/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create custom food')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-search'] })
    },
  })
}
