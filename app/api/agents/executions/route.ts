import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agent_id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('agent_executions')
      .select(`
        *,
        agent_templates:agent_id (
          id,
          name,
          category,
          version
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (agentId) {
      query = query.eq('agent_id', agentId)
    }

    const { data: executions, error, count } = await query

    if (error) {
      console.error('Error fetching executions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch executions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      executions: executions || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit
    })
  } catch (error) {
    console.error('Error in executions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
