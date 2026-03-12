import { z } from 'zod/v4'

export const weightLogSchema = z.object({
  weight_kg: z.number().min(20).max(500),
  body_fat_pct: z.number().min(1).max(70).nullable().optional(),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).nullable().optional(),
})

export const progressPhotoSchema = z.object({
  image_url: z.url(),
  photo_type: z.enum(['front', 'side', 'back']),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weight_at_time: z.number().min(20).max(500).nullable().optional(),
})

export const checkInSchema = z.object({
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: z.number().int().min(1).max(5).nullable().optional(),
  energy: z.number().int().min(1).max(5).nullable().optional(),
  sleep_hours: z.number().min(0).max(24).nullable().optional(),
  sleep_quality: z.number().int().min(1).max(5).nullable().optional(),
  stress_level: z.number().int().min(1).max(5).nullable().optional(),
  hunger_level: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
})
