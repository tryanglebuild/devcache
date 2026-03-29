import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/agents/[id]/restore - Restore deleted template
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
    
    // Get deleted template
    const { data: deletedTemplate, error: fetchError } = await supabase
      .from('deleted_agent_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (fetchError || !deletedTemplate) {
      return NextResponse.json(
        { error: 'Deleted template not found or unauthorized' },
        { status: 404 }
      )
    }
    
    // Restore to agent_templates
    const { data: restoredAgent, error: insertError } = await supabase
      .from('agent_templates')
      .insert({
        id: deletedTemplate.original_agent_id,
        user_id: deletedTemplate.user_id,
        name: deletedTemplate.name,
        description: deletedTemplate.description,
        content: deletedTemplate.content,
        version: deletedTemplate.version,
        category: deletedTemplate.category,
        tags: deletedTemplate.tags,
        visibility: deletedTemplate.visibility,
        download_count: deletedTemplate.download_count,
        rating_average: deletedTemplate.rating_average,
        rating_count: deletedTemplate.rating_count,
        dependencies: deletedTemplate.dependencies,
        created_at: deletedTemplate.created_at,
        updated_at: new Date().toISOString(),
        published_at: deletedTemplate.published_at,
        deleted_at: null
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error restoring template:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    
    // Remove from deleted_agent_templates
    const { error: deleteError } = await supabase
      .from('deleted_agent_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (deleteError) {
      console.error('Error removing from trash:', deleteError)
      // Don't fail the request, template is already restored
    }
    
    return NextResponse.json({
      success: true,
      agent: restoredAgent,
      message: 'Template restored successfully'
    })
  } catch (error) {
    console.error('POST /api/agents/[id]/restore error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
