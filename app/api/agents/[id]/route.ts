import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/agents/[id] - Get agent details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: agent, error } = await supabase
      .from('agent_templates')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }
      console.error('Get agent error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Check if user has this agent in collection
    let isInCollection = false
    let isFavorite = false
    let userRating = null
    
    if (user) {
      const { data: collection } = await supabase
        .from('agent_collections')
        .select('is_favorite')
        .eq('user_id', user.id)
        .eq('agent_id', id)
        .single()
      
      if (collection) {
        isInCollection = true
        isFavorite = collection.is_favorite || false
      }
      
      const { data: rating } = await supabase
        .from('agent_ratings')
        .select('rating')
        .eq('user_id', user.id)
        .eq('agent_id', id)
        .single()
      
      if (rating) {
        userRating = rating.rating
      }
    }
    
    return NextResponse.json({
      ...agent,
      is_in_collection: isInCollection,
      is_favorite: isFavorite,
      user_rating: userRating
    })
  } catch (error) {
    console.error('GET /api/agents/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/agents/[id] - Update agent
export async function PUT(
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
    
    // Update agent
    const { data, error } = await supabase
      .from('agent_templates')
      .update({
        name: body.name,
        description: body.description,
        content: body.content,
        category: body.category,
        tags: body.tags,
        version: body.version,
        visibility: body.visibility,
        dependencies: body.dependencies,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Agent not found or unauthorized' },
          { status: 404 }
        )
      }
      console.error('Update agent error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('PUT /api/agents/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/[id] - Soft delete agent (move to trash)
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
    
    // Get the agent data before deleting
    const { data: agent, error: fetchError } = await supabase
      .from('agent_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (fetchError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      )
    }
    
    // Move to deleted_agent_templates
    const { error: insertError } = await supabase
      .from('deleted_agent_templates')
      .insert({
        original_agent_id: agent.id,
        user_id: agent.user_id,
        name: agent.name,
        description: agent.description,
        content: agent.content,
        version: agent.version,
        category: agent.category,
        tags: agent.tags,
        visibility: agent.visibility,
        download_count: agent.download_count,
        rating_average: agent.rating_average,
        rating_count: agent.rating_count,
        dependencies: agent.dependencies,
        created_at: agent.created_at,
        updated_at: agent.updated_at,
        published_at: agent.published_at,
        deleted_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.error('Error moving to trash:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    
    // Hard delete from agent_templates
    const { error: deleteError } = await supabase
      .from('agent_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (deleteError) {
      console.error('Delete agent error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Template moved to trash. It will be permanently deleted after 30 days.'
    })
  } catch (error) {
    console.error('DELETE /api/agents/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
