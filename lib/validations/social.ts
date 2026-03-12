import { z } from 'zod/v4'

export const createPostSchema = z.object({
  content: z.string().max(2000).optional(),
  post_type: z.enum(['meal', 'workout', 'progress', 'milestone', 'text']),
  media_urls: z.array(z.url()).max(4).default([]),
  food_log_id: z.string().uuid().nullable().optional(),
  visibility: z.enum(['public', 'followers', 'group_only']).default('public'),
}).refine(
  (data) => (data.content && data.content.trim().length > 0) || data.media_urls.length > 0,
  { message: 'Post must have content or media' }
)

export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parent_comment_id: z.string().uuid().nullable().optional(),
})

export const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).nullable().optional(),
  avatar_url: z.url().nullable().optional(),
})

export const feedQuerySchema = z.object({
  type: z.enum(['following', 'explore']).default('explore'),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
})
