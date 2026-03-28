import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/agents/[id]/rate - Rate an agent
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate rating
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }
    
    // Check if agent exists
    const { data: agent, error: agentError } = await supabase
      .from('agent_templates')
      .select('id')
      .eq('id', id)
      .single()
    
    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    
    // Upsert rating (will trigger rating average update)
    const { data, error } = await supabase
      .from('agent_ratings')
      .upsert({
        agent_id: id,
        user_id: user.id,
        rating: body.rating,
        review: body.review || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'agent_id,user_id'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Rate agent error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('POST /api/agents/[id]/rate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/[id]/rate - Delete rating
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { error } = await supabase
      .from('agent_ratings')
      .delete()
      .eq('agent_id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Delete rating error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/agents/[id]/rate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
