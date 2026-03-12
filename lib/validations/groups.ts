import { z } from 'zod/v4'

export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  goal_type: z.enum(['lose', 'gain', 'maintain', 'recomp']).nullable().optional(),
  max_members: z.coerce.number().int().min(2).max(6).default(4),
})

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  goal_type: z.enum(['lose', 'gain', 'maintain', 'recomp']).nullable().optional(),
  max_members: z.coerce.number().int().min(2).max(6).optional(),
  is_active: z.boolean().optional(),
})

export const joinGroupSchema = z.object({
  invite_code: z.string().length(6),
})

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  message_type: z.enum(['text', 'image']).default('text'),
  media_url: z.url().nullable().optional(),
})
