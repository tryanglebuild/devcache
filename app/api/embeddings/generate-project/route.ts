// API endpoint to generate embeddings for project items
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/embeddings'

interface ProjectItemEmbeddingRequest {
  project_item_id: string
}

interface ProjectItemEmbeddingResponse {
  success: boolean
  project_item_id: string
  tokens_used: number
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { project_item_id }: ProjectItemEmbeddingRequest = await request.json()

    if (!project_item_id) {
      return NextResponse.json({ error: 'project_item_id is required' }, { status: 400 })
    }

    // Get project item data
    const { data: projectItem, error: fetchError } = await supabase
      .from('project_items')
      .select('id, name, description, content, language_tags, user_id, type')
      .eq('id', project_item_id)
      .single()

    if (fetchError || !projectItem) {
      return NextResponse.json({ error: 'Project item not found' }, { status: 404 })
    }

    // Check if user owns the project item
    if (projectItem.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Skip folders - they don't need embeddings
    if (projectItem.type === 'folder') {
      return NextResponse.json({
        success: true,
        project_item_id,
        tokens_used: 0,
        message: 'Folders do not require embeddings'
      })
    }

    // Prepare content for embedding
    const contentParts = [
      projectItem.name,
      projectItem.description || '',
      projectItem.language_tags?.join(' ') || '',
      (projectItem.content || '').substring(0, 2000), // Limit content length
    ]
    const content = contentParts.filter(Boolean).join(' ')

    // Generate embedding
    const { embedding, tokens } = await generateEmbedding(content)

    // Update project item with embedding
    const { error: updateError } = await supabase
      .from('project_items')
      .update({
        embedding_vector: embedding,
        embedding_updated_at: new Date().toISOString(),
      })
      .eq('id', project_item_id)

    if (updateError) {
      console.error('Error updating project item embedding:', updateError)
      return NextResponse.json({ error: 'Failed to save embedding' }, { status: 500 })
    }

    return NextResponse.json<ProjectItemEmbeddingResponse>({
      success: true,
      project_item_id,
      tokens_used: tokens,
    })
  } catch (error) {
    console.error('Error in generate project item embedding:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
