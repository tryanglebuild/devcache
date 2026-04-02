/**
 * Example: Secure Agent API Route with Rate Limiting and Validation
 * 
 * This file demonstrates how to use the security middleware
 * Copy this pattern to your actual API routes
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getRateLimitIdentifier, getClientIP, RATE_LIMITS } from '@/lib/security/rate-limit'
import { sanitizeAgentTemplate, detectMaliciousContent } from '@/lib/security/sanitize'
import { validateCreateAgent } from '@/lib/validations/agents'
import { ZodError } from 'zod'

/**
 * GET /api/agents - List agents with rate limiting
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get user for rate limiting
    const { data: { user } } = await supabase.auth.getUser()
    const ip = getClientIP(request)
    const identifier = getRateLimitIdentifier(user?.id || null, ip, '/api/agents')
    
    // Check rate limit
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.API_GENERAL)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000) },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.API_GENERAL.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          }
        }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('agent_templates')
      .select('*', { count: 'exact' })
      .eq('visibility', 'public')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching agents:', error)
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
    }

    return NextResponse.json(
      {
        agents: data,
        total: count,
        limit,
        offset,
        hasMore: offset + limit < (count || 0),
      },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMITS.API_GENERAL.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        }
      }
    )
  } catch (error) {
    console.error('Error in GET /api/agents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/agents - Create agent with validation and sanitization
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const ip = getClientIP(request)
    const identifier = getRateLimitIdentifier(user.id, ip, '/api/agents/create')
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.AGENT_CREATE)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You can create 10 agents per hour.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    let validatedData
    try {
      validatedData = validateCreateAgent(body)
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }
      throw error
    }

    // Sanitize content
    const sanitizedContent = sanitizeAgentTemplate(validatedData.content)
    
    // Check for malicious content
    const securityCheck = detectMaliciousContent(sanitizedContent)
    if (!securityCheck.isSafe) {
      return NextResponse.json(
        { 
          error: 'Content contains potentially malicious patterns',
          reasons: securityCheck.reasons 
        },
        { status: 400 }
      )
    }

    // Create agent
    const { data, error } = await supabase
      .from('agent_templates')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        description: validatedData.description,
        content: sanitizedContent,
        category: validatedData.category,
        tags: validatedData.tags,
        visibility: validatedData.visibility,
        behavioral_rules: validatedData.behavioral_rules,
        example_workflows: validatedData.example_workflows,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating agent:', error)
      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
    }

    // Track analytics
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'template_create',
      event_properties: {
        agent_id: data.id,
        category: data.category,
      },
    })

    return NextResponse.json(
      { agent: data },
      { 
        status: 201,
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        }
      }
    )
  } catch (error) {
    console.error('Error in POST /api/agents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
