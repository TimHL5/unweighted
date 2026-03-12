import { type PlanTier, TIER_RANK } from '@/lib/stripe/config'

export type GatedFeature =
  | 'custom_foods_unlimited'
  | 'recipes'
  | 'groups'
  | 'all_achievements'

const FEATURE_REQUIREMENTS: Record<GatedFeature, PlanTier> = {
  custom_foods_unlimited: 'pro',
  recipes: 'pro',
  groups: 'pro',
  all_achievements: 'pro',
}

export function canAccess(userTier: PlanTier, feature: GatedFeature): boolean {
  const requiredTier = FEATURE_REQUIREMENTS[feature]
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier]
}

export function getRequiredTier(feature: GatedFeature): PlanTier {
  return FEATURE_REQUIREMENTS[feature]
}

export const FREE_TIER_LIMITS = {
  custom_foods: 3,
}
