// Skills Upload API - Upload .md file
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const category = formData.get('category') as string || 'general'
    const tags = formData.get('tags') as string
    const priority = parseInt(formData.get('priority') as string || '0')

    if (!file || !name) {
      return NextResponse.json(
        { error: 'File and name are required' },
        { status: 400 }
      )
    }

    // Validate file extension
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      return NextResponse.json(
        { error: 'Only Markdown files (.md, .markdown) are allowed' },
        { status: 400 }
      )
    }

    // Validate MIME type reported by the browser as a second line of defence
    const allowedMimeTypes = ['text/markdown', 'text/plain', 'text/x-markdown', 'application/octet-stream']
    if (file.type && !allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only Markdown files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 1MB' },
        { status: 400 }
      )
    }

    // Check name uniqueness
    const { data: existing } = await supabase
      .from('user_skills')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A skill with this name already exists' },
        { status: 409 }
      )
    }

    const skillId = crypto.randomUUID()
    const fileName = `${skillId}_${name.toLowerCase().replace(/\s+/g, '-')}.md`
    const filePath = `${user.id}/${fileName}`

    // Read file content
    const content = await file.text()

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('user-skills')
      .upload(filePath, content, {
        contentType: 'text/markdown',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Create database record
    const { data: skill, error: dbError } = await supabase
      .from('user_skills')
      .insert({
        id: skillId,
        user_id: user.id,
        name,
        description,
        file_path: filePath,
        file_size: file.size,
        category,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        priority,
        is_active: true,
      })
      .select()
      .single()

    if (dbError) {
      // Rollback: delete uploaded file
      await supabase.storage.from('user-skills').remove([filePath])
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create skill' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: skill }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
