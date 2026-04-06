// Unified Resource Preview API - Handles both files and folders

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

    console.log('[Preview API] Fetching resource:', id, 'for user:', user.id)

    // Get resource data (can be file or folder)
    const { data: resource, error: resourceError } = await supabase
      .from('project_items')
      .select('id, name, description, content, language_tags, parent_id, type')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    console.log('[Preview API] Resource query result:', { resource, error: resourceError })

    if (resourceError || !resource) {
      console.error('[Preview API] Resource not found:', resourceError)
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Handle based on resource type
    if (resource.type === 'folder') {
      return handleFolderPreview(supabase, resource, id)
    } else if (resource.type === 'file') {
      return handleFilePreview(supabase, resource, id)
    } else {
      return NextResponse.json(
        { error: 'Unknown resource type' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleFolderPreview(supabase: any, folder: any, folderId: string) {
  console.log('[Preview API] Handling folder preview:', folderId)

  // Get folder contents
  const { data: items, error: itemsError } = await supabase
    .from('project_items')
    .select('id, name, type, description, created_at')
    .eq('parent_id', folderId)
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  if (itemsError) {
    console.error('[Preview API] Error fetching folder items:', itemsError)
  }

  const itemCount = items?.length || 0
  const fileCount = items?.filter((i: any) => i.type === 'file').length || 0
  const folderCount = items?.filter((i: any) => i.type === 'folder').length || 0

  // Build preview content
  let previewContent = `# 📁 ${folder.name}\n\n`
  
  if (folder.description) {
    previewContent += `${folder.description}\n\n`
  }

  previewContent += `## Contents\n\n`
  previewContent += `- **Total items**: ${itemCount}\n`
  previewContent += `- **Folders**: ${folderCount}\n`
  previewContent += `- **Files**: ${fileCount}\n\n`

  if (items && items.length > 0) {
    previewContent += `### Items in this folder:\n\n`
    
    items.forEach((item: any) => {
      const icon = item.type === 'folder' ? '📁' : '📄'
      const desc = item.description ? ` - ${item.description}` : ''
      previewContent += `- ${icon} **${item.name}**${desc}\n`
    })
  } else {
    previewContent += `*This folder is empty*\n`
  }

  // Get tags
  const { data: tagData } = await supabase
    .from('project_item_tags')
    .select('tags(name)')
    .eq('project_item_id', folderId)

  const tagNames = tagData?.map((t: any) => t.tags?.name).filter(Boolean) || []
  const allTags = [
    ...(folder.language_tags || []),
    ...tagNames
  ]

  return NextResponse.json({
    name: folder.name,
    description: folder.description,
    content: previewContent,
    language: 'markdown',
    tags: allTags,
    resource_type: 'folder',
    item_count: itemCount,
    file_count: fileCount,
    folder_count: folderCount,
    items: items || [],
  })
}

async function handleFilePreview(supabase: any, file: any, fileId: string) {
  console.log('[Preview API] Handling file preview:', fileId)

  // Get attachments
  const { data: attachments } = await supabase
    .from('project_file_attachments')
    .select('id, file_name, file_size, mime_type, file_path')
    .eq('project_item_id', fileId)

  console.log('[Preview API] Attachments:', attachments)

  // Check if file has content or attachments
  const hasContent = file.content && file.content.trim().length > 0
  const hasAttachments = attachments && attachments.length > 0

  if (!hasContent && !hasAttachments) {
    console.warn('[Preview API] File has no content or attachments:', fileId)
    return NextResponse.json({
      error: 'This file has no content yet',
      message: 'The file exists but does not contain any content or attachments to preview.'
    }, { status: 404 })
  }

  // Get tags
  const { data: tagData } = await supabase
    .from('project_item_tags')
    .select('tags(name)')
    .eq('project_item_id', fileId)

  const tagNames = tagData?.map((t: any) => t.tags?.name).filter(Boolean) || []
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
    resource_type: 'file',
    has_attachments: hasAttachments,
    attachment_count: attachments?.length || 0,
    attachments: attachments || [],
  })
}
