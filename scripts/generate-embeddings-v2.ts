#!/usr/bin/env tsx
/**
 * Generate Embeddings Script v2
 * 
 * Updated version that uses the correct RPC functions and matches
 * the cron job implementation.
 * 
 * Usage:
 *   npm run generate-embeddings-v2
 *   or
 *   tsx scripts/generate-embeddings-v2.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { createHash } from 'crypto'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!OPENROUTER_API_KEY && !OPENAI_API_KEY) {
  console.error('❌ Missing API key for embeddings')
  console.error('Required: OPENROUTER_API_KEY or OPENAI_API_KEY')
  console.error('\nTo get an OpenRouter key: https://openrouter.ai/keys')
  console.error('To get an OpenAI key: https://platform.openai.com/api-keys')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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

async function getPendingItems(limit: number): Promise<PendingItem[]> {
  const { data, error } = await supabase.rpc('get_pending_embeddings', {
    p_limit: limit,
  })

  if (error) {
    throw new Error(`Failed to get pending items: ${error.message}`)
  }

  return data || []
}

async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const useOpenAI = !!OPENAI_API_KEY
  const apiUrl = useOpenAI
    ? 'https://api.openai.com/v1/embeddings'
    : 'https://openrouter.ai/api/v1/embeddings'

  const headers: Record<string, string> = {
    Authorization: `Bearer ${useOpenAI ? OPENAI_API_KEY : OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  }

  if (!useOpenAI) {
    headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    headers['X-Title'] = 'DevCache Script'
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

function prepareContent(item: PendingItem): string {
  const contentParts = [
    item.name,
    item.description || '',
    item.tags?.join(' ') || '',
    (item.content || '').substring(0, 2000),
  ]
  return contentParts.filter(Boolean).join(' ')
}

function generateContentHash(item: PendingItem): string {
  // Generate MD5 hash of content for change detection
  const content = [
    item.name,
    item.description || '',
    item.tags?.join(',') || '',
    item.content || '',
  ].join('|')
  
  return createHash('md5').update(content).digest('hex')
}

async function saveEmbedding(item: PendingItem, embedding: number[]): Promise<void> {
  if (item.type === 'agent') {
    const contentHash = generateContentHash(item)
    
    const { error } = await supabase
      .from('agent_template_embeddings')
      .upsert(
        {
          agent_id: item.id,
          embedding_vector: embedding,
          content_hash: contentHash,
          indexed_at: new Date().toISOString(),
        },
        {
          onConflict: 'agent_id',
        }
      )

    if (error) throw error
  } else if (item.type === 'project') {
    const { error } = await supabase
      .from('project_items')
      .update({
        embedding_vector: embedding,
        embedding_updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    if (error) throw error
  }
}

async function main() {
  const startTime = Date.now()

  console.log('\n' + '='.repeat(60))
  console.log('🚀 EMBEDDING GENERATION')
  console.log('='.repeat(60))
  console.log(`\n📍 Using: ${OPENAI_API_KEY ? 'OpenAI' : 'OpenRouter'}`)
  console.log(`🌐 Referer: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}\n`)

  let totalProcessed = 0
  let succeeded = 0
  let failed = 0
  const errors: string[] = []
  const maxItems = 100

  console.log(`📦 Fetching pending items (max ${maxItems})...\n`)

  const pendingItems = await getPendingItems(maxItems)

  if (pendingItems.length === 0) {
    console.log('✨ No pending items found!')
    console.log('   All embeddings are up to date.\n')
    console.log('='.repeat(60) + '\n')
    return
  }

  console.log(`   Found ${pendingItems.length} items needing embeddings\n`)
  console.log('─'.repeat(60))

  for (const item of pendingItems) {
    totalProcessed++
    const progress = `[${totalProcessed}/${pendingItems.length}]`

    try {
      process.stdout.write(`${progress} Processing ${item.type}: ${item.name}... `)

      // Prepare content
      const content = prepareContent(item)

      // Generate embedding
      const { embedding, tokens } = await generateEmbedding(content)

      // Save to database
      await saveEmbedding(item, embedding)

      succeeded++
      console.log(`✅ (${tokens} tokens)`)

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error: any) {
      failed++
      const errorMsg = `Failed to process ${item.type} ${item.id}: ${error.message}`
      console.log(`❌`)
      console.log(`   Error: ${error.message}`)
      errors.push(errorMsg)
    }
  }

  const executionTime = Date.now() - startTime

  console.log('─'.repeat(60))
  console.log('\n📊 RESULTS:')
  console.log('─'.repeat(60))
  console.log(`   Total processed:  ${totalProcessed}`)
  console.log(`   Succeeded:        ${succeeded} ✅`)
  console.log(`   Failed:           ${failed} ${failed > 0 ? '❌' : ''}`)
  console.log(`   Execution time:   ${executionTime}ms`)

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:')
    console.log('─'.repeat(60))
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`)
    })
  }

  // Log to database
  try {
    const { data: stats } = await supabase.rpc('get_embedding_stats')

    await supabase.rpc('log_embedding_cron_run', {
      p_items_processed: totalProcessed,
      p_items_succeeded: succeeded,
      p_items_failed: failed,
      p_execution_time_ms: executionTime,
      p_error_message: errors.length > 0 ? errors.join('; ') : null,
      p_stats: stats?.[0] || null,
    })

    console.log('\n✅ Run logged to database')
  } catch (error: any) {
    console.warn('\n⚠️  Failed to log run:', error.message)
  }

  console.log('\n' + '='.repeat(60))
  
  if (succeeded === totalProcessed) {
    console.log('✅ All embeddings generated successfully!')
  } else {
    console.log('⚠️  Some embeddings failed to generate')
    console.log('   Check the errors above for details')
  }
  
  console.log('='.repeat(60) + '\n')
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message)
  console.error('\nStack trace:', error.stack)
  process.exit(1)
})
