import { useQuery, useMutation } from '@tanstack/react-query'

interface BillingStatus {
  tier: 'free' | 'pro' | 'premium'
  status: string | null
  subscription: {
    id: string
    status: string
    current_period_end: number
    cancel_at_period_end: boolean
    plan_amount: number | null
    plan_interval: string | null
  } | null
}

export function useBillingStatus() {
  return useQuery<BillingStatus>({
    queryKey: ['billing-status'],
    queryFn: async () => {
      const res = await fetch('/api/billing/status')
      if (!res.ok) throw new Error('Failed to fetch billing status')
      return res.json()
    },
  })
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (params: { tier: string; interval: 'monthly' | 'yearly' }) => {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!res.ok) throw new Error('Failed to create checkout session')
      const data = await res.json()
      return data as { url: string }
    },
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })
}

export function usePortal() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to create portal session')
      const data = await res.json()
      return data as { url: string }
    },
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })
}
