import { create } from 'zustand'

interface OnboardingState {
  step: number
  goal_type: 'lose' | 'gain' | 'maintain' | 'recomp' | null
  gender: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say' | null
  date_of_birth: string
  height_cm: number
  current_weight_kg: number
  goal_weight_kg: number
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
  diet_preferences: string[]
  challenges: string[]
  pace_kg_per_week: number
  unit_system: 'imperial' | 'metric'
  // Derived display values for imperial
  height_feet: number
  height_inches: number
  weight_lbs: number
  goal_weight_lbs: number

  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setGoalType: (goal: OnboardingState['goal_type']) => void
  setGender: (gender: OnboardingState['gender']) => void
  setDateOfBirth: (dob: string) => void
  setHeightCm: (cm: number) => void
  setHeightFtIn: (feet: number, inches: number) => void
  setCurrentWeightKg: (kg: number) => void
  setCurrentWeightLbs: (lbs: number) => void
  setGoalWeightKg: (kg: number) => void
  setGoalWeightLbs: (lbs: number) => void
  setActivityLevel: (level: OnboardingState['activity_level']) => void
  toggleDietPreference: (pref: string) => void
  toggleChallenge: (challenge: string) => void
  setPaceKgPerWeek: (pace: number) => void
  setUnitSystem: (system: 'imperial' | 'metric') => void
  reset: () => void
}

const initialState = {
  step: 1,
  goal_type: null as OnboardingState['goal_type'],
  gender: null as OnboardingState['gender'],
  date_of_birth: '',
  height_cm: 175,
  current_weight_kg: 80,
  goal_weight_kg: 75,
  activity_level: null as OnboardingState['activity_level'],
  diet_preferences: [] as string[],
  challenges: [] as string[],
  pace_kg_per_week: 0.5,
  unit_system: 'imperial' as const,
  height_feet: 5,
  height_inches: 9,
  weight_lbs: 176,
  goal_weight_lbs: 165,
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 6) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),

  setGoalType: (goal_type) => set({ goal_type }),
  setGender: (gender) => set({ gender }),
  setDateOfBirth: (date_of_birth) => set({ date_of_birth }),

  setHeightCm: (height_cm) => {
    const totalInches = height_cm / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    set({ height_cm, height_feet: feet, height_inches: inches })
  },

  setHeightFtIn: (feet, inches) => {
    const cm = Math.round((feet * 12 + inches) * 2.54)
    set({ height_feet: feet, height_inches: inches, height_cm: cm })
  },

  setCurrentWeightKg: (kg) => {
    set({ current_weight_kg: kg, weight_lbs: Math.round(kg * 2.20462) })
  },

  setCurrentWeightLbs: (lbs) => {
    set({ weight_lbs: lbs, current_weight_kg: Math.round((lbs / 2.20462) * 10) / 10 })
  },

  setGoalWeightKg: (kg) => {
    set({ goal_weight_kg: kg, goal_weight_lbs: Math.round(kg * 2.20462) })
  },

  setGoalWeightLbs: (lbs) => {
    set({ goal_weight_lbs: lbs, goal_weight_kg: Math.round((lbs / 2.20462) * 10) / 10 })
  },

  setActivityLevel: (activity_level) => set({ activity_level }),

  toggleDietPreference: (pref) =>
    set((s) => {
      if (pref === 'No Preference') {
        return { diet_preferences: s.diet_preferences.includes(pref) ? [] : ['No Preference'] }
      }
      const filtered = s.diet_preferences.filter((p) => p !== 'No Preference')
      return {
        diet_preferences: filtered.includes(pref)
          ? filtered.filter((p) => p !== pref)
          : [...filtered, pref],
      }
    }),

  toggleChallenge: (challenge) =>
    set((s) => ({
      challenges: s.challenges.includes(challenge)
        ? s.challenges.filter((c) => c !== challenge)
        : s.challenges.length < 3
          ? [...s.challenges, challenge]
          : s.challenges,
    })),

  setPaceKgPerWeek: (pace_kg_per_week) => set({ pace_kg_per_week }),

  setUnitSystem: (unit_system) => set({ unit_system }),

  reset: () => set(initialState),
}))
