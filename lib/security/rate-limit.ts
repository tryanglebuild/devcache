/**
 * Rate Limiting Utility
 * 
 * Implements token bucket algorithm for API rate limiting
 * Uses in-memory storage (consider Redis for production)
 */

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Maximum requests per interval
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // No entry or expired - create new
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.interval
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    }
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(identifier, entry)

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Agent operations
  AGENT_CREATE: { interval: 60 * 60 * 1000, maxRequests: 10 }, // 10 per hour
  AGENT_UPDATE: { interval: 60 * 60 * 1000, maxRequests: 30 }, // 30 per hour
  AGENT_DELETE: { interval: 60 * 60 * 1000, maxRequests: 20 }, // 20 per hour
  AGENT_EXECUTE: { interval: 60 * 1000, maxRequests: 20 }, // 20 per minute
  AGENT_RATE: { interval: 60 * 60 * 1000, maxRequests: 50 }, // 50 per hour

  // Embeddings
  EMBEDDING_GENERATE: { interval: 60 * 60 * 1000, maxRequests: 100 }, // 100 per hour
  EMBEDDING_BATCH: { interval: 60 * 60 * 1000, maxRequests: 10 }, // 10 per hour

  // Search
  SEARCH: { interval: 60 * 1000, maxRequests: 60 }, // 60 per minute

  // Auth
  LOGIN: { interval: 15 * 60 * 1000, maxRequests: 5 }, // 5 per 15 minutes
  SIGNUP: { interval: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  PASSWORD_RESET: { interval: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour

  // General API
  API_GENERAL: { interval: 60 * 1000, maxRequests: 100 }, // 100 per minute
} as const

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(
  userId: string | null,
  ip: string | null,
  endpoint: string
): string {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}:${endpoint}`
  }
  // Fall back to IP for anonymous requests
  if (ip) {
    return `ip:${ip}:${endpoint}`
  }
  // Last resort - endpoint only (not recommended for production)
  return `anonymous:${endpoint}`
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string | null {
  // Check common headers for IP (in order of preference)
  const headers = [
    'x-real-ip',
    'x-forwarded-for',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first
      return value.split(',')[0].trim()
    }
  }

  return null
}
