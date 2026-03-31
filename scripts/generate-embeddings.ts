#!/usr/bin/env tsx
/**
 * Generate Embeddings Script
 * 
 * This script generates embeddings for all existing templates and project items
 * that don't have embeddings yet or have outdated embeddings.
 * 
 * Usage:
 *   npm run generate-embeddings
 *   or
 *   tsx scripts/generate-embeddings.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

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

interface Item {
  id: string
  type: 'template' | 'project'
  name: string
  description: string | null
  content: string | null
  tags: string[]
}

async function getItemsNeedingEmbeddings(limit: number = 10): Promise<Item[]> {
  const { data, error } = await supabase.rpc('get_items_needing_embeddings', {
    p_limit: limit,
    p_type: 'all',
  })

  if (error) {
    throw new Error(`Failed to get items: ${error.message}`)
  }

  return data || []
}

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // Use OpenAI directly if available, otherwise use OpenRouter
  const useOpenAI = !!OPENAI_API_KEY
  const apiUrl = useOpenAI 
    ? 'https://api.openai.com/v1/embeddings'
    : 'https://openrouter.ai/api/v1/embeddings'
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${useOpenAI ? OPENAI_API_KEY : OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  }
  
  // OpenRouter REQUIRES these headers (per official docs)
  if (!useOpenAI) {
    headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    headers['X-Title'] = 'DevCache'
  }
  
  console.log(`   Using ${useOpenAI ? 'OpenAI' : 'OpenRouter'} API...`)
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: useOpenAI ? 'text-embedding-ada-002' : 'openai/text-embedding-ada-002',
      input: texts,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorDetails
    try {
      errorDetails = JSON.parse(errorText)
    } catch {
      errorDetails = { message: errorText }
    }
    
    console.error(`\n❌ API Error Details:`)
    console.error(`   Status: ${response.status}`)
    console.error(`   Message: ${errorDetails.error?.message || errorDetails.message || errorText}`)
    
    throw new Error(`${useOpenAI ? 'OpenAI' : 'OpenRouter'} API error (${response.status}): ${errorDetails.error?.message || errorDetails.message || errorText}`)
  }

  const data = await response.json()
  return data.data.map((item: any) => item.embedding)
}

function prepareContent(item: Item): string {
  const parts = [
    item.name,
    item.description || '',
    item.tags?.join(' ') || '',
    (item.content || '').substring(0, 2000), // Limit content length
  ]
  return parts.filter(Boolean).join(' ')
}

async function batchUpdateEmbeddings(items: Item[], embeddings: number[][]): Promise<void> {
  const embeddingsData = items.map((item, index) => ({
    id: item.id,
    type: item.type,
    embedding: embeddings[index],
  }))

  const { data, error } = await supabase.rpc('batch_update_embeddings', {
    p_embeddings: embeddingsData,
  })

  if (error) {
    throw new Error(`Failed to update embeddings: ${error.message}`)
  }

  console.log(`✅ Updated ${data[0]?.success_count || 0} embeddings`)
  if (data[0]?.error_count > 0) {
    console.warn(`⚠️  ${data[0].error_count} errors occurred`)
  }
}

async function main() {
  console.log('🚀 Starting embedding generation...')
  console.log(`📍 Using: ${OPENAI_API_KEY ? 'OpenAI' : 'OpenRouter'}`)
  console.log(`🌐 Referer: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`)
  console.log(`🔑 API Key: ${OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 20)}...` : 'Not set'}\n`)

  let totalProcessed = 0
  let totalErrors = 0
  let batchNumber = 1
  const batchSize = 20 // Process 20 items at a time
  const maxBatches = 100 // Safety limit to prevent infinite loops

  while (batchNumber <= maxBatches) {
    console.log(`📦 Batch ${batchNumber}: Fetching items...`)

    const items = await getItemsNeedingEmbeddings(batchSize)

    if (items.length === 0) {
      console.log('\n✨ All items have embeddings!')
      break
    }

    console.log(`   Found ${items.length} items needing embeddings`)

    // Prepare content for embedding
    const texts = items.map(prepareContent)

    console.log(`   Generating embeddings...`)
    const embeddings = await generateEmbeddings(texts)

    console.log(`   Updating database...`)
    await batchUpdateEmbeddings(items, embeddings)

    totalProcessed += items.length
    batchNumber++

    // Show progress
    console.log(`   Progress: ${totalProcessed} items processed\n`)

    // Small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  if (batchNumber > maxBatches) {
    console.log('\n⚠️  Reached maximum batch limit!')
    console.log('   This might indicate an issue with the embedding update process.')
    console.log('   Please check the database function and try again.')
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ Embedding generation complete!`)
  console.log(`   Total processed: ${totalProcessed}`)
  console.log(`   Total errors: ${totalErrors}`)
  console.log('='.repeat(50))
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Error:', error.message)
  process.exit(1)
})
