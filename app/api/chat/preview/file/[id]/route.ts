// File Preview API - Get file content for chat preview modal

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

    console.log('[Preview API] Fetching file:', id, 'for user:', user.id)

    // Get file data
    const { data: file, error: fileError } = await supabase
      .from('project_items')
      .select('id, name, description, content, language_tags, parent_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('type', 'file')
      .single()

    console.log('[Preview API] File query result:', { file, error: fileError })

    if (fileError || !file) {
      console.error('[Preview API] File not found:', fileError)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Get attachments
    const { data: attachments } = await supabase
      .from('project_file_attachments')
      .select('id, file_name, file_size, mime_type, file_path')
      .eq('project_item_id', id)

    console.log('[Preview API] Attachments:', attachments)

    // Check if file has content or attachments
    const hasContent = file.content && file.content.trim().length > 0
    const hasAttachments = attachments && attachments.length > 0

    if (!hasContent && !hasAttachments) {
      console.warn('[Preview API] File has no content or attachments:', id)
      return NextResponse.json({
        error: 'This file has no content yet',
        message: 'The file exists but does not contain any content or attachments to preview.'
      }, { status: 404 })
    }

    // Get tags
    const { data: tagData } = await supabase
      .from('project_item_tags')
      .select('tags(name)')
      .eq('project_item_id', id)

    const tagNames = tagData?.map((t: any) => t.tags?.name).filter(Boolean) || []

    // Combine language_tags and regular tags
    const allTags = [
      ...(file.language_tags || []),
      ...tagNames
    ]

    // Build content for preview
    let previewContent = ''
    
    if (hasContent) {
      previewContent = file.content
    }
    
    if (hasAttachments) {
      const attachmentList = attachments
        .map((att: any) => {
          const sizeKB = (att.file_size / 1024).toFixed(2)
          return `- **${att.file_name}** (${sizeKB} KB) - ${att.mime_type}`
        })
        .join('\n')
      
      const attachmentSection = `\n\n## Attachments\n\nThis file has ${attachments.length} attachment(s):\n\n${attachmentList}`
      
      previewContent = previewContent 
        ? previewContent + attachmentSection 
        : `# File Attachments\n\n${attachmentList}`
    }

    return NextResponse.json({
      name: file.name,
      description: file.description,
      content: previewContent,
      language: file.language_tags?.[0] || 'text',
      tags: allTags,
      project_name: null,
      has_attachments: hasAttachments,
      attachment_count: attachments?.length || 0,
      attachments: attachments || [],
    })
  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
