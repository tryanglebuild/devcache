// Attachment Content API - Get attachment content for preview

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

    // Get attachment metadata
    const { data: attachment, error: attachmentError } = await supabase
      .from('project_file_attachments')
      .select('id, file_name, file_path, mime_type, user_id')
      .eq('id', id)
      .single()

    if (attachmentError || !attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (attachment.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // For text-based files, fetch content from storage
    const isTextBased =
      attachment.mime_type.startsWith('text/') ||
      attachment.mime_type === 'application/json' ||
      attachment.mime_type === 'application/xml' ||
      attachment.file_name.endsWith('.md') ||
      attachment.file_name.endsWith('.markdown')

    if (!isTextBased) {
      return NextResponse.json({
        error: 'Content preview not available',
        message: 'This file type cannot be previewed as text',
      }, { status: 400 })
    }

    // Download file content from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('project-files')
      .download(attachment.file_path)

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError)
      return NextResponse.json(
        { error: 'Failed to download file content' },
        { status: 500 }
      )
    }

    // Convert blob to text
    const content = await fileData.text()

    return NextResponse.json({
      file_name: attachment.file_name,
      mime_type: attachment.mime_type,
      content,
    })
  } catch (error) {
    console.error('Attachment preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
