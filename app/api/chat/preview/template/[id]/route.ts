// Template Preview API - Get template content for chat preview modal

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get template data — allow public templates or the user's own templates
    const { data: template, error: templateError } = await supabase
      .from('agent_templates')
      .select('id, name, description, content, tags')
      .eq('id', id)
      .is('deleted_at', null)
      .or(`visibility.eq.public,user_id.eq.${user.id}`)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      name: template.name,
      description: template.description,
      content: template.content || 'No content available',
      tags: template.tags || [],
    })
  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
