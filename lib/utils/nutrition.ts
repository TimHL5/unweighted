import { addWeeks, format } from 'date-fns'
import type { OnboardingData, NutritionTargets } from '@/lib/types'

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

// 1 kg of body weight change ≈ 7700 calories
const CALORIES_PER_KG = 7700

export function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birth = new Date(dateOfBirth)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age: number,
  gender: string
): number {
  const maleBMR = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
  const femaleBMR = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

  switch (gender) {
    case 'male':
      return maleBMR
    case 'female':
      return femaleBMR
    default:
      // Non-binary / prefer not to say: average of male and female formulas
      return (maleBMR + femaleBMR) / 2
  }
}

export function calculateTDEE(bmr: number, activity_level: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activity_level] || 1.55
  return Math.round(bmr * multiplier)
}

export function calculateMacros(
  target_calories: number,
  weight_kg: number
): { protein_g: number; carbs_g: number; fat_g: number; fiber_g: number } {
  // Protein: 2.0g per kg bodyweight, capped at 35% of total calories
  let protein_g = Math.round(weight_kg * 2.0)
  const proteinCalories = protein_g * 4
  const maxProteinCalories = target_calories * 0.35
  if (proteinCalories > maxProteinCalories) {
    protein_g = Math.round(maxProteinCalories / 4)
  }

  // Fat: 30% of calories / 9 = grams
  const fat_g = Math.round((target_calories * 0.3) / 9)

  // Carbs: remaining calories / 4 = grams
  const remainingCalories = target_calories - protein_g * 4 - fat_g * 9
  const carbs_g = Math.round(Math.max(0, remainingCalories) / 4)

  // Fiber: 14g per 1000 calories
  const fiber_g = Math.round((target_calories / 1000) * 14)

  return { protein_g, carbs_g, fat_g, fiber_g }
}

export function calculateTargets(data: OnboardingData): NutritionTargets {
  const age = calculateAge(data.date_of_birth)
  const bmr = calculateBMR(data.current_weight_kg, data.height_cm, age, data.gender)
  const tdee = calculateTDEE(bmr, data.activity_level)

  let daily_calories: number
  let projected_goal_date: string

  switch (data.goal_type) {
    case 'lose': {
      const dailyDeficit = (data.pace_kg_per_week * CALORIES_PER_KG) / 7
      daily_calories = Math.round(Math.max(1200, tdee - dailyDeficit))
      const weightToLose = data.current_weight_kg - data.goal_weight_kg
      const weeksToGoal = Math.ceil(weightToLose / data.pace_kg_per_week)
      projected_goal_date = format(addWeeks(new Date(), weeksToGoal), 'yyyy-MM-dd')
      break
    }
    case 'gain': {
      const dailySurplus = (data.pace_kg_per_week * CALORIES_PER_KG) / 7
      daily_calories = Math.round(tdee + dailySurplus)
      const weightToGain = data.goal_weight_kg - data.current_weight_kg
      const weeksToGoal = Math.ceil(weightToGain / data.pace_kg_per_week)
      projected_goal_date = format(addWeeks(new Date(), weeksToGoal), 'yyyy-MM-dd')
      break
    }
    case 'maintain':
    case 'recomp':
    default: {
      daily_calories = tdee
      projected_goal_date = format(addWeeks(new Date(), 12), 'yyyy-MM-dd')
      break
    }
  }

  const macros = calculateMacros(daily_calories, data.current_weight_kg)

  return {
    bmr: Math.round(bmr),
    tdee,
    daily_calories,
    ...macros,
    projected_goal_date,
  }
}
