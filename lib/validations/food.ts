import { z } from 'zod/v4'

export const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export const foodSearchSchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().min(1).max(50).default(20),
})

export const customFoodSchema = z.object({
  name: z.string().min(1).max(200),
  brand: z.string().max(200).nullable().optional(),
  barcode: z.string().max(50).nullable().optional(),
  serving_size_g: z.number().min(0).nullable().optional(),
  serving_unit: z.string().max(50).nullable().optional(),
  calories_per_serving: z.number().min(0).max(10000),
  protein_g: z.number().min(0).nullable().optional(),
  carbs_g: z.number().min(0).nullable().optional(),
  fat_g: z.number().min(0).nullable().optional(),
  fiber_g: z.number().min(0).nullable().optional(),
  sugar_g: z.number().min(0).nullable().optional(),
  sodium_mg: z.number().min(0).nullable().optional(),
})

export const foodLogCreateSchema = z.object({
  food_id: z.string().uuid().nullable().optional(),
  recipe_id: z.string().uuid().nullable().optional(),
  meal_type: z.enum(mealTypes),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  servings: z.number().min(0.1).max(100),
  calories: z.number().min(0).optional(),
  protein_g: z.number().min(0).nullable().optional(),
  carbs_g: z.number().min(0).nullable().optional(),
  fat_g: z.number().min(0).nullable().optional(),
  fiber_g: z.number().min(0).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

export const foodLogUpdateSchema = z.object({
  meal_type: z.enum(mealTypes).optional(),
  servings: z.number().min(0.1).max(100).optional(),
  notes: z.string().max(500).nullable().optional(),
})

export const quickAddSchema = z.object({
  meal_type: z.enum(mealTypes),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  calories: z.number().min(1).max(10000),
  notes: z.string().max(500).nullable().optional(),
})

export const waterLogSchema = z.object({
  amount_ml: z.number().min(1).max(10000),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})
