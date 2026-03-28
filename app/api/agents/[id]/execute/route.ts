import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { executeAgent } from '@/lib/agents/executor'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { parameters = {}, metadata = {} } = body

    // Check if user has this agent in their collection
    const { data: collection } = await supabase
      .from('agent_collections')
      .select('id')
      .eq('user_id', user.id)
      .eq('agent_id', id)
      .single()

    if (!collection) {
      return NextResponse.json(
        { error: 'Agent not in your collection. Please download it first.' },
        { status: 403 }
      )
    }

    // Execute agent
    const result = await executeAgent({
      userId: user.id,
      agentId: id,
      parameters,
      metadata
    })

    if (result.status === 'failed') {
      return NextResponse.json(
        { error: result.error || 'Execution failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      execution_id: result.executionId,
      output: result.output,
      execution_time_ms: result.executionTimeMs
    })
  } catch (error) {
    console.error('Error executing agent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get execution status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const executionId = searchParams.get('execution_id')

    if (!executionId) {
      return NextResponse.json(
        { error: 'execution_id is required' },
        { status: 400 }
      )
    }

    const { data: execution, error } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('id', executionId)
      .eq('user_id', user.id)
      .single()

    if (error || !execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: execution.id,
      status: execution.status,
      output: execution.output_result,
      error: execution.error_message,
      execution_time_ms: execution.execution_time_ms,
      created_at: execution.created_at,
      completed_at: execution.completed_at
    })
  } catch (error) {
    console.error('Error fetching execution:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
