/**
 * Agent Template Validation Schemas
 * 
 * Zod schemas for validating agent template data
 */

import { z } from 'zod'

// Agent categories
export const agentCategories = [
  'backend',
  'frontend',
  'fullstack',
  'devops',
  'security',
  'testing',
  'documentation',
  'code-review',
  'debugging',
  'optimization',
  'general',
] as const

// Visibility options
export const visibilityOptions = ['private', 'public', 'unlisted'] as const

/**
 * Create Agent Template Schema
 */
export const createAgentSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_()]+$/,
      'Name can only contain letters, numbers, spaces, hyphens, underscores, and parentheses'
    ),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters')
    .max(1024 * 1024, 'Content must be less than 1MB'),
  category: z.enum(agentCategories),
  tags: z
    .array(z.string().min(1).max(50))
    .max(20, 'Maximum 20 tags allowed')
    .optional()
    .default([]),
  visibility: z.enum(visibilityOptions).default('private'),
  behavioral_rules: z
    .string()
    .max(5000, 'Behavioral rules must be less than 5000 characters')
    .optional(),
  example_workflows: z
    .string()
    .max(5000, 'Example workflows must be less than 5000 characters')
    .optional(),
})

/**
 * Update Agent Template Schema
 */
export const updateAgentSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_()]+$/,
      'Name can only contain letters, numbers, spaces, hyphens, underscores, and parentheses'
    )
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters')
    .max(1024 * 1024, 'Content must be less than 1MB')
    .optional(),
  category: z.enum(agentCategories).optional(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(20, 'Maximum 20 tags allowed')
    .optional(),
  visibility: z.enum(visibilityOptions).optional(),
  behavioral_rules: z
    .string()
    .max(5000, 'Behavioral rules must be less than 5000 characters')
    .optional(),
  example_workflows: z
    .string()
    .max(5000, 'Example workflows must be less than 5000 characters')
    .optional(),
})

/**
 * Rate Agent Schema
 */
export const rateAgentSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review must be less than 1000 characters')
    .optional(),
})

/**
 * Execute Agent Schema
 */
export const executeAgentSchema = z.object({
  context: z.string().max(10000, 'Context must be less than 10KB'),
  parameters: z.record(z.string(), z.any()).optional(),
})

/**
 * Search Agents Schema
 */
export const searchAgentsSchema = z.object({
  query: z.string().max(500, 'Query must be less than 500 characters').optional(),
  category: z.enum(agentCategories).optional(),
  tags: z.array(z.string()).max(10).optional(),
  minRating: z.number().min(0).max(5).optional(),
  sortBy: z.enum(['trending', 'newest', 'rating', 'downloads']).default('trending'),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

/**
 * Helper functions for validation
 */
export function validateCreateAgent(data: unknown) {
  return createAgentSchema.parse(data)
}

export function validateUpdateAgent(data: unknown) {
  return updateAgentSchema.parse(data)
}

export function validateRateAgent(data: unknown) {
  return rateAgentSchema.parse(data)
}

export function validateExecuteAgent(data: unknown) {
  return executeAgentSchema.parse(data)
}

export function validateSearchAgents(data: unknown) {
  return searchAgentsSchema.parse(data)
}
