import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { AgentSearchFilters } from '@/types/agents.types'
import { triggerAgentEmbedding } from '@/lib/ai/auto-embed'

// GET /api/agents - List agents with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: AgentSearchFilters = {
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      minRating: parseFloat(searchParams.get('minRating') || '0'),
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }
    
    const supabase = await createClient()
    
    // Get agents and total count in parallel
    const [agentsResult, countResult] = await Promise.all([
      supabase.rpc('search_agents', {
        search_query: filters.query || null,
        category_filter: filters.category || null,
        min_rating: filters.minRating || 0,
        limit_count: filters.limit || 20,
        offset_count: filters.offset || 0
      }),
      supabase.rpc('search_agents_count', {
        search_query: filters.query || null,
        category_filter: filters.category || null,
        min_rating: filters.minRating || 0
      })
    ])
    
    if (agentsResult.error) {
      console.error('Search agents error:', agentsResult.error)
      return NextResponse.json({ error: agentsResult.error.message }, { status: 500 })
    }
    
    if (countResult.error) {
      console.error('Count agents error:', countResult.error)
      return NextResponse.json({ error: countResult.error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      agents: agentsResult.data || [],
      total: countResult.data || 0,
      hasMore: (agentsResult.data?.length || 0) === (filters.limit || 20)
    })
  } catch (error) {
    console.error('GET /api/agents error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/agents - Create new agent
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.content || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, content, category' },
        { status: 400 }
      )
    }
    
    // Create agent
    const { data, error } = await supabase
      .from('agent_templates')
      .insert({
        user_id: user.id,
        name: body.name,
        description: body.description || null,
        content: body.content,
        category: body.category,
        tags: body.tags || [],
        version: body.version || '1.0.0',
        visibility: body.visibility || 'private',
        dependencies: body.dependencies || []
      })
      .select()
      .single()
    
    if (error) {
      console.error('Create agent error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Generate embedding automatically in background
    if (data?.id) {
      triggerAgentEmbedding(data.id)
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST /api/agents error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
