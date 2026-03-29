import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/agents/publish - Publish a project item as an agent template
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.projectItemId || !body.name || !body.content || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the project item belongs to the user
    const { data: projectItem, error: itemError } = await supabase
      .from('project_items')
      .select('id, user_id')
      .eq('id', body.projectItemId)
      .eq('user_id', user.id)
      .single()

    if (itemError || !projectItem) {
      return NextResponse.json(
        { error: 'Project item not found or unauthorized' },
        { status: 404 }
      )
    }
    
    // Create agent template
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
        visibility: 'public',
        published_at: new Date().toISOString(),
        dependencies: body.dependencies || []
      })
      .select()
      .single()
    
    if (error) {
      console.error('Publish agent error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST /api/agents/publish error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
