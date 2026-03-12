/**
 * Stripe Configuration
 *
 * Setup instructions:
 * 1. Create a Stripe account at https://stripe.com
 * 2. In the Stripe Dashboard, create two products:
 *    - "Unweighted Pro" with monthly ($9.99) and yearly ($79.99) prices
 *    - "Unweighted Premium" with monthly ($14.99) and yearly ($119.99) prices
 * 3. Copy the price IDs (price_xxx) to your .env file:
 *    - STRIPE_PRO_MONTHLY_PRICE_ID
 *    - STRIPE_PRO_YEARLY_PRICE_ID
 *    - STRIPE_PREMIUM_MONTHLY_PRICE_ID
 *    - STRIPE_PREMIUM_YEARLY_PRICE_ID
 * 4. Or run `npx tsx scripts/stripe-setup.ts` to create them automatically
 */

import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    })
  }
  return _stripe
}

export type PlanTier = 'free' | 'pro' | 'premium'

export interface PlanPrice {
  monthlyPriceId: string
  yearlyPriceId: string
  monthlyAmount: number // cents
  yearlyAmount: number // cents
}

export interface Plan {
  tier: PlanTier
  name: string
  description: string
  features: string[]
  prices: PlanPrice | null
}

export const PLANS: Plan[] = [
  {
    tier: 'free',
    name: 'Free',
    description: 'Get started with basic tracking',
    features: [
      'Food logging with USDA database',
      'Water tracking',
      'Weight logging',
      'Daily check-ins',
      'Up to 3 custom foods',
      'Basic achievements',
    ],
    prices: null,
  },
  {
    tier: 'pro',
    name: 'Pro',
    description: 'Unlock the full experience',
    features: [
      'Everything in Free',
      'Unlimited custom foods',
      'Recipe creation & tracking',
      'Accountability groups',
      'All achievements & challenges',
      'Priority support',
    ],
    prices: {
      monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
      yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
      monthlyAmount: 999,
      yearlyAmount: 7999,
    },
  },
  {
    tier: 'premium',
    name: 'Premium',
    description: 'For the most dedicated trackers',
    features: [
      'Everything in Pro',
      'Advanced analytics & insights',
      'Custom macro presets',
      'Export data (CSV/PDF)',
      'Early access to new features',
    ],
    prices: {
      monthlyPriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
      yearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
      monthlyAmount: 1499,
      yearlyAmount: 11999,
    },
  },
]

const priceIdToTier: Record<string, PlanTier> = {}

function buildPriceMap() {
  for (const plan of PLANS) {
    if (plan.prices) {
      if (plan.prices.monthlyPriceId) priceIdToTier[plan.prices.monthlyPriceId] = plan.tier
      if (plan.prices.yearlyPriceId) priceIdToTier[plan.prices.yearlyPriceId] = plan.tier
    }
  }
}

buildPriceMap()

export function tierFromPriceId(priceId: string): PlanTier | null {
  return priceIdToTier[priceId] || null
}

export const TIER_RANK: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  premium: 2,
}
