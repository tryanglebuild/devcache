// Cron job to generate embeddings for pending items
// Runs weekly to catch any items that were missed during automatic generation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface PendingItem {
  id: string
  type: 'agent' | 'project'
  name: string
  description: string | null
  content: string | null
  tags: string[]
  user_id: string
  created_at: string
  updated_at: string
}

interface EmbeddingResult {
  embedding: number[]
  tokens: number
}

serve(async (req) => {
  const startTime = Date.now()
  
  try {
    // Verify this is a scheduled request or has proper authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { scheduled = false, max_items = 100 } = await req.json()

    console.log(`[Cron] Starting embedding generation (scheduled: ${scheduled})`)

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get pending items
    const { data: pendingItems, error: fetchError } = await supabase
      .rpc('get_pending_embeddings', { p_limit: max_items })

    if (fetchError) {
      throw new Error(`Failed to fetch pending items: ${fetchError.message}`)
    }

    if (!pendingItems || pendingItems.length === 0) {
      console.log('[Cron] No pending items found')
      
      // Log successful run with no items
      await supabase.rpc('log_embedding_cron_run', {
        p_items_processed: 0,
        p_items_succeeded: 0,
        p_items_failed: 0,
        p_execution_time_ms: Date.now() - startTime,
        p_stats: { message: 'No pending items' }
      })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending items',
          processed: 0 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[Cron] Found ${pendingItems.length} pending items`)

    let succeeded = 0
    let failed = 0
    const errors: string[] = []

    // Process each item
    for (const item of pendingItems as PendingItem[]) {
      try {
        console.log(`[Cron] Processing ${item.type}: ${item.name} (${item.id})`)

        // Prepare content
        const contentParts = [
          item.name,
          item.description || '',
          item.tags?.join(' ') || '',
          (item.content || '').substring(0, 2000),
        ]
        const content = contentParts.filter(Boolean).join(' ')

        // Generate embedding
        const { embedding, tokens } = await generateEmbedding(content)

        // Save embedding based on type
        if (item.type === 'agent') {
          const { error: upsertError } = await supabase
            .from('agent_template_embeddings')
            .upsert({
              agent_id: item.id,
              embedding_vector: embedding,
              indexed_at: new Date().toISOString(),
            }, {
              onConflict: 'agent_id'
            })

          if (upsertError) throw upsertError
        } else if (item.type === 'project') {
          const { error: updateError } = await supabase
            .from('project_items')
            .update({
              embedding_vector: embedding,
              embedding_updated_at: new Date().toISOString(),
            })
            .eq('id', item.id)

          if (updateError) throw updateError
        }

        succeeded++
        console.log(`[Cron] ✓ Successfully processed ${item.type}: ${item.name} (${tokens} tokens)`)

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        failed++
        const errorMsg = `Failed to process ${item.type} ${item.id}: ${error.message}`
        console.error(`[Cron] ✗ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    const executionTime = Date.now() - startTime

    // Get final stats
    const { data: stats } = await supabase.rpc('get_embedding_stats')

    // Log the run
    await supabase.rpc('log_embedding_cron_run', {
      p_items_processed: pendingItems.length,
      p_items_succeeded: succeeded,
      p_items_failed: failed,
      p_execution_time_ms: executionTime,
      p_error_message: errors.length > 0 ? errors.join('; ') : null,
      p_stats: stats?.[0] || null
    })

    console.log(`[Cron] Completed: ${succeeded} succeeded, ${failed} failed in ${executionTime}ms`)

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingItems.length,
        succeeded,
        failed,
        execution_time_ms: executionTime,
        errors: errors.length > 0 ? errors : undefined,
        stats: stats?.[0]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Cron] Fatal error:', error)

    const executionTime = Date.now() - startTime

    // Try to log the error
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      await supabase.rpc('log_embedding_cron_run', {
        p_items_processed: 0,
        p_items_succeeded: 0,
        p_items_failed: 0,
        p_execution_time_ms: executionTime,
        p_error_message: error.message
      })
    } catch (logError) {
      console.error('[Cron] Failed to log error:', logError)
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const useOpenAI = !!OPENAI_API_KEY
  const apiUrl = useOpenAI
    ? 'https://api.openai.com/v1/embeddings'
    : 'https://openrouter.ai/api/v1/embeddings'

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${useOpenAI ? OPENAI_API_KEY : OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  }

  if (!useOpenAI) {
    headers['HTTP-Referer'] = SUPABASE_URL
    headers['X-Title'] = 'DevCache Cron'
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: useOpenAI ? 'text-embedding-ada-002' : 'openai/text-embedding-ada-002',
      input: text,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Embedding API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return {
    embedding: data.data[0].embedding,
    tokens: data.usage?.total_tokens || 0,
  }
}
