import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/agents/[id]/download - Track download and add to collection
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
    
    // Check if agent exists and is public
    const { data: agent, error: agentError } = await supabase
      .from('agent_templates')
      .select('id, visibility, download_count')
      .eq('id', id)
      .single()
    
    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    
    if (agent.visibility !== 'public') {
      return NextResponse.json(
        { error: 'Agent is not public' },
        { status: 403 }
      )
    }
    
    // Increment download count
    const { error: updateError } = await supabase
      .from('agent_templates')
      .update({ 
        download_count: (agent.download_count || 0) + 1 
      })
      .eq('id', id)
    
    if (updateError) {
      console.error('Update download count error:', updateError)
    }
    
    // Track download in agent_downloads table (if it exists)
    const { error: downloadError } = await supabase
      .from('agent_downloads')
      .insert({
        agent_id: id,
        user_id: user.id
      })
    
    // Ignore unique constraint violations (already downloaded)
    if (downloadError && downloadError.code !== '23505') {
      console.error('Track download error:', downloadError)
      // Don't fail the request if tracking fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Template downloaded successfully'
    })
  } catch (error) {
    console.error('POST /api/agents/[id]/download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
