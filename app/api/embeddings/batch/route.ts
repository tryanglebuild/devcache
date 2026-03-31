// Batch indexing endpoint for templates
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding, prepareTemplateContent } from '@/lib/ai/embeddings'
import type { EmbeddingBatchRequest, EmbeddingBatchResponse } from '@/types/rag'

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

    const { limit = 10 }: EmbeddingBatchRequest = await request.json()

    // Get templates that need indexing
    const { data: templates, error: fetchError } = await supabase.rpc(
      'get_templates_needing_indexing',
      {
        p_limit: limit,
      }
    )

    if (fetchError) {
      console.error('Error fetching templates:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    if (!templates || templates.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No templates need indexing',
        indexed: 0,
      })
    }

    // Process each template
    const results = []
    let totalTokens = 0

    for (const template of templates) {
      try {
        // Prepare content and generate embedding
        const content = prepareTemplateContent(template)
        const { embedding, tokens } = await generateEmbedding(content)
        totalTokens += tokens

        // Upsert embedding
        const { error: upsertError } = await supabase
          .from('agent_template_embeddings')
          .upsert(
            {
              agent_id: template.agent_id,
              embedding: embedding,
              content_hash: template.current_hash,
              indexed_at: new Date().toISOString(),
            },
            {
              onConflict: 'agent_id',
            }
          )

        if (upsertError) {
          console.error(`Error upserting embedding for ${template.agent_id}:`, upsertError)
          results.push({
            agent_id: template.agent_id,
            success: false,
            error: upsertError.message,
          })
        } else {
          results.push({
            agent_id: template.agent_id,
            name: template.name,
            success: true,
            tokens,
          })
        }
      } catch (error) {
        console.error(`Error processing template ${template.agent_id}:`, error)
        results.push({
          agent_id: template.agent_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length

    return NextResponse.json<EmbeddingBatchResponse>({
      success: true,
      indexed: successCount,
      total: templates.length,
      total_tokens: totalTokens,
      results,
    })
  } catch (error) {
    console.error('Error in batch indexing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
