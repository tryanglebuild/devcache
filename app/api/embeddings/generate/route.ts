// API endpoint to generate (or refresh) the embedding vector for a single agent template.
// Called after template creation/update so the template becomes searchable via RAG.
// Upserts into agent_template_embeddings using onConflict to avoid duplicates.
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding, prepareTemplateContent } from '@/lib/ai/embeddings'
import type { EmbeddingGenerateRequest, EmbeddingGenerateResponse } from '@/types/rag'

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

    const { agent_id }: EmbeddingGenerateRequest = await request.json()

    if (!agent_id) {
      return NextResponse.json({ error: 'agent_id is required' }, { status: 400 })
    }

    // Get template data
    const { data: template, error: fetchError } = await supabase
      .from('agent_templates')
      .select('id, name, description, content, tags, user_id')
      .eq('id', agent_id)
      .single()

    if (fetchError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Check if user owns the template or it's public (allow background generation for own templates)
    if (template.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prepare content and generate embedding
    const content = prepareTemplateContent(template)
    const { embedding, tokens } = await generateEmbedding(content)

    // Generate content hash
    const { data: hashData } = await supabase.rpc('generate_template_content_hash', {
      p_agent_id: agent_id,
    })

    // Upsert embedding
    const { error: upsertError } = await supabase
      .from('agent_template_embeddings')
      .upsert(
        {
          agent_id: agent_id,
          embedding: embedding,
          content_hash: hashData,
          indexed_at: new Date().toISOString(),
        },
        {
          onConflict: 'agent_id',
        }
      )

    if (upsertError) {
      console.error('Error upserting embedding:', upsertError)
      return NextResponse.json({ error: 'Failed to save embedding' }, { status: 500 })
    }

    return NextResponse.json<EmbeddingGenerateResponse>({
      success: true,
      agent_id,
      tokens_used: tokens,
    })
  } catch (error) {
    console.error('Error in generate embedding:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
