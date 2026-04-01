import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/collections/[id]/tags - Get tags for a template in user's collection
export async function GET(
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
    
    // Join with user_tags to get color and description
    const { data, error } = await supabase
      .from('agent_template_tags')
      .select(`
        id,
        tag_name,
        created_at,
        user_tags!inner (
          name,
          color,
          description
        )
      `)
      .eq('agent_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Get template tags error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Transform data to include tag details
    const tagsWithDetails = data?.map(item => ({
      id: item.id,
      tag_name: item.tag_name,
      created_at: item.created_at,
      color: (item.user_tags as any).color,
      description: (item.user_tags as any).description
    })) || []
    
    return NextResponse.json(tagsWithDetails)
  } catch (error) {
    console.error('GET /api/collections/[id]/tags error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/collections/[id]/tags - Add tag to template
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
    const { tag_name } = body
    
    if (!tag_name || typeof tag_name !== 'string') {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }
    
    // Verify tag exists in user_tags
    const { data: tagExists } = await supabase
      .from('user_tags')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', tag_name.trim())
      .single()
    
    if (!tagExists) {
      return NextResponse.json(
        { error: 'Tag does not exist in your tag library. Create it first in the Tags page.' },
        { status: 404 }
      )
    }
    
    // Insert tag reference (will fail if duplicate due to unique constraint)
    const { data, error } = await supabase
      .from('agent_template_tags')
      .insert({
        user_id: user.id,
        agent_id: id,
        tag_name: tag_name.trim()
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Tag already exists on this template' },
          { status: 409 }
        )
      }
      console.error('Add template tag error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST /api/collections/[id]/tags error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/collections/[id]/tags - Remove tag from template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const tagName = searchParams.get('tag_name')
    
    if (!tagName) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { error } = await supabase
      .from('agent_template_tags')
      .delete()
      .eq('agent_id', id)
      .eq('user_id', user.id)
      .eq('tag_name', tagName)
    
    if (error) {
      console.error('Delete template tag error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/collections/[id]/tags error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
