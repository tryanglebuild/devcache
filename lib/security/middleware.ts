/**
 * Security Middleware
 * 
 * Reusable middleware functions for API route protection
 */

import { NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitIdentifier, getClientIP, type RATE_LIMITS } from './rate-limit'
import { detectMaliciousContent } from './sanitize'

/**
 * Apply rate limiting to API route
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  limitConfig: keyof typeof RATE_LIMITS
) {
  return async (request: Request) => {
    try {
      // Get user ID from request (you'll need to implement this based on your auth)
      const userId = request.headers.get('x-user-id') // Or extract from session
      const ip = getClientIP(request)
      const endpoint = new URL(request.url).pathname

      const identifier = getRateLimitIdentifier(userId, ip, endpoint)
      const limit = await import('./rate-limit').then(m => m.RATE_LIMITS[limitConfig])
      const result = checkRateLimit(identifier, limit)

      if (!result.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            },
          }
        )
      }

      // Add rate limit headers to response
      const response = await handler(request)
      
      response.headers.set('X-RateLimit-Limit', limit.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString())

      return response
    } catch (error) {
      console.error('Rate limit middleware error:', error)
      // Continue without rate limiting on error
      return handler(request)
    }
  }
}

/**
 * Validate request body for malicious content
 */
export async function validateRequestBody(request: Request): Promise<{
  isValid: boolean
  body: any
  errors: string[]
}> {
  try {
    const body = await request.json()
    const errors: string[] = []

    // Check all string values for malicious content
    const checkValue = (value: any, path: string = '') => {
      if (typeof value === 'string') {
        const result = detectMaliciousContent(value)
        if (!result.isSafe) {
          errors.push(`${path}: ${result.reasons.join(', ')}`)
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const [key, val] of Object.entries(value)) {
          checkValue(val, path ? `${path}.${key}` : key)
        }
      }
    }

    checkValue(body)

    return {
      isValid: errors.length === 0,
      body,
      errors,
    }
  } catch (error) {
    return {
      isValid: false,
      body: null,
      errors: ['Invalid JSON format'],
    }
  }
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: Response): Response {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  )
  
  return response
}

/**
 * CORS middleware
 */
export function withCORS(
  handler: (request: Request) => Promise<Response>,
  allowedOrigins: string[] = []
) {
  return async (request: Request) => {
    const origin = request.headers.get('origin')
    const response = await handler(request)

    // Allow configured origins or same origin
    if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Max-Age', '86400')
    }

    return response
  }
}

/**
 * Combine multiple middleware functions
 */
export function compose(...middlewares: Array<(handler: any) => any>) {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}
