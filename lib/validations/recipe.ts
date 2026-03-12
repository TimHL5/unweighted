import { z } from 'zod/v4'

export const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export const recipeIngredientSchema = z.object({
  food_id: z.string().uuid(),
  quantity: z.number().min(0.1).max(10000),
  unit: z.string().max(50).nullable().optional(),
  order_index: z.number().int().min(0),
})

export const recipeCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  servings: z.number().int().min(1).max(100).default(1),
  prep_time_min: z.number().int().min(0).nullable().optional(),
  cook_time_min: z.number().int().min(0).nullable().optional(),
  instructions: z.string().max(10000).nullable().optional(),
  is_public: z.boolean().default(false),
  ingredients: z.array(recipeIngredientSchema).min(1),
})

export const recipeUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  servings: z.number().int().min(1).max(100).optional(),
  prep_time_min: z.number().int().min(0).nullable().optional(),
  cook_time_min: z.number().int().min(0).nullable().optional(),
  instructions: z.string().max(10000).nullable().optional(),
  is_public: z.boolean().optional(),
  ingredients: z.array(recipeIngredientSchema).min(1).optional(),
})

export const recipeLogSchema = z.object({
  meal_type: z.enum(mealTypes),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  servings: z.number().min(0.1).max(100).default(1),
  notes: z.string().max(500).nullable().optional(),
})
