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
      .select('id, visibility')
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
    
    // Track download (will trigger download count increment)
    const { error: downloadError } = await supabase
      .from('agent_downloads')
      .insert({
        agent_id: id,
        user_id: user.id
      })
    
    // Ignore unique constraint violations (already downloaded today)
    if (downloadError && downloadError.code !== '23505') {
      console.error('Track download error:', downloadError)
      return NextResponse.json(
        { error: downloadError.message },
        { status: 500 }
      )
    }
    
    // Add to collection if not already there
    const { error: collectionError } = await supabase
      .from('agent_collections')
      .upsert({
        user_id: user.id,
        agent_id: id,
        is_favorite: false,
        custom_config: {}
      }, {
        onConflict: 'user_id,agent_id',
        ignoreDuplicates: true
      })
    
    if (collectionError) {
      console.error('Add to collection error:', collectionError)
      // Don't fail the request if collection add fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Agent downloaded and added to collection'
    })
  } catch (error) {
    console.error('POST /api/agents/[id]/download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
