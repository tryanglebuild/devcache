// Validation schemas for Skills System using Zod

import { z } from 'zod'

export const createSkillSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  category: z.enum(['general', 'coding', 'writing', 'analysis', 'custom']).optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  priority: z.number().int().min(0).max(100).optional(),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(100000, 'Content must be less than 100KB'),
})

export const updateSkillSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores')
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  category: z.enum(['general', 'coding', 'writing', 'analysis', 'custom']).optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  priority: z.number().int().min(0).max(100).optional(),
  is_active: z.boolean().optional(),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(100000, 'Content must be less than 100KB')
    .optional(),
})

export const uploadSkillSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  category: z.enum(['general', 'coding', 'writing', 'analysis', 'custom']).optional(),
  tags: z.string().optional(), // Comma-separated
  priority: z.number().int().min(0).max(100).optional(),
  file: z.instanceof(File)
    .refine(file => file.size <= 1024 * 1024, 'File must be less than 1MB')
    .refine(
      file => file.name.endsWith('.md') || file.name.endsWith('.markdown'),
      'Only Markdown files are allowed'
    ),
})

// Helper function to validate and parse
export function validateCreateSkill(data: unknown) {
  return createSkillSchema.parse(data)
}

export function validateUpdateSkill(data: unknown) {
  return updateSkillSchema.parse(data)
}

export function validateUploadSkill(data: unknown) {
  return uploadSkillSchema.parse(data)
}
