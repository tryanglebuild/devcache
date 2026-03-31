// Template Preview API - Get template content for chat preview modal

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
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

    // Get template data
    const { data: template, error: templateError } = await supabase
      .from('agent_templates')
      .select(
        `
        id,
        name,
        description,
        content,
        language,
        tags
      `
      )
      .eq('id', id)
      .eq('is_published', true)
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
      language: template.language,
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
